import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";
import InviteAccept from "../../pages/InviteAccept";
import { AuthProvider } from "../../contexts/AuthContext";
import { server } from "../mocks/server";
import { INVITE_TOKEN } from "../mocks/handlers";

const BASE = "http://localhost:3000";

function renderAt(token = INVITE_TOKEN) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[`/convite/${token}`]}>
                <Routes>
                    <Route path="/convite/:token" element={<InviteAccept />} />
                    <Route path="/painel" element={<div>Painel Page</div>} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

function inviteWith(status: string) {
    server.use(http.get(`${BASE}/owner-invites/:token`, () =>
        HttpResponse.json({ data: { tenantName: "Salão Jardim das Flores", email: "socia@jardim.com", status, expiresAt: "2026-10-01T10:00:00.000Z" } })));
}

beforeEach(() => localStorage.clear());

describe("InviteAccept - estados", () => {
    it("valid: shows the tenant, the e-mail and the form", async () => {
        renderAt();
        expect(await screen.findByRole("heading", { name: /criar conta de dono/i })).toBeInTheDocument();
        expect(screen.getByText("Salão Jardim das Flores")).toBeInTheDocument();
        expect(screen.getByText("socia@jardim.com")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
        expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    });

    it("expired: explains and asks for a new invite", async () => {
        inviteWith("expired");
        renderAt();
        expect(await screen.findByRole("heading", { name: /convite vencido/i })).toBeInTheDocument();
        expect(screen.getByText(/peça à equipe da plataforma que envie um novo convite/i)).toBeInTheDocument();
        expect(screen.queryByLabelText("Senha")).not.toBeInTheDocument();
    });

    it("accepted: points to the login", async () => {
        inviteWith("accepted");
        renderAt();
        expect(await screen.findByRole("heading", { name: /convite já aceito/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /^entrar$/i })).toHaveAttribute("href", "/login");
    });

    it("revoked: explains it is no longer valid", async () => {
        inviteWith("revoked");
        renderAt();
        expect(await screen.findByRole("heading", { name: /convite cancelado/i })).toBeInTheDocument();
        expect(screen.getByText(/não vale mais/i)).toBeInTheDocument();
    });

    it("not found (404)", async () => {
        renderAt("b".repeat(64));
        expect(await screen.findByRole("heading", { name: /convite não encontrado/i })).toBeInTheDocument();
        expect(screen.getByText(/link foi copiado inteiro/i)).toBeInTheDocument();
    });

    it("malformed token is not found without calling the API", async () => {
        server.use(http.get(`${BASE}/owner-invites/:token`, () => { throw new Error("should not be called"); }));
        renderAt("curto");
        expect(await screen.findByRole("heading", { name: /convite não encontrado/i })).toBeInTheDocument();
    });

    it("load error offers a retry", async () => {
        let calls = 0;
        server.use(http.get(`${BASE}/owner-invites/:token`, () => {
            calls += 1;
            return calls === 1
                ? HttpResponse.json({ error: { message: "boom" } }, { status: 500 })
                : HttpResponse.json({ data: { tenantName: "Jardim", email: "socia@jardim.com", status: "valid", expiresAt: "2026-10-19T10:00:00.000Z" } });
        }));
        const user = userEvent.setup();
        renderAt();
        expect(await screen.findByText(/erro interno do servidor/i, { selector: "p" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /tentar de novo/i }));
        expect(await screen.findByRole("heading", { name: /criar conta de dono/i })).toBeInTheDocument();
    });
});

describe("InviteAccept - aceite", () => {
    it("validates name and password with the sign-up rules and hints", async () => {
        const user = userEvent.setup();
        renderAt();
        await screen.findByLabelText("Nome completo");
        await user.click(screen.getByRole("button", { name: /criar conta e abrir o painel/i }));
        expect(screen.getByText(/informe seu nome completo/i)).toBeInTheDocument();
        expect(screen.getByText(/crie uma senha/i)).toBeInTheDocument();

        await user.type(screen.getByLabelText("Senha"), "abc");
        expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument();
        expect(screen.getByText(/8 caracteres ou mais/i).textContent).toMatch(/pendente/);
        await user.clear(screen.getByLabelText("Senha"));
        await user.type(screen.getByLabelText("Senha"), "Senha@123");
        expect(screen.getByText(/1 letra maiúscula/i).textContent).toMatch(/atendido/);
    });

    it("creates the account, stores session + tenant and lands on /painel", async () => {
        let body: unknown = null;
        server.use(http.post(`${BASE}/owner-invites/:token/accept`, async ({ request }) => {
            body = await request.json();
            return HttpResponse.json({
                data: {
                    user: { id: "o1", name: "Sócia Nova", email: "socia@jardim.com", role: "OWNER", emailVerified: true },
                    token: "owner-token",
                    refreshToken: "owner-refresh",
                    tenant: { id: "tenant-1", slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" },
                },
            }, { status: 201 });
        }));
        const user = userEvent.setup();
        renderAt();
        await user.type(await screen.findByLabelText("Nome completo"), "Sócia Nova");
        await user.type(screen.getByLabelText("Senha"), "Senha@123");
        await user.click(screen.getByRole("button", { name: /criar conta e abrir o painel/i }));

        expect(await screen.findByText("Painel Page")).toBeInTheDocument();
        expect(body).toEqual({ name: "Sócia Nova", password: "Senha@123" });
        const session = JSON.parse(localStorage.getItem("festario:userData")!);
        expect(session.user.role).toBe("OWNER");
        expect(session.token).toBe("owner-token");
        expect(JSON.parse(localStorage.getItem("festario:tenant")!)).toEqual({ slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" });
    });

    it("switches to the expired state when the API says INVITE_EXPIRED", async () => {
        server.use(http.post(`${BASE}/owner-invites/:token/accept`, () =>
            HttpResponse.json({ error: { code: "INVITE_EXPIRED", message: "x" } }, { status: 409 })));
        const user = userEvent.setup();
        renderAt();
        await user.type(await screen.findByLabelText("Nome completo"), "Sócia Nova");
        await user.type(screen.getByLabelText("Senha"), "Senha@123");
        await user.click(screen.getByRole("button", { name: /criar conta e abrir o painel/i }));
        expect(await screen.findByRole("heading", { name: /convite vencido/i })).toBeInTheDocument();
    });

    it("explains EMAIL_ALREADY_IN_USE inline", async () => {
        server.use(http.post(`${BASE}/owner-invites/:token/accept`, () =>
            HttpResponse.json({ error: { code: "EMAIL_ALREADY_IN_USE", message: "x" } }, { status: 409 })));
        const user = userEvent.setup();
        renderAt();
        await user.type(await screen.findByLabelText("Nome completo"), "Sócia Nova");
        await user.type(screen.getByLabelText("Senha"), "Senha@123");
        await user.click(screen.getByRole("button", { name: /criar conta e abrir o painel/i }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/já tem uma conta/i);
    });

    it("warns that an existing session will be replaced", async () => {
        localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "a", name: "Admin", email: "admin@x.com", role: "ADMIN" } }));
        renderAt();
        expect(await screen.findByText(/você está conectado como/i)).toHaveTextContent("admin@x.com");
    });

    it("shows TENANT_INACTIVE guidance", async () => {
        server.use(http.post(`${BASE}/owner-invites/:token/accept`, () =>
            HttpResponse.json({ error: { code: "TENANT_INACTIVE", message: "x" } }, { status: 403 })));
        const user = userEvent.setup();
        renderAt();
        await user.type(await screen.findByLabelText("Nome completo"), "Sócia Nova");
        await user.type(screen.getByLabelText("Senha"), "Senha@123");
        await user.click(screen.getByRole("button", { name: /criar conta e abrir o painel/i }));
        await waitFor(() => expect(screen.getAllByText(/espaço está desativado/i).length).toBeGreaterThan(0));
    });
});
