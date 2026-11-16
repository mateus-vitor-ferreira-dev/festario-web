import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config/refreshMode", () => ({ isBodyRefreshMode: vi.fn(() => false) }));

import { PREVIEW_REFRESH_KEY, readSession, SESSION_HINT_KEY, STORAGE_KEY } from "../../config/authStorage";
import { isBodyRefreshMode } from "../../config/refreshMode";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { PrivateRoute } from "../../routes/PrivateRoute";
import api from "../../services/api";
import { canRestoreSession, refreshSession, sessionHeaders } from "../../services/session";
import { seedSession } from "../helpers/session";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const USER = { id: "u1", name: "Mateus", email: "m@m.com", role: "USER", emailVerified: true };

interface SeenRefresh {
    body: Record<string, unknown>;
    headers: Headers;
    credentials: RequestCredentials;
}

/** /auth/refresh que responde com sucesso e guarda o que recebeu. */
function refreshOk(seen: SeenRefresh[], extra: Record<string, unknown> = {}) {
    server.use(
        http.post(`${BASE}/auth/refresh`, async ({ request }) => {
            seen.push({ body: (await request.json()) as Record<string, unknown>, headers: request.headers, credentials: request.credentials });
            return HttpResponse.json({ data: { accessToken: `access-${seen.length}`, user: USER, ...extra } });
        })
    );
}

function Who() {
    const { user, token, isAuthenticated } = useAuth();
    return <div>{isAuthenticated ? `logado:${user?.name}:${token}` : "anonimo"}</div>;
}

function renderApp() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/painel"]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/painel" element={<Who />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.mocked(isBodyRefreshMode).mockReturnValue(false);
});

afterEach(() => vi.mocked(isBodyRefreshMode).mockReturnValue(false));

describe("restaurar a sessão ao abrir a página", () => {
    it("pede o refresh pelo cookie e guarda o access token só em memória", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen);
        localStorage.setItem(SESSION_HINT_KEY, "1");

        renderApp();

        expect(await screen.findByText("logado:Mateus:access-1")).toBeInTheDocument();
        expect(seen).toHaveLength(1);
        expect(seen[0].body).toEqual({});
        expect(seen[0].credentials).toBe("include");
        expect(seen[0].headers.get("x-requested-with")).toBe("festario");
        expect(seen[0].headers.get("x-refresh-mode")).toBeNull();
        expect(JSON.stringify({ ...localStorage })).not.toContain("access-1");
        expect(readSession()?.token).toBe("access-1");
    });

    it("segura a rota protegida enquanto restaura, em vez de mandar para o login", async () => {
        let release!: () => void;
        server.use(
            http.post(`${BASE}/auth/refresh`, async () => {
                await new Promise<void>((resolve) => (release = resolve));
                return HttpResponse.json({ data: { accessToken: "tarde", user: USER } });
            })
        );
        localStorage.setItem(SESSION_HINT_KEY, "1");

        renderApp();

        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
        await waitFor(() => expect(release).toBeDefined());
        release();
        expect(await screen.findByText("logado:Mateus:tarde")).toBeInTheDocument();
    });

    it("sem marcador de login não chama a API e segue anônimo", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen);

        renderApp();

        expect(await screen.findByText("Login Page")).toBeInTheDocument();
        expect(seen).toHaveLength(0);
        expect(canRestoreSession()).toBe(false);
    });

    it("refresh recusado leva ao login e apaga o marcador", async () => {
        localStorage.setItem(SESSION_HINT_KEY, "1");

        renderApp();

        expect(await screen.findByText("Login Page")).toBeInTheDocument();
        expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
    });

    it("sem rede segue anônimo mas guarda o marcador para a próxima vez", async () => {
        server.use(http.post(`${BASE}/auth/refresh`, () => HttpResponse.error()));
        localStorage.setItem(SESSION_HINT_KEY, "1");

        await expect(refreshSession()).resolves.toBeNull();
        expect(localStorage.getItem(SESSION_HINT_KEY)).toBe("1");
    });

    it("resposta sem access token ou sem usuário não abre sessão", async () => {
        server.use(http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ data: { user: USER } })));
        localStorage.setItem(SESSION_HINT_KEY, "1");

        await expect(refreshSession()).resolves.toBeNull();
        expect(readSession()).toBeNull();
        expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
    });

    it("chamadas simultâneas dividem um único refresh (o segundo seria visto como reuso)", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen);
        localStorage.setItem(SESSION_HINT_KEY, "1");

        const [a, b] = await Promise.all([refreshSession(), refreshSession()]);

        expect(seen).toHaveLength(1);
        expect(a).toEqual(b);
    });
});

describe("sessão antiga no localStorage", () => {
    it("troca o refresh token antigo pelo cookie uma única vez e apaga a sessão antiga", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: USER, token: "velho", refreshToken: "rt-legado" }));

        renderApp();

        expect(await screen.findByText("logado:Mateus:access-1")).toBeInTheDocument();
        expect(seen[0].body).toEqual({ refreshToken: "rt-legado" });
        // Fora das prévias a resposta não precisa devolver o token novo: ele vem no cookie.
        expect(seen[0].headers.get("x-refresh-mode")).toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(localStorage.getItem(SESSION_HINT_KEY)).toBe("1");

        await refreshSession();
        expect(seen[1].body).toEqual({});
    });
});

describe("prévias (*.workers.dev)", () => {
    beforeEach(() => vi.mocked(isBodyRefreshMode).mockReturnValue(true));

    it("manda o refresh token da aba no corpo e guarda o novo no sessionStorage", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen, { refreshToken: "rt-novo" });
        sessionStorage.setItem(PREVIEW_REFRESH_KEY, "rt-aba");

        renderApp();

        expect(await screen.findByText("logado:Mateus:access-1")).toBeInTheDocument();
        expect(seen[0].body).toEqual({ refreshToken: "rt-aba" });
        expect(seen[0].headers.get("x-refresh-mode")).toBe("body");
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBe("rt-novo");
        expect(localStorage.getItem(PREVIEW_REFRESH_KEY)).toBeNull();
    });

    it("migra a sessão antiga também pelo corpo", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen, { refreshToken: "rt-novo" });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: USER, token: "velho", refreshToken: "rt-legado" }));

        await refreshSession();

        expect(seen[0].body).toEqual({ refreshToken: "rt-legado" });
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBe("rt-novo");
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("sem refresh token na aba não chama a API", async () => {
        const seen: SeenRefresh[] = [];
        refreshOk(seen);
        localStorage.setItem(SESSION_HINT_KEY, "1");

        expect(canRestoreSession()).toBe(false);
        await expect(refreshSession()).resolves.toBeNull();
        expect(seen).toHaveLength(0);
    });

    it("pede o modo corpo em toda chamada", () => {
        expect(sessionHeaders()).toEqual({ "X-Requested-With": "festario", "X-Refresh-Mode": "body" });
    });

    it("o login guarda o refresh token devolvido no corpo só na aba", async () => {
        server.use(
            http.post(`${BASE}/auth/login`, ({ request }) =>
                HttpResponse.json({
                    data: {
                        token: "t-login",
                        user: USER,
                        ...(request.headers.get("x-refresh-mode") === "body" ? { refreshToken: "rt-login" } : {}),
                    },
                })
            )
        );
        function LoginNow() {
            const { login, isAuthenticated } = useAuth();
            return <button onClick={async () => login((await api.post("/auth/login", {})).data.data)}>{isAuthenticated ? "ok" : "entrar"}</button>;
        }
        render(<AuthProvider><LoginNow /></AuthProvider>);

        screen.getByText("entrar").click();

        expect(await screen.findByText("ok")).toBeInTheDocument();
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBe("rt-login");
    });
});

describe("interceptor do axios", () => {
    it("manda cookie e X-Requested-With em toda chamada, com o Bearer da memória", async () => {
        seedSession({ token: "em-memoria", user: USER });
        let seen: Request | null = null;
        server.use(http.get(`${BASE}/venues`, ({ request }) => {
            seen = request;
            return HttpResponse.json({ data: [] });
        }));

        await api.get("/venues");

        expect(seen!.headers.get("authorization")).toBe("Bearer em-memoria");
        expect(seen!.headers.get("x-requested-with")).toBe("festario");
        expect(api.defaults.withCredentials).toBe(true);
    });

    it("renova o access token vencido pelo cookie e repete as chamadas da fila", async () => {
        seedSession({ token: "vencido", user: USER });
        const seen: SeenRefresh[] = [];
        refreshOk(seen);
        server.use(
            http.get(`${BASE}/venues`, ({ request }) =>
                request.headers.get("authorization") === "Bearer access-1"
                    ? HttpResponse.json({ data: ["ok"] })
                    : HttpResponse.json({ error: { code: "TOKEN_EXPIRED" } }, { status: 401 })
            )
        );

        const [a, b] = await Promise.all([api.get("/venues"), api.get("/venues")]);

        expect(a.data.data).toEqual(["ok"]);
        expect(b.data.data).toEqual(["ok"]);
        expect(seen).toHaveLength(1);
        expect(readSession()?.token).toBe("access-1");
    });

    it("refresh recusado encerra a sessão e vai para o login", async () => {
        const originalLocation = window.location;
        Object.defineProperty(window, "location", { value: { href: "/painel", hostname: "localhost" }, writable: true, configurable: true });
        seedSession({ token: "vencido", user: USER });
        const responseRejected = api.interceptors.response.handlers![0].rejected!;
        const error = { response: { status: 401 }, config: { method: "get", url: "/venues", headers: {} } };

        await expect(responseRejected(error)).rejects.toBe(error);

        expect(readSession()).toBeNull();
        expect(window.location.href).toBe("/login");
        Object.defineProperty(window, "location", { value: originalLocation, writable: true, configurable: true });
    });
});
