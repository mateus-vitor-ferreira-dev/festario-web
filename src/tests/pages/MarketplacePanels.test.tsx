import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { ToastContainer } from "react-toastify";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import { PartnersTab } from "../../pages/Admin/tabs/PartnersTab";
import MyBusiness from "../../pages/MyBusiness";
import Quotes from "../../pages/Quotes";
import { server } from "../mocks/server";
import { seedSession } from "../helpers/session";

const BASE = "http://localhost:3000";

const PHOTO = { id: "ph1", alt: "Mesa de doces", sortOrder: 0, isCover: true, width: 1200, height: 800, variants: [{ width: 480, height: 320, url: "/a.webp", key: "a" }] };

const MINE = {
    id: "p1", slug: "doces-da-ana", name: "Doces da Ana", categories: ["CAKE_SWEETS"], description: null, city: "Lavras", state: "MG",
    serviceRadiusKm: 40, serviceMode: "ON_SITE", startingPrice: null, startingPriceUnit: null, whatsapp: null, email: null, instagram: null,
    status: "DRAFT", visibility: "DRAFT", hiddenReason: null, missingToPublish: ["WHATSAPP", "PHOTO"],
    packages: [{ id: "k1", name: "Cento de brigadeiros", description: null, price: 125, priceUnit: "FIXED", sortOrder: 0, isActive: true }],
    photos: [], busyDates: [{ id: "b1", date: "2030-01-10", note: "Casamento" }],
};

const READY = { ...MINE, whatsapp: "35999990000", photos: [PHOTO], missingToPublish: [] };

const QUOTE_BASE = {
    eventDate: "2030-02-01", guests: 80, eventType: "Aniversário", city: "Lavras", message: "Doces para 80 pessoas.",
    quotedAmount: null, responseMessage: null, rejectionReason: null, answeredAt: null, closedAmount: null, hiredAt: null,
    createdAt: "2026-11-01", reservationId: null, package: null, referredBy: null, review: null, canReview: false,
};

function renderAt(path: string, el: React.ReactNode, routePath: string) {
    seedSession({ token: "t", user: { id: "u1", name: "Ana", role: "USER" } });
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <ToastContainer />
                <Routes>
                    <Route path={routePath} element={el} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("Meu negócio", () => {
    it("sem perfil mostra o cadastro e cria o perfil", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: null })),
            http.post(`${BASE}/providers/me`, async ({ request }) => {
                body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ data: MINE }, { status: 201 });
            }),
        );
        renderAt("/meu-negocio", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByRole("heading", { name: "Ofereça seus serviços para festas" })).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Criar perfil" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("nome do seu negócio");

        await userEvent.type(screen.getByLabelText("Nome do negócio"), "Doces da Ana");
        await userEvent.click(screen.getByLabelText("Bolo e doces"));
        await userEvent.type(screen.getByLabelText("Cidade"), "Lavras");
        await userEvent.selectOptions(screen.getByLabelText("Estado"), "MG");
        await userEvent.type(screen.getByLabelText("A partir de (R$)"), "125");
        await userEvent.click(screen.getByRole("button", { name: "Criar perfil" }));

        expect(await screen.findByText(/Para publicar, falta o WhatsApp e ao menos uma foto do trabalho/)).toBeInTheDocument();
        expect(body).toMatchObject({ name: "Doces da Ana", categories: ["CAKE_SWEETS"], city: "Lavras", state: "MG", startingPrice: 125, startingPriceUnit: "FIXED" });
        expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
    });

    it("publica quando o perfil está completo e mostra o aviso de oculto", async () => {
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: READY })),
            http.post(`${BASE}/providers/me/publish`, () => HttpResponse.json({ data: { ...READY, status: "PUBLISHED", visibility: "PUBLISHED" } })),
            http.get(`${BASE}/providers/me/quotes`, () => HttpResponse.json({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }, counts: {} })),
        );
        const { unmount } = renderAt("/meu-negocio?aba=perfil", <MyBusiness />, "/meu-negocio");
        await userEvent.click(await screen.findByRole("button", { name: "Publicar" }));
        expect(await screen.findByText("Seu perfil está na vitrine.")).toBeInTheDocument();
        unmount();

        server.use(http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: { ...READY, status: "PUBLISHED", visibility: "HIDDEN", hiddenReason: "Fotos de outra pessoa" } })));
        renderAt("/meu-negocio?aba=perfil", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByText(/Fotos de outra pessoa/)).toBeInTheDocument();
    });

    it("pacotes: cria, pausa e exclui", async () => {
        const calls: string[] = [];
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: MINE })),
            http.post(`${BASE}/providers/me/packages`, async ({ request }) => { calls.push(`post ${JSON.stringify(await request.json())}`); return HttpResponse.json({ data: MINE }, { status: 201 }); }),
            http.patch(`${BASE}/providers/me/packages/k1`, async ({ request }) => { calls.push(`patch ${JSON.stringify(await request.json())}`); return HttpResponse.json({ data: MINE }); }),
            http.delete(`${BASE}/providers/me/packages/k1`, () => { calls.push("delete"); return HttpResponse.json({ data: { ...MINE, packages: [] } }); }),
        );
        renderAt("/meu-negocio?aba=pacotes", <MyBusiness />, "/meu-negocio");
        await userEvent.click(await screen.findByRole("button", { name: "Novo pacote" }));
        await userEvent.type(screen.getByLabelText("Nome do pacote"), "Bolo decorado");
        await userEvent.type(screen.getByLabelText("Preço (R$)"), "290,50");
        await userEvent.selectOptions(screen.getByLabelText("Cobrado"), "PER_GUEST");
        await userEvent.click(screen.getByRole("button", { name: "Criar pacote" }));
        await waitFor(() => expect(calls[0]).toBe('post {"name":"Bolo decorado","description":null,"price":290.5,"priceUnit":"PER_GUEST"}'));

        await userEvent.click(await screen.findByRole("button", { name: "Pausar" }));
        await waitFor(() => expect(calls).toContain('patch {"isActive":false}'));
        await userEvent.click(screen.getByRole("button", { name: "Excluir" }));
        await waitFor(() => expect(calls).toContain("delete"));
    });

    it("agenda: marca um intervalo de dias e libera um dia", async () => {
        let dates: string[] = [];
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: MINE })),
            http.post(`${BASE}/providers/me/busy-dates`, async ({ request }) => { dates = ((await request.json()) as { dates: string[] }).dates; return HttpResponse.json({ data: MINE }, { status: 201 }); }),
            http.delete(`${BASE}/providers/me/busy-dates/b1`, () => HttpResponse.json({ data: { ...MINE, busyDates: [] } })),
        );
        renderAt("/meu-negocio?aba=agenda", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByText(/10 de janeiro de 2030/)).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("De"), { target: { value: "2030-03-01" } });
        fireEvent.change(screen.getByLabelText("Até (opcional)"), { target: { value: "2030-03-03" } });
        await userEvent.click(screen.getByRole("button", { name: "Marcar como ocupado" }));
        await waitFor(() => expect(dates).toEqual(["2030-03-01", "2030-03-02", "2030-03-03"]));

        await userEvent.click(screen.getByRole("button", { name: /Liberar/ }));
        expect(await screen.findByText("Nenhum dia ocupado daqui para frente.")).toBeInTheDocument();
    });

    it("portfólio: mostra as fotos e o envio", async () => {
        server.use(http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: READY })));
        renderAt("/meu-negocio?aba=portfolio", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByRole("heading", { name: "Portfólio" })).toBeInTheDocument();
        expect(screen.getByAltText("Mesa de doces")).toBeInTheDocument();
        expect(screen.getByText("Escolher foto")).toBeInTheDocument();
    });

    it("orçamentos: responde um pedido novo e marca o aceito como contratado", async () => {
        let answer: unknown = null;
        let hired: unknown = null;
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: READY })),
            http.get(`${BASE}/providers/me/quotes`, ({ request }) => {
                const status = new URL(request.url).searchParams.get("status");
                const base = { ...QUOTE_BASE, customer: { name: "Bruno Cliente", email: "bruno@ex.com", phone: "35988880000" } };
                const data = status === "ACCEPTED"
                    ? [{ ...base, id: "q2", status: "ACCEPTED", quotedAmount: 950, responseMessage: "400 doces" }]
                    : [{ ...base, id: "q1", status: "OPEN", referredBy: { slug: "recanto-vila-rica", name: "Recanto Vila Rica" } }];
                return HttpResponse.json({ data, pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }, counts: { OPEN: 1, ACCEPTED: 1 } });
            }),
            http.post(`${BASE}/quotes/q1/answer`, async ({ request }) => { answer = await request.json(); return HttpResponse.json({ data: {} }); }),
            http.post(`${BASE}/quotes/q2/hired`, async ({ request }) => { hired = await request.json(); return HttpResponse.json({ data: {} }); }),
        );
        renderAt("/meu-negocio?aba=orcamentos", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByText("Indicação de Recanto Vila Rica")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /WhatsApp \(35\) 98888-0000/ })).toHaveAttribute("href", expect.stringContaining("wa.me/5535988880000"));

        await userEvent.click(screen.getByRole("button", { name: "Responder" }));
        await userEvent.type(screen.getByLabelText("Valor do orçamento (R$)"), "950");
        await userEvent.type(screen.getByLabelText("Mensagem para o cliente"), "Faço 400 doces.");
        await userEvent.click(screen.getByRole("button", { name: "Enviar resposta" }));
        await waitFor(() => expect(answer).toEqual({ amount: 950, message: "Faço 400 doces." }));

        await userEvent.click(screen.getByRole("button", { name: /^Aceitos/ }));
        await userEvent.click(await screen.findByRole("button", { name: "Marcar como contratado" }));
        await userEvent.click(screen.getByRole("button", { name: "Registrar contratação" }));
        await waitFor(() => expect(hired).toEqual({ closedAmount: 950 }));
    });

    it("avaliações: responde a que está sem resposta", async () => {
        let reply: unknown = null;
        const review = { id: "r1", rating: 4, comment: "Atrasou um pouco.", reply: null, repliedAt: null, createdAt: "2026-10-01", author: "Camila F.", eventType: "Casamento", eventMonth: "2026-09" };
        server.use(
            http.get(`${BASE}/providers/me`, () => HttpResponse.json({ data: READY })),
            http.get(`${BASE}/providers/me/reviews`, () => HttpResponse.json({ data: [review], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }, summary: { average: 4, count: 1, distribution: [] } })),
            http.post(`${BASE}/providers/me/reviews/r1/reply`, async ({ request }) => {
                reply = await request.json();
                return HttpResponse.json({ data: { ...review, reply: "Desculpe o atraso!" } });
            }),
        );
        renderAt("/meu-negocio?aba=avaliacoes", <MyBusiness />, "/meu-negocio");
        expect(await screen.findByText("Atrasou um pouco.")).toBeInTheDocument();
        await userEvent.type(screen.getByLabelText(/Sua resposta/), "Desculpe o atraso!");
        await userEvent.click(screen.getByRole("button", { name: "Publicar resposta" }));
        expect(await screen.findByRole("button", { name: "Editar resposta" })).toBeInTheDocument();
        expect(reply).toEqual({ reply: "Desculpe o atraso!" });
    });
});

describe("Meus orçamentos", () => {
    const provider = { slug: "doces-da-ana", name: "Doces da Ana", categories: ["CAKE_SWEETS"], city: "Lavras", state: "MG", cover: null, instagram: null };

    it("aceita a resposta e mostra o WhatsApp do prestador", async () => {
        const answered = { ...QUOTE_BASE, id: "q1", status: "ANSWERED", quotedAmount: 950, responseMessage: "400 doces.", provider: { ...provider, contact: { whatsapp: "35999990000", email: "ana@ex.com" } } };
        server.use(
            http.get(`${BASE}/quotes/mine`, () => HttpResponse.json({ data: [answered], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } })),
            http.post(`${BASE}/quotes/q1/accept`, () => HttpResponse.json({ data: { ...answered, status: "ACCEPTED" } })),
        );
        renderAt("/orcamentos", <Quotes />, "/orcamentos");
        expect(await screen.findByText(/Orçamento: R\$\s?950/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Combinar pelo WhatsApp" })).toHaveAttribute("href", expect.stringContaining("wa.me/5535999990000"));
        await userEvent.click(screen.getByRole("button", { name: "Aceitar orçamento" }));
        expect(await screen.findByText("Aceito")).toBeInTheDocument();
    });

    it("avalia a contratação cuja festa passou", async () => {
        let body: unknown = null;
        const hired = { ...QUOTE_BASE, id: "q3", status: "HIRED", eventDate: "2026-10-01", quotedAmount: 650, closedAmount: 650, canReview: true, provider: { ...provider, contact: null } };
        server.use(
            http.get(`${BASE}/quotes/mine`, () => HttpResponse.json({ data: [hired], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } })),
            http.post(`${BASE}/quotes/q3/review`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ data: { id: "r9", rating: 5, comment: "Perfeito.", createdAt: "2026-11-16" } }, { status: 201 });
            }),
        );
        renderAt("/orcamentos", <Quotes />, "/orcamentos");
        await userEvent.click(await screen.findByRole("button", { name: "Avaliar" }));
        await userEvent.click(screen.getByRole("button", { name: "Publicar avaliação" }));
        expect(await screen.findByText("Escolha de 1 a 5 estrelas.")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("radio", { name: /5 estrelas/ }));
        await userEvent.type(screen.getByLabelText(/Comentário/), "Perfeito.");
        await userEvent.click(screen.getByRole("button", { name: "Publicar avaliação" }));
        expect(await screen.findByText("Sua avaliação")).toBeInTheDocument();
        expect(body).toEqual({ rating: 5, comment: "Perfeito." });
    });

    it("sem pedidos, leva à vitrine", async () => {
        server.use(http.get(`${BASE}/quotes/mine`, () => HttpResponse.json({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } })));
        renderAt("/orcamentos", <Quotes />, "/orcamentos");
        expect(await screen.findByRole("link", { name: "Ver serviços" })).toHaveAttribute("href", "/servicos");
    });
});

describe("Painel do salão: fornecedores", () => {
    it("busca, indica e deixa de indicar", async () => {
        const partner = { id: "sp1", note: null, sortOrder: 0, listed: true, provider: { id: "p1", slug: "doces-da-ana", name: "Doces da Ana", categories: ["CAKE_SWEETS"], city: "Lavras", state: "MG", cover: null } };
        let added: unknown = null;
        server.use(
            http.get(`${BASE}/admin/partners`, () => HttpResponse.json({ data: [] })),
            http.get(`${BASE}/admin/partners/search`, () => HttpResponse.json({ data: [{ ...partner.provider, isPartner: false }] })),
            http.post(`${BASE}/admin/partners`, async ({ request }) => { added = await request.json(); return HttpResponse.json({ data: [partner] }, { status: 201 }); }),
            http.patch(`${BASE}/admin/partners/sp1`, () => HttpResponse.json({ data: [{ ...partner, note: "Parceira" }] })),
            http.delete(`${BASE}/admin/partners/sp1`, () => HttpResponse.json({ data: [] })),
        );
        renderAt("/painel", <PartnersTab />, "/painel");
        expect(await screen.findByText(/Nenhum fornecedor indicado ainda/)).toBeInTheDocument();

        await userEvent.click(await screen.findByRole("button", { name: "Indicar" }));
        await waitFor(() => expect(added).toEqual({ providerSlug: "doces-da-ana" }));
        const card = (await screen.findByRole("link", { name: "Doces da Ana" })).closest("li")!;

        await userEvent.type(within(card).getByLabelText(/Recado/), "Parceira");
        await userEvent.click(within(card).getByRole("button", { name: "Salvar recado" }));
        await userEvent.click(await screen.findByRole("button", { name: "Deixar de indicar" }));
        expect(await screen.findByText(/Nenhum fornecedor indicado ainda/)).toBeInTheDocument();
    });
});
