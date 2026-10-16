import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import Home from "../../pages/Home";
import Login from "../../pages/Login";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function setSession(role: string) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "u1", name: "Pessoa Teste", email: "p@p.com", role } }));
}

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderAt(url: string) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/painel" element={<Admin />} />
                    <Route path="/plataforma" element={<div>Plataforma Page</div>} />
                </Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const location = () => screen.getByTestId("location").textContent ?? "";

beforeEach(() => localStorage.clear());

describe("Painel do espaço", () => {
    it("is titled 'Painel do espaço' with the stored tenant name", async () => {
        setSession("OWNER");
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" }));
        renderAt("/painel");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/painel do espaço\s*salão jardim das flores/i);
        // OWNER não vê a barra de contexto da plataforma
        expect(screen.queryByText(/como equipe da plataforma/i)).not.toBeInTheDocument();
    });

    it("lets OWNER manage the salon holidays but not the national ones", async () => {
        setSession("OWNER");
        server.use(http.get(`${BASE}/admin/holidays`, () => HttpResponse.json({
            data: [
                { id: "h1", date: "2026-11-15", name: "Proclamação da República", type: "national", scope: "national" },
                { id: "h2", date: "2026-09-08", name: "Aniversário da cidade", type: "municipal", scope: "salon" },
            ],
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        })));
        renderAt("/painel?tab=holidays");
        expect(await screen.findByText("Proclamação da República")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /novo feriado/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /sincronizar feriados/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /remover proclamação/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remover aniversário da cidade/i })).toBeInTheDocument();
        expect(screen.getByText("Do salão")).toBeInTheDocument();
    });

    it("creates a salon holiday as OWNER without the national option", async () => {
        setSession("OWNER");
        let body: Record<string, unknown> | null = null;
        server.use(http.post(`${BASE}/admin/holidays`, async ({ request }) => {
            body = await request.json() as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "h9", ...body, type: "municipal", scope: "salon" } }, { status: 201 });
        }));
        const user = userEvent.setup();
        renderAt("/painel?tab=holidays");
        await user.click(await screen.findByRole("button", { name: /novo feriado/i }));
        expect(screen.queryByLabelText(/vale para/i)).not.toBeInTheDocument();
        await user.type(screen.getByLabelText("Nome"), "Padroeira");
        fireEvent.change(document.querySelector('input[type="date"]')!, { target: { value: "2026-08-15" } });
        await user.click(screen.getByRole("button", { name: /criar feriado/i }));
        await waitFor(() => expect(body).toEqual({ name: "Padroeira", date: "2026-08-15" }));
    });

    it("keeps holiday write actions for ADMIN", async () => {
        setSession("ADMIN");
        renderAt("/painel?tab=holidays");
        expect(await screen.findByRole("button", { name: /novo feriado/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sincronizar feriados nacionais/i })).toBeInTheDocument();
    });

    it("tells OWNER what to do when there are no holidays", async () => {
        setSession("OWNER");
        server.use(http.get(`${BASE}/admin/holidays`, () => HttpResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })));
        renderAt("/painel?tab=holidays");
        expect(await screen.findByText(/adicionar os da sua cidade/i)).toBeInTheDocument();
    });

    it("offers only Cliente/Dono in the users role filter", async () => {
        setSession("OWNER");
        renderAt("/painel?tab=users");
        const select = await screen.findByLabelText("Perfil");
        const labels = Array.from((select as HTMLSelectElement).options).map((o) => o.value);
        expect(labels).toEqual(["", "USER", "OWNER"]);
    });

    it("lets ADMIN go back to the default tenant", async () => {
        setSession("ADMIN");
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "salao-jardim-das-flores", name: "Jardim" }));
        const user = userEvent.setup();
        renderAt("/painel");
        expect(screen.getByText(/como equipe da plataforma/i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /voltar ao espaço padrão/i }));
        expect(localStorage.getItem("festario:tenant")).toBeNull();
        expect(screen.getByText(/painel do espaço padrão/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /ir para a plataforma/i })).toHaveAttribute("href", "/plataforma");
    });
});

describe("Painel - cadastro de espaço (venue)", () => {
    it("OWNER creates a venue with the required base price", async () => {
        setSession("OWNER");
        let body: Record<string, unknown> | null = null;
        let venues: Array<Record<string, unknown>> = [];
        server.use(
            http.get(`${BASE}/venues`, () => HttpResponse.json({ data: venues })),
            http.post(`${BASE}/venues`, async ({ request }) => {
                body = (await request.json()) as Record<string, unknown>;
                venues = [{ id: "v-new", capacity: 120, hasKidsArea: false, hasPool: false, ...body }];
                return HttpResponse.json({ data: venues[0] }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=venues");
        expect(await screen.findByText(/use “\+ novo espaço” para cadastrar o salão/i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "+ Novo espaço" }));
        expect(screen.getByRole("heading", { name: "Novo espaço" })).toBeInTheDocument();
        await user.type(screen.getByLabelText("Nome"), "Salão Novo");
        await user.type(screen.getByLabelText("Capacidade (pessoas)"), "120");
        await user.type(screen.getByLabelText("Preço base (R$/hora)"), "150");
        await user.type(screen.getByLabelText("Cidade"), "Lavras");
        // piscina cobrada marca a comodidade sozinha e trava; as outras o dono escolhe
        await user.click(screen.getByLabelText("Possui piscina"));
        await user.type(screen.getByLabelText("Preço da piscina (R$/dia)"), "100");
        expect(screen.getByRole("checkbox", { name: "Piscina" })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: "Piscina" })).toBeDisabled();
        await user.click(screen.getByRole("checkbox", { name: "Banda / música ao vivo" }));
        await user.click(screen.getByRole("checkbox", { name: "Quadra" }));
        await user.click(screen.getByRole("button", { name: "Criar espaço" }));
        expect(await screen.findByRole("cell", { name: "Salão Novo" })).toBeInTheDocument();
        expect(body).toMatchObject({ name: "Salão Novo", capacity: 120, basePricePerHour: 150, location: "Lavras", hasPool: true, amenities: ["COURT", "LIVE_MUSIC"] });
        expect(screen.getByRole("cell", { name: "Quadra, Banda / música ao vivo" })).toBeInTheDocument();
    });
});

describe("Login com espaço", () => {
    it("stores ?espaco=<slug>, shows it and sends X-Tenant-Slug on login", async () => {
        let header: string | null = null;
        server.use(http.post(`${BASE}/auth/login`, ({ request }) => {
            header = request.headers.get("x-tenant-slug");
            return HttpResponse.json({ data: { token: "t", user: { id: "o", name: "Dona", email: "d@j.com", role: "OWNER" } } });
        }));
        const user = userEvent.setup();
        renderAt("/login?espaco=salao-jardim-das-flores");
        expect(await screen.findByText(/entrando no espaço/i)).toHaveTextContent("salao-jardim-das-flores");
        expect(JSON.parse(localStorage.getItem("festario:tenant")!).slug).toBe("salao-jardim-das-flores");

        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "d@j.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "dono123");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() => expect(location()).toBe("/painel"));
        expect(header).toBe("salao-jardim-das-flores");
    });

    it("can switch back to the default tenant", async () => {
        const user = userEvent.setup();
        renderAt("/login?espaco=salao-jardim-das-flores");
        await user.click(await screen.findByRole("button", { name: /entrar no espaço padrão/i }));
        await waitFor(() => expect(location()).toBe("/login"));
        expect(localStorage.getItem("festario:tenant")).toBeNull();
        expect(screen.queryByText(/entrando no espaço/i)).not.toBeInTheDocument();
    });

    it("rejects an invalid ?espaco", async () => {
        renderAt("/login?espaco=Nao%20Vale");
        expect(await screen.findByText(/endereço do espaço no link é inválido/i)).toBeInTheDocument();
        expect(localStorage.getItem("festario:tenant")).toBeNull();
    });

    it("sends ADMIN to /plataforma after login", async () => {
        server.use(http.post(`${BASE}/auth/login`, () =>
            HttpResponse.json({ data: { token: "t", user: { id: "a", name: "Admin", email: "a@a.com", role: "ADMIN" } } })));
        const user = userEvent.setup();
        renderAt("/login");
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "a@a.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "x");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() => expect(location()).toBe("/plataforma"));
    });
});

describe("Home por papel", () => {
    it("USER has no panel shortcuts", async () => {
        setSession("USER");
        renderAt("/home");
        expect(await screen.findByRole("heading", { name: "Próximas festas" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /abrir painel do espaço/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /abrir plataforma/i })).not.toBeInTheDocument();
    });

    it("OWNER gets the panel shortcut", async () => {
        setSession("OWNER");
        renderAt("/home");
        expect(await screen.findByRole("link", { name: /abrir painel do espaço/i })).toHaveAttribute("href", "/painel");
        expect(screen.queryByRole("link", { name: /abrir plataforma/i })).not.toBeInTheDocument();
        expect(screen.getByText(/ficam no painel/i)).toBeInTheDocument();
    });

    it("ADMIN gets platform and panel shortcuts", async () => {
        setSession("ADMIN");
        renderAt("/home");
        expect(await screen.findByRole("link", { name: /abrir plataforma/i })).toHaveAttribute("href", "/plataforma");
        expect(screen.getByRole("link", { name: /abrir painel do espaço/i })).toHaveAttribute("href", "/painel");
    });
});
