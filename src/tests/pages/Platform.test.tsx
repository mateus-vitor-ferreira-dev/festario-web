import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";
import Platform from "../../pages/Platform";
import TenantDetail from "../../pages/Platform/TenantDetail";
import { slugify, validateSlug } from "../../pages/Platform/constants";
import { AuthProvider } from "../../contexts/AuthContext";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderAt(url: string) {
    localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: { id: "admin-1", name: "Admin", email: "a@a.com", role: "ADMIN" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/plataforma" element={<Platform />} />
                    <Route path="/plataforma/espacos/:slug" element={<TenantDetail />} />
                    <Route path="/painel" element={<div>Painel Page</div>} />
                </Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const location = () => screen.getByTestId("location").textContent ?? "";

beforeEach(() => localStorage.clear());

describe("slug helpers", () => {
    it("suggests kebab-case without accents", () => {
        expect(slugify("Salão Jardim das Flores!")).toBe("salao-jardim-das-flores");
        expect(slugify("  Espaço   Ó  ")).toBe("espaco-o");
    });

    it("validates like the API", () => {
        expect(validateSlug("")).toMatch(/informe/i);
        expect(validateSlug("ab")).toMatch(/3 caracteres/i);
        expect(validateSlug("a".repeat(64))).toMatch(/63/);
        expect(validateSlug("Com Espaço")).toMatch(/minúsculas/i);
        expect(validateSlug("admin")).toMatch(/reservado/i);
        expect(validateSlug("salao-ok")).toBeNull();
    });
});

describe("Plataforma - lista de espaços", () => {
    it("shows each tenant with stats and pt-BR revenue", async () => {
        renderAt("/plataforma");
        expect(await screen.findByRole("link", { name: "Salão Jardim das Flores" })).toHaveAttribute("href", "/plataforma/espacos/salao-jardim-das-flores");
        const row = screen.getByRole("link", { name: "Recanto Vila Rica" }).closest("tr")!;
        expect(within(row).getByText("Desativado")).toBeInTheDocument();
        expect(within(row).getByText("48")).toBeInTheDocument();
        expect(within(row).getByText(/R\$\s?28\.190,50/)).toBeInTheDocument();
        expect(screen.getByText("2 estabelecimentos")).toBeInTheDocument();
    });

    it("searches by q and filters by situation (isActive)", async () => {
        const seen: string[] = [];
        server.use(http.get(`${BASE}/platform/tenants`, ({ request }) => {
            seen.push(new URL(request.url).search);
            return HttpResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma?q=jardim&status=inactive");
        expect(await screen.findByText(/nenhum estabelecimento com esses filtros/i)).toBeInTheDocument();
        expect(seen.at(-1)).toContain("q=jardim");
        expect(seen.at(-1)).toContain("isActive=false");
        await user.click(screen.getAllByRole("button", { name: /limpar filtros/i })[0]);
        await waitFor(() => expect(location()).toBe("/plataforma"));
        expect(await screen.findByText(/nenhum estabelecimento cadastrado/i)).toBeInTheDocument();
    });

    it("creates a tenant with the suggested slug and opens its detail", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(http.post(`${BASE}/platform/tenants`, async ({ request }) => {
            body = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "t-new", isActive: true, ...body } }, { status: 201 });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma");
        await screen.findByRole("link", { name: "Salão Jardim das Flores" });

        await user.click(screen.getByRole("button", { name: /novo estabelecimento/i }));
        const dialog = screen.getByRole("dialog");
        await user.type(within(dialog).getByLabelText("Nome do estabelecimento"), "Buffet Ípê Amarelo");
        expect(within(dialog).getByLabelText("Endereço (slug)")).toHaveValue("buffet-ipe-amarelo");
        await user.selectOptions(within(dialog).getByLabelText("Plano"), "PRO");
        await user.click(within(dialog).getByRole("button", { name: /cadastrar estabelecimento/i }));

        await waitFor(() => expect(location()).toBe("/plataforma/espacos/buffet-ipe-amarelo"));
        expect(body).toEqual({ name: "Buffet Ípê Amarelo", slug: "buffet-ipe-amarelo", plan: "PRO" });
    });

    it("keeps an edited slug and shows the conflict inline (409)", async () => {
        server.use(http.post(`${BASE}/platform/tenants`, () =>
            HttpResponse.json({ error: { code: "TENANT_SLUG_IN_USE", message: "in use" } }, { status: 409 })));
        const user = userEvent.setup();
        renderAt("/plataforma");
        await screen.findByRole("link", { name: "Salão Jardim das Flores" });
        await user.click(screen.getByRole("button", { name: /novo estabelecimento/i }));
        const dialog = screen.getByRole("dialog");
        const slug = within(dialog).getByLabelText("Endereço (slug)");
        await user.type(slug, "meu-salao");
        await user.type(within(dialog).getByLabelText("Nome do estabelecimento"), "Outro nome");
        expect(slug).toHaveValue("meu-salao");
        await user.click(within(dialog).getByRole("button", { name: /cadastrar estabelecimento/i }));
        expect(await within(dialog).findByText(/já existe um estabelecimento com esse endereço/i)).toBeInTheDocument();
    });

    it("validates the form before calling the API", async () => {
        const user = userEvent.setup();
        renderAt("/plataforma");
        await screen.findByRole("link", { name: "Salão Jardim das Flores" });
        await user.click(screen.getByRole("button", { name: /novo estabelecimento/i }));
        const dialog = screen.getByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: /cadastrar estabelecimento/i }));
        expect(within(dialog).getByText(/informe o nome do estabelecimento/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/informe o endereço \(slug\)/i)).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: /cancelar/i }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("deactivates a tenant only after confirming", async () => {
        let patch: Record<string, unknown> | null = null;
        server.use(http.patch(`${BASE}/platform/tenants/:id`, async ({ request }) => {
            patch = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "tenant-1", isActive: false } });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma");
        await user.click(await screen.findByRole("button", { name: "Desativar Salão Jardim das Flores" }));
        const dialog = screen.getByRole("alertdialog");
        expect(within(dialog).getByText(/sai do ar/i)).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: /desativar estabelecimento/i }));
        await waitFor(() => expect(patch).toEqual({ isActive: false }));
        expect(await screen.findByText(/foi desativado/i)).toBeInTheDocument();
    });

    it("reactivates an inactive tenant", async () => {
        let patch: Record<string, unknown> | null = null;
        server.use(http.patch(`${BASE}/platform/tenants/:id`, async ({ request }) => {
            patch = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "tenant-2", isActive: true } });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma");
        await user.click(await screen.findByRole("button", { name: "Reativar Recanto Vila Rica" }));
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: /reativar estabelecimento/i }));
        await waitFor(() => expect(patch).toEqual({ isActive: true }));
    });
});

describe("Plataforma - detalhe e convites", () => {
    it("shows stats, invites with status chips and the owner login link", async () => {
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        expect(await screen.findByRole("heading", { name: "Salão Jardim das Flores" })).toBeInTheDocument();
        expect(screen.getByText(/R\$\s?3\.320,00/)).toBeInTheDocument();
        expect(screen.getByText(/\/login\?espaco=salao-jardim-das-flores/)).toBeInTheDocument();

        const table = await screen.findByRole("table");
        expect(within(table).getByText("Pendente")).toBeInTheDocument();
        expect(within(table).getByText("Vencido")).toBeInTheDocument();
        expect(within(table).getByText("Aceito")).toBeInTheDocument();
        expect(within(table).getByText("Revogado")).toBeInTheDocument();
        // só o convite válido pode ser revogado
        expect(within(table).getAllByRole("button", { name: /revogar convite/i })).toHaveLength(1);
    });

    it("invites an owner and shows the dev inviteUrl with copy", async () => {
        let body: unknown = null;
        server.use(http.post(`${BASE}/platform/tenants/:id/invites`, async ({ request }) => {
            body = await request.json();
            return HttpResponse.json({
                data: {
                    invite: { id: "inv-9", tenantId: "tenant-1", email: "nova@jardim.com", status: "valid", expiresAt: "2026-10-20T10:00:00.000Z" },
                    emailSent: false,
                    inviteUrl: "http://localhost:5173/convite/abc",
                },
            }, { status: 201 });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        await screen.findByRole("heading", { name: "Salão Jardim das Flores" });

        await user.click(screen.getByRole("button", { name: /convidar dono/i }));
        expect(screen.getByText(/informe um e-mail válido/i)).toBeInTheDocument();

        await user.type(screen.getByLabelText("E-mail do dono"), "Nova@Jardim.com");
        await user.click(screen.getByRole("button", { name: /convidar dono/i }));

        expect(await screen.findByText("http://localhost:5173/convite/abc")).toBeInTheDocument();
        expect(body).toEqual({ email: "nova@jardim.com" });
        expect(screen.getByText(/o e-mail não está configurado/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /copiar link do convite/i }));
        expect(await screen.findByText("Link copiado.")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /^fechar$/i }));
        expect(screen.queryByText("http://localhost:5173/convite/abc")).not.toBeInTheDocument();
    });

    it("explains when the invited e-mail already has an account (409)", async () => {
        server.use(http.post(`${BASE}/platform/tenants/:id/invites`, () =>
            HttpResponse.json({ error: { code: "EMAIL_ALREADY_IN_USE", message: "x" } }, { status: 409 })));
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        await user.type(await screen.findByLabelText("E-mail do dono"), "dono@jardim.com");
        await user.click(screen.getByRole("button", { name: /convidar dono/i }));
        expect(await screen.findByText(/já tem uma conta\. use outro/i)).toBeInTheDocument();
    });

    it("revokes a valid invite after confirming", async () => {
        let revoked = "";
        server.use(http.delete(`${BASE}/platform/tenants/:id/invites/:inviteId`, ({ params }) => {
            revoked = String(params.inviteId);
            return HttpResponse.json({ data: { id: params.inviteId, status: "revoked" } });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        await user.click(await screen.findByRole("button", { name: "Revogar convite de socia@jardim.com" }));
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: /revogar convite/i }));
        await waitFor(() => expect(revoked).toBe("inv-1"));
        expect(await screen.findByText(/convite de socia@jardim.com revogado/i)).toBeInTheDocument();
    });

    it("filters invites by status through the URL", async () => {
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        await screen.findByRole("table");
        await user.selectOptions(screen.getByLabelText("Situação"), "expired");
        await waitFor(() => expect(location()).toContain("status=expired"));
        await waitFor(() => expect(screen.queryByText("socia@jardim.com")).not.toBeInTheDocument());
        expect(screen.getByText("antigo@jardim.com")).toBeInTheDocument();
    });

    it("shows guidance when there are no invites yet", async () => {
        server.use(http.get(`${BASE}/platform/tenants/:id/invites`, () =>
            HttpResponse.json({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } })));
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        expect(await screen.findByText(/nenhum convite enviado/i)).toBeInTheDocument();
    });

    it("opens the tenant panel storing the tenant for X-Tenant-Slug", async () => {
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        await user.click(await screen.findByRole("button", { name: /abrir painel do espaço/i }));
        expect(await screen.findByText("Painel Page")).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem("recanto:tenant")!)).toEqual({ slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" });
    });

    it("disables panel and invites for an inactive tenant", async () => {
        renderAt("/plataforma/espacos/recanto-vila-rica");
        expect(await screen.findByRole("button", { name: /abrir painel do espaço/i })).toBeDisabled();
        expect(screen.getByText(/este estabelecimento está desativado/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /convidar dono/i })).toBeDisabled();
    });

    it("shows not found for an unknown slug", async () => {
        renderAt("/plataforma/espacos/nao-existe");
        expect(await screen.findByText(/estabelecimento não encontrado/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /voltar para a plataforma/i })).toHaveAttribute("href", "/plataforma");
    });

    it("shows a retry when loading fails", async () => {
        let calls = 0;
        server.use(http.get(`${BASE}/platform/tenants`, () => {
            calls += 1;
            return calls === 1
                ? HttpResponse.json({ error: { message: "boom" } }, { status: 500 })
                : HttpResponse.json({ data: [{ id: "tenant-1", slug: "salao-jardim-das-flores", name: "Jardim", plan: "FREE", isActive: true }], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } });
        }));
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");
        expect(await screen.findByText(/não foi possível carregar o estabelecimento/i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /tentar de novo/i }));
        expect(await screen.findByRole("heading", { name: "Jardim" })).toBeInTheDocument();
    });
});
