import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import PartyBuilder from "../../pages/PartyBuilder";
import ProviderPage from "../../pages/ProviderPage";
import Services from "../../pages/Services";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const CARD = {
    id: "p1", slug: "doces-da-ana", name: "Doces da Ana", categories: ["CAKE_SWEETS"], city: "Lavras", state: "MG",
    serviceMode: "ON_SITE", serviceRadiusKm: 40, cover: null, startingPrice: 125, startingPriceUnit: "FIXED", distanceKm: null,
    rating: { average: 4.5, count: 2 },
};

const DETAIL = {
    ...CARD, description: "Brigadeiros gourmet e bolos.", instagram: "docesdaana", photos: [],
    packages: [{ id: "k1", name: "Cento de brigadeiros", description: "Sabores à escolha", price: 125, priceUnit: "FIXED" }],
    busyDates: ["2030-01-10"], recommendedBy: [{ slug: "recanto-vila-rica", name: "Recanto Vila Rica", logoUrl: null }],
    preview: false, createdAt: "2026-01-01", rating: { average: 4.5, count: 2 },
};

const REVIEWS = {
    data: [{ id: "r1", rating: 5, comment: "Doces lindos.", reply: "Obrigada!", repliedAt: "2026-10-02", createdAt: "2026-10-01", author: "Camila F.", eventType: "Casamento", eventMonth: "2026-09" }],
    pagination: { page: 1, limit: 5, total: 2, totalPages: 1 },
    summary: { average: 4.5, count: 2, distribution: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: rating >= 4 ? 1 : 0 })) },
};

function Probe() {
    const l = useLocation();
    return <div data-testid="location">{l.pathname}{l.search}</div>;
}

function renderAt(path: string, role: string | null = "USER") {
    if (role) localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "u1", name: "Bruno Cliente", role } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Probe />
                <Routes>
                    <Route path="/servicos" element={<Services />} />
                    <Route path="/servicos/:slug" element={<ProviderPage />} />
                    <Route path="/monte-a-festa/:reservationId" element={<PartyBuilder />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/orcamentos" element={<div>Meus orçamentos</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe("Vitrine de serviços", () => {
    it("lista os prestadores com a média e filtra pela bandeirinha de categoria", async () => {
        const seen: string[] = [];
        server.use(http.get(`${BASE}/providers`, ({ request }) => {
            seen.push(new URL(request.url).search);
            return HttpResponse.json({ data: [CARD], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }, origin: null, sort: "relevance" });
        }));
        renderAt("/servicos?date=2030-02-01");

        expect(await screen.findByRole("heading", { name: "Doces da Ana" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "4,5 de 5" })).toBeInTheDocument();
        // A data escolhida vai junto para o pedido de orçamento.
        expect(screen.getByRole("link", { name: /Doces da Ana/ })).toHaveAttribute("href", "/servicos/doces-da-ana?data=2030-02-01");

        await userEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
        await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("category=MAKEUP"));
        await waitFor(() => expect(seen.some((s) => s.includes("category=MAKEUP"))).toBe(true));
    });

    it("plataforma ainda vazia convida quem trabalha com festa", async () => {
        server.use(http.get(`${BASE}/providers`, () => HttpResponse.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }, origin: null })));
        renderAt("/servicos", null);
        expect(await screen.findByRole("heading", { name: "Os primeiros prestadores estão chegando" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Oferecer meus serviços" })).toHaveAttribute("href", "/cadastro");
    });
});

describe("Página do prestador", () => {
    beforeEach(() => {
        server.use(
            http.get(`${BASE}/providers/doces-da-ana`, () => HttpResponse.json({ data: DETAIL })),
            http.get(`${BASE}/providers/doces-da-ana/reviews`, () => HttpResponse.json(REVIEWS)),
        );
    });

    it("mostra pacotes, indicação, avaliações e não mostra o WhatsApp", async () => {
        renderAt("/servicos/doces-da-ana");
        expect(await screen.findByRole("heading", { level: 1, name: "Doces da Ana" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Cento de brigadeiros" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Recanto Vila Rica" })).toHaveAttribute("href", "/s/recanto-vila-rica");
        expect(await screen.findByText("Doces lindos.")).toBeInTheDocument();
        expect(screen.getByText("Obrigada!")).toBeInTheDocument();
        expect(screen.getByText("Camila F.")).toBeInTheDocument();
        expect(screen.queryByText(/wa\.me/)).not.toBeInTheDocument();
    });

    it("envia o pedido de orçamento já com a data da busca e a reserva", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(http.post(`${BASE}/providers/doces-da-ana/quotes`, async ({ request }) => {
            body = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "q1", eventDate: "2030-02-01" } }, { status: 201 });
        }));
        renderAt("/servicos/doces-da-ana?data=2030-02-01&convidados=80&reserva=res-1");
        await screen.findByRole("heading", { name: "Pedir orçamento" });

        await userEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("tipo de festa");

        await userEvent.selectOptions(screen.getByLabelText("Tipo de festa"), "Aniversário");
        await userEvent.selectOptions(screen.getByLabelText("Pacote de interesse"), "k1");
        await userEvent.type(screen.getByLabelText("O que você precisa"), "Mesa de doces para 80 pessoas.");
        await userEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));

        expect(await screen.findByRole("heading", { name: "Pedido enviado" })).toBeInTheDocument();
        expect(body).toMatchObject({ eventDate: "2030-02-01", guests: 80, eventType: "Aniversário", packageId: "k1", reservationId: "res-1" });
        expect(screen.getByRole("link", { name: "Ver meus orçamentos" })).toHaveAttribute("href", "/orcamentos?id=q1");
    });

    it("não aceita data ocupada e avisa o pedido repetido", async () => {
        server.use(http.post(`${BASE}/providers/doces-da-ana/quotes`, () =>
            HttpResponse.json({ error: { message: "x", code: "QUOTE_ALREADY_OPEN", status: 409 } }, { status: 409 })));
        renderAt("/servicos/doces-da-ana");
        await screen.findByRole("heading", { name: "Pedir orçamento" });
        fireEvent.change(screen.getByLabelText("Data da festa"), { target: { value: "2030-01-10" } });
        expect(await screen.findByText("Data ocupada na agenda do prestador.")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Data da festa"), { target: { value: "2030-03-01" } });
        await userEvent.selectOptions(screen.getByLabelText("Tipo de festa"), "Casamento");
        await userEvent.type(screen.getByLabelText("O que você precisa"), "Doces para o casamento.");
        await userEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("já tem um pedido em andamento");
    });

    it("sem login leva ao login; conta do salão não pede orçamento", async () => {
        const { unmount } = renderAt("/servicos/doces-da-ana", null);
        expect(await screen.findByRole("link", { name: "Entrar para enviar o pedido" })).toHaveAttribute("href", expect.stringContaining("/login"));
        unmount();
        renderAt("/servicos/doces-da-ana", "OWNER");
        expect(await screen.findByText(/conta do salão/)).toBeInTheDocument();
    });

    it("prestador fora da vitrine mostra o aviso", async () => {
        server.use(http.get(`${BASE}/providers/sumiu`, () => HttpResponse.json({ error: { code: "PROVIDER_NOT_FOUND" } }, { status: 404 })));
        renderAt("/servicos/sumiu");
        expect(await screen.findByRole("heading", { name: "Este prestador não está disponível" })).toBeInTheDocument();
    });
});

describe("Monte a sua festa", () => {
    it("põe o indicado pelo salão primeiro, com o recado, e o link já preenche o pedido", async () => {
        let tenantHeader: string | null = null;
        server.use(http.get(`${BASE}/reservations/res-1/party-services`, ({ request }) => {
            tenantHeader = request.headers.get("X-Tenant-Slug");
            return HttpResponse.json({
                data: {
                    reservationId: "res-1", date: "2030-02-01", guests: 60, city: "Lavras", state: "MG",
                    categories: [{ category: "CAKE_SWEETS", providers: [{ ...CARD, recommended: true, note: "Os doces da casa." }] }],
                },
            });
        }));
        renderAt("/monte-a-festa/res-1?salao=recanto-vila-rica");
        expect(await screen.findByRole("heading", { name: "Bolo e doces" })).toBeInTheDocument();
        expect(screen.getByText("Indicado pelo salão")).toBeInTheDocument();
        expect(screen.getByText("Os doces da casa.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Doces da Ana/ })).toHaveAttribute("href", "/servicos/doces-da-ana?data=2030-02-01&convidados=60&reserva=res-1");
        expect(tenantHeader).toBe("recanto-vila-rica");
    });

    it("sem ninguém livre, leva para a vitrine na data", async () => {
        server.use(http.get(`${BASE}/reservations/res-2/party-services`, () =>
            HttpResponse.json({ data: { reservationId: "res-2", date: "2030-02-01", guests: null, city: "Lavras", state: "MG", categories: [] } })));
        renderAt("/monte-a-festa/res-2");
        expect(await screen.findByRole("link", { name: "Ver todos os serviços" })).toHaveAttribute("href", "/servicos?date=2030-02-01");
    });
});
