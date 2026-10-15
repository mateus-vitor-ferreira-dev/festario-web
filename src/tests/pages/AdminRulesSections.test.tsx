import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderAt(url: string) {
    localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "dono@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/painel" element={<Admin />} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const item = (over: Record<string, unknown> = {}) => ({
    id: "it-1", key: null, name: "Pula-pula", description: null, chargeType: "FIXED", unitPrice: "150.00",
    minQuantity: null, maxQuantity: null, isActive: true, sortOrder: 0, _count: { packages: 2 }, ...over,
});

const pkg = (over: Record<string, unknown> = {}) => ({
    id: "pkg-1", venueId: "v1", venue: { id: "v1", name: "Salão principal" }, code: null, name: "Sábado", description: "Festa à tarde", sortOrder: 1, isActive: true,
    basePriceAmount: "1200.00", validWeekdays: [6], validOnHolidays: true, earliestStartMinute: 600, latestEndMinute: 1500,
    minDurationMinutes: 120, maxDurationMinutes: 300, minGuests: 10, maxGuests: 120, keyDeliveryOffsetHours: 2,
    activeFrom: null, activeTo: null,
    items: [
        { mode: "INCLUDED", includedQuantity: 3, item: { id: "it-h", key: "kids_monitor", name: "Monitor", chargeType: "PER_HOUR", unitPrice: "40.00", isActive: true } },
        { mode: "OPTIONAL", includedQuantity: null, item: { id: "it-g", key: "buffet", name: "Buffet", chargeType: "PER_GUEST", unitPrice: "30.00", isActive: true } },
    ],
    ...over,
});

const ITEMS = [
    item({ id: "it-h", key: "kids_monitor", name: "Monitor", chargeType: "PER_HOUR", unitPrice: "40.00" }),
    item({ id: "it-g", key: "buffet", name: "Buffet", chargeType: "PER_GUEST", unitPrice: "30.00" }),
];

const SETTINGS = {
    slug: "salao", name: "Salão das Flores", timezone: "America/Sao_Paulo", city: "Lavras", state: "MG",
    paymentHoldMinutes: 60, effectivePaymentHoldMinutes: 60, minLeadHours: 48, maxAdvanceDays: 365,
    cancellationPolicy: { tiers: [{ minDays: 30, percentage: 100 }, { minDays: 0, percentage: 0 }], notes: "Remarcação grátis", isDefault: false, summary: [] },
    address: "Rua A, 1", contactPhone: null, contactWhatsapp: "(35) 99999-0000", contactEmail: "a@b.com", instagram: "@salao",
    legalName: null, documentNumber: null, chatbotFaq: null,
    depositPercent: null, balanceDueDays: null, paymentInstructions: null,
};

const clause = (over: Record<string, unknown> = {}) => ({
    id: "c1", key: null, title: "Som", body: "Som até {{horario}}.", fineAmount: null, timeLimit: "22:00", sortOrder: 0, isActive: true, rendered: "Som até 22:00.", ...over,
});

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

describe("Pacotes", () => {
    function withPackages(list: unknown[]) {
        const calls: { method: string; url: string; body: unknown }[] = [];
        const record = async ({ request }: { request: Request }) => {
            calls.push({ method: request.method, url: new URL(request.url).pathname, body: request.method === "DELETE" ? null : await request.json() });
            return HttpResponse.json({ data: pkg() });
        };
        server.use(
            http.get(`${BASE}/admin/plans`, () => HttpResponse.json({ data: list })),
            http.get(`${BASE}/admin/items`, () => HttpResponse.json({ data: ITEMS })),
            http.get(`${BASE}/venues`, () => HttpResponse.json({ data: [{ id: "v1", name: "Salão principal" }] })),
            http.patch(`${BASE}/admin/plans/:id`, record),
            http.post(`${BASE}/admin/plans`, record),
            http.delete(`${BASE}/admin/plans/:id`, record),
        );
        return calls;
    }

    it("toggles, duplicates, reorders and deletes packages", async () => {
        const calls = withPackages([pkg(), pkg({ id: "pkg-2", name: "Domingo", sortOrder: 1, isActive: false, venue: null, venueId: null })]);
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        expect(await screen.findByText(/desativado: não aparece/i)).toBeInTheDocument();
        expect(screen.getAllByText(/adicionais: buffet/i)).toHaveLength(2);

        await user.click(screen.getAllByRole("button", { name: "Desativar" })[0]);
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/plans/pkg-1", body: { isActive: false } }));

        await user.click(screen.getAllByRole("button", { name: "Duplicar" })[0]);
        await waitFor(() => expect(calls.some((c) => c.method === "POST" && (c.body as { name: string }).name === "Sábado (cópia)")).toBe(true));
        const copy = calls.find((c) => c.method === "POST")!.body as Record<string, unknown>;
        expect(copy).toMatchObject({ isActive: false, sortOrder: 2, items: [{ itemId: "it-h", mode: "INCLUDED", includedQuantity: 3 }, { itemId: "it-g", mode: "OPTIONAL" }] });

        await user.click(await screen.findByRole("button", { name: "Descer Sábado na ordem" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/plans/pkg-2", body: { sortOrder: 0 } }));
        expect(calls).toContainEqual({ method: "PATCH", url: "/admin/plans/pkg-1", body: { sortOrder: 1 } });

        await user.click(screen.getAllByRole("button", { name: "Excluir" })[1]);
        await waitFor(() => expect(calls).toContainEqual({ method: "DELETE", url: "/admin/plans/pkg-2", body: null }));
    });

    it("edits a package with its hours, guests and items", async () => {
        const calls = withPackages([pkg()]);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        await user.click(await screen.findByRole("button", { name: "Editar" }));

        expect(screen.getByRole("heading", { name: "Editar Sábado" })).toBeInTheDocument();
        const preview = screen.getByRole("complementary", { name: /prévia do pacote/i });
        expect(within(preview).getByText(/monitor \(3h\)/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "dom" }));
        await user.click(screen.getByRole("checkbox", { name: /vale em feriados/i }));
        const min = screen.getByLabelText(/duração mínima/i);
        await user.clear(min);
        await user.type(min, "6");
        await user.click(screen.getByRole("button", { name: "Salvar pacote" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/duração mínima não pode passar da máxima/i);

        await user.clear(min);
        await user.type(min, "2");
        const maxGuests = screen.getByLabelText("Máximo");
        await user.clear(maxGuests);
        await user.type(maxGuests, "150");
        await user.clear(screen.getByLabelText("Horas inclusas"));
        await user.click(within(screen.getByRole("radiogroup", { name: /buffet neste pacote/i })).getByRole("radio", { name: "Não tem" }));
        await user.click(screen.getByRole("button", { name: "Salvar pacote" }));

        await waitFor(() => expect(calls.find((c) => c.method === "PATCH")).toBeDefined());
        expect(calls.find((c) => c.method === "PATCH")!.body).toMatchObject({
            validWeekdays: [6, 0], validOnHolidays: false, minDurationMinutes: 120, maxDurationMinutes: 300, maxGuests: 150,
            earliestStartMinute: 600, latestEndMinute: 1500, venueId: "v1",
            items: [{ itemId: "it-h", mode: "INCLUDED", includedQuantity: null }],
        });
    });

    it("checks the time window and guest limits before saving", async () => {
        withPackages([pkg({ latestEndMinute: 1080 })]);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        await user.click(await screen.findByRole("button", { name: "Editar" }));
        fireEvent.change(screen.getByLabelText("Termina até"), { target: { value: "09:00" } });
        const minGuests = screen.getByLabelText("Mínimo");
        await user.clear(minGuests);
        await user.type(minGuests, "500");
        const name = screen.getByLabelText("Nome");
        await user.clear(name);
        await user.click(screen.getByRole("button", { name: "Salvar pacote" }));
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(/dê um nome/i);
        expect(alert).toHaveTextContent(/término precisa ser depois do início/i);
        expect(alert).toHaveTextContent(/mínimo de convidados/i);
        await user.click(screen.getByRole("button", { name: "Voltar aos pacotes" }));
        expect(await screen.findByRole("button", { name: "Novo pacote" })).toBeInTheDocument();
    });

    it("shows the API error when saving fails", async () => {
        withPackages([]);
        server.use(http.post(`${BASE}/admin/plans`, () => HttpResponse.json({ message: "Nome já usado" }, { status: 409 })));
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        await user.click(await screen.findByRole("button", { name: /^criar pacote$/i }));
        await user.type(screen.getByLabelText("Nome"), "Sábado");
        await user.type(screen.getByLabelText("Preço (R$)"), "1000");
        await user.click(screen.getAllByRole("button", { name: "sáb" })[0]);
        await user.click(screen.getByRole("button", { name: /^criar pacote$/i }));
        expect(await screen.findByRole("alert")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(await screen.findByRole("list", { name: /primeiros passos/i })).toBeInTheDocument();
    });
});

describe("Itens e adicionais", () => {
    it("offers a ready item, edits price, deletes and creates an own item", async () => {
        const calls: { method: string; url: string; body: unknown }[] = [];
        const record = async ({ request }: { request: Request }) => {
            calls.push({ method: request.method, url: new URL(request.url).pathname, body: request.method === "DELETE" ? null : await request.json() });
            return HttpResponse.json({ data: item() });
        };
        server.use(
            http.get(`${BASE}/admin/items`, () => HttpResponse.json({ data: [item({ id: "it-h", key: "kids_monitor", name: "Monitor", chargeType: "PER_HOUR", unitPrice: "0" }), item({ isActive: false })] })),
            http.get(`${BASE}/admin/items/templates`, () => HttpResponse.json({ data: [
                { key: "kids_monitor", name: "Monitor", chargeType: "PER_HOUR", description: null, itemId: "it-h" },
                { key: "buffet", name: "Buffet", chargeType: "PER_GUEST", description: null, itemId: null },
            ] })),
            http.post(`${BASE}/admin/items`, record),
            http.patch(`${BASE}/admin/items/:id`, record),
            http.delete(`${BASE}/admin/items/:id`, record),
        );
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=items");

        expect(await screen.findByText("Sem custo")).toBeInTheDocument();
        expect(screen.getByText(/R\$\s?150,00 \(pausado\)/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Oferecer Buffet" }));
        await user.click(screen.getByRole("button", { name: "Oferecer" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/informe o preço/i);
        await user.type(screen.getByLabelText(/preço \(r\$\)/i), "35,5");
        await user.click(screen.getByRole("button", { name: "Oferecer" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "POST", url: "/admin/items", body: { key: "buffet", unitPrice: 35.5, minQuantity: null, maxQuantity: null } }));

        await user.click(screen.getByRole("button", { name: "Editar preço de Monitor" }));
        await user.type(screen.getByLabelText(/preço \(r\$\)/i), "{selectall}50");
        await user.type(screen.getByLabelText(/mínimo de horas/i), "4");
        await user.type(screen.getByLabelText(/máximo de horas/i), "2");
        await user.click(screen.getByRole("button", { name: "Salvar" }));
        expect(await screen.findByText(/mínimo de horas não pode passar/i)).toBeInTheDocument();
        await user.clear(screen.getByLabelText(/máximo de horas/i));
        await user.click(screen.getByRole("button", { name: "Salvar" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/items/it-h", body: { unitPrice: 50, minQuantity: 4, maxQuantity: null } }));

        await user.click(screen.getByRole("button", { name: "Reativar Pula-pula" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/items/it-1", body: { isActive: true } }));

        await user.click(screen.getByRole("button", { name: "Excluir Pula-pula" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "DELETE", url: "/admin/items/it-1", body: null }));
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("sai de 2 pacotes"));

        await user.click(screen.getByRole("button", { name: "Criar item próprio" }));
        await user.click(screen.getByRole("button", { name: "Criar item" }));
        expect(await screen.findByText(/dê um nome ao item/i)).toBeInTheDocument();
        await user.type(screen.getByLabelText("Nome"), "Fotógrafo");
        await user.selectOptions(screen.getByLabelText("Como cobra"), "PER_HOUR");
        await user.type(screen.getByLabelText(/preço \(r\$\)/i), "200");
        await user.click(screen.getByRole("button", { name: "Criar item" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "POST", url: "/admin/items", body: { name: "Fotógrafo", chargeType: "PER_HOUR", description: null, unitPrice: 200, minQuantity: null, maxQuantity: null } }));
    });

    it("reports a failed delete", async () => {
        server.use(
            http.get(`${BASE}/admin/items`, () => HttpResponse.json({ data: [item()] })),
            http.delete(`${BASE}/admin/items/:id`, () => HttpResponse.json({ message: "erro" }, { status: 500 })),
            http.patch(`${BASE}/admin/items/:id`, () => HttpResponse.json({ message: "erro" }, { status: 500 })),
        );
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=items");
        await user.click(await screen.findByRole("button", { name: "Excluir Pula-pula" }));
        expect(await screen.findByText(/não foi possível excluir|erro/i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Pausar Pula-pula" }));
        await user.click(screen.getByRole("button", { name: "Editar preço de Pula-pula" }));
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
    });
});

describe("Reserva e cancelamento", () => {
    it("validates, saves the rules and restores the default policy", async () => {
        const bodies: unknown[] = [];
        server.use(
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: SETTINGS })),
            http.put(`${BASE}/tenant/settings`, async ({ request }) => {
                bodies.push(await request.json());
                return HttpResponse.json({ data: SETTINGS });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=booking");

        const lead = await screen.findByLabelText("Antecedência mínima");
        expect(lead).toHaveValue("2");
        await user.selectOptions(screen.getByLabelText("Em"), "hours");
        await user.clear(lead);
        await user.type(lead, "12");
        const hold = screen.getByLabelText(/prazo para pagar/i);
        await user.clear(hold);
        await user.type(hold, "2");
        await user.click(screen.getByRole("button", { name: "Adicionar faixa" }));
        const days = screen.getAllByLabelText(/a partir de/i);
        const pct = screen.getAllByLabelText(/reembolso \(%\)/i);
        await user.type(days[2], "30");
        await user.type(pct[2], "150");
        await user.click(screen.getByRole("button", { name: "Salvar regras" }));
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(/de 5 minutos a 7 dias/i);
        expect(alert).toHaveTextContent(/não podem começar no mesmo/i);
        expect(alert).toHaveTextContent(/de 0% a 100%/i);

        await user.click(screen.getByRole("button", { name: "Remover a faixa 3" }));
        await user.clear(hold);
        await user.type(hold, "90");
        const sim = screen.getByLabelText(/simular/i);
        await user.clear(sim);
        await user.type(sim, "1");
        expect(screen.getByText(/cancelando 1 dia antes/i)).toHaveTextContent("0%");
        await user.selectOptions(screen.getByLabelText("UF"), "SP");
        await user.click(screen.getByRole("button", { name: "Salvar regras" }));
        await waitFor(() => expect(bodies[0]).toMatchObject({ paymentHoldMinutes: 90, minLeadHours: 12, maxAdvanceDays: 365, state: "SP", city: "Lavras", cancellationPolicy: { notes: "Remarcação grátis" } }));

        await user.click(screen.getByRole("button", { name: "Usar a política padrão" }));
        await waitFor(() => expect(bodies[1]).toEqual({ cancellationPolicy: null }));
    });

    it("configura o sinal, o prazo do restante e como pagar (#48)", async () => {
        const bodies: Record<string, unknown>[] = [];
        server.use(
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: SETTINGS })),
            http.put(`${BASE}/tenant/settings`, async ({ request }) => {
                bodies.push((await request.json()) as Record<string, unknown>);
                return HttpResponse.json({ data: SETTINGS });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=booking");
        expect(await screen.findByText(/sem sinal: a reserva só é confirmada com o valor total/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/restante até/i)).toBeDisabled();

        await user.type(screen.getByLabelText(/sinal para confirmar/i), "130");
        await user.click(screen.getByRole("button", { name: "Salvar regras" }));
        expect(await screen.findByText(/o sinal vai de 1% a 100%/i)).toBeInTheDocument();

        await user.clear(screen.getByLabelText(/sinal para confirmar/i));
        await user.type(screen.getByLabelText(/sinal para confirmar/i), "30");
        await user.type(screen.getByLabelText(/restante até/i), "7");
        expect(screen.getByText(/confirma com/i)).toHaveTextContent(/R\$\s?300,00 e paga o restante até 7 dias antes do evento/);
        await user.type(screen.getByLabelText(/como pagar/i), "PIX: chave e-mail");
        await user.click(screen.getByRole("button", { name: "Salvar regras" }));
        await waitFor(() => expect(bodies[0]).toMatchObject({ depositPercent: 30, balanceDueDays: 7, paymentInstructions: "PIX: chave e-mail" }));
    });

    it("rejects a lead time beyond the booking horizon and shows API errors", async () => {
        server.use(
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: { ...SETTINGS, maxAdvanceDays: 1 } })),
            http.put(`${BASE}/tenant/settings`, () => HttpResponse.json({ message: "Fuso inválido" }, { status: 400 })),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=booking");
        await user.click(await screen.findByRole("button", { name: "Salvar regras" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/menor que o horizonte/i);
        const max = screen.getByLabelText(/reservas até/i);
        await user.clear(max);
        await user.click(screen.getByRole("button", { name: "Salvar regras" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/fuso inválido|não foi possível/i);
    });
});

describe("Contrato e contato", () => {
    function withContract() {
        const calls: { method: string; url: string; body: unknown }[] = [];
        const record = async ({ request }: { request: Request }) => {
            calls.push({ method: request.method, url: new URL(request.url).pathname, body: request.method === "DELETE" ? null : await request.json() });
            return HttpResponse.json({ data: request.url.includes("settings") ? SETTINGS : clause() });
        };
        server.use(
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: SETTINGS })),
            http.put(`${BASE}/tenant/settings`, record),
            http.get(`${BASE}/admin/contract/clauses`, () => HttpResponse.json({ data: [clause(), clause({ id: "c2", title: "Piscina", body: "Multa de {{multa}}.", fineAmount: "200.00", timeLimit: null, sortOrder: 1, isActive: false, rendered: "Multa de R$ 200,00." })] })),
            http.get(`${BASE}/admin/contract/templates`, () => HttpResponse.json({ data: [
                { key: "decor", title: "Decoração", body: "Sem pregos. Multa de {{multa}}.", usesFine: true, usesTime: false, clauseId: null },
                { key: "som", title: "Som", body: "Som até {{horario}}.", usesFine: false, usesTime: true, clauseId: "c1" },
            ] })),
            http.post(`${BASE}/admin/contract/clauses`, record),
            http.patch(`${BASE}/admin/contract/clauses/:id`, record),
            http.delete(`${BASE}/admin/contract/clauses/:id`, record),
        );
        return calls;
    }

    it("saves the salon profile", async () => {
        const calls = withContract();
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=contract");
        await user.type(await screen.findByLabelText("Nome ou razão social"), "Maria Locadora");
        await user.type(screen.getByLabelText("CPF ou CNPJ"), "52998224725");
        await user.clear(screen.getByLabelText("Instagram"));
        await user.type(screen.getByLabelText("Perguntas e respostas"), "P: Tem estacionamento?");
        await user.click(screen.getByRole("button", { name: "Salvar dados do salão" }));
        await waitFor(() => expect(calls[0]?.body).toMatchObject({ legalName: "Maria Locadora", documentNumber: "52998224725", instagram: null, contactPhone: null, chatbotFaq: "P: Tem estacionamento?" }));
    });

    it("shows the profile error from the API", async () => {
        withContract();
        server.use(http.put(`${BASE}/tenant/settings`, () => HttpResponse.json({ message: "Documento inválido" }, { status: 400 })));
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=contract");
        await user.click(await screen.findByRole("button", { name: "Salvar dados do salão" }));
        expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("manages the contract clauses", async () => {
        const calls = withContract();
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=contract");
        expect(await screen.findByText(/piscina \(fora do contrato\)/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Usar o modelo Decoração" }));
        const fine = screen.getByLabelText(/multa \(r\$\)/i);
        await user.type(fine, "150");
        expect(screen.getByText(/no contrato: sem pregos\. multa de r\$\s?150,00\./i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Adicionar ao contrato" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "POST", url: "/admin/contract/clauses", body: { key: "decor", title: "Decoração", body: "Sem pregos. Multa de {{multa}}.", fineAmount: 150, timeLimit: null } }));

        await user.click(screen.getByRole("button", { name: "Editar Som" }));
        fireEvent.change(screen.getByLabelText("Horário"), { target: { value: "" } });
        const body = screen.getByLabelText("Texto");
        await user.clear(body);
        await user.type(body, "curto");
        await user.click(screen.getByRole("button", { name: "Salvar regra" }));
        expect(await screen.findByText(/pelo menos 10 letras/i)).toBeInTheDocument();
        fireEvent.change(body, { target: { value: "Som desligado às {{horario}}." } });
        fireEvent.change(screen.getByLabelText("Horário"), { target: { value: "23:00" } });
        await user.click(screen.getByRole("button", { name: "Salvar regra" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/contract/clauses/c1", body: { title: "Som", body: "Som desligado às {{horario}}.", fineAmount: null, timeLimit: "23:00" } }));

        await user.click(screen.getByRole("button", { name: "Pôr no contrato: Piscina" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/contract/clauses/c2", body: { isActive: true } }));

        await user.click(screen.getByRole("button", { name: "Subir Piscina na ordem" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "/admin/contract/clauses/c2", body: { sortOrder: 0 } }));

        await user.click(screen.getByRole("button", { name: "Excluir Som" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "DELETE", url: "/admin/contract/clauses/c1", body: null }));

        await user.click(screen.getByRole("button", { name: "Escrever regra própria" }));
        await user.type(screen.getByLabelText("Título"), "Lixo");
        await user.type(screen.getByLabelText("Texto"), "Recolher o lixo ao sair.");
        await user.click(screen.getByRole("button", { name: "Criar regra" }));
        await waitFor(() => expect(calls).toContainEqual({ method: "POST", url: "/admin/contract/clauses", body: { title: "Lixo", body: "Recolher o lixo ao sair.", fineAmount: null, timeLimit: null } }));
    });
});
