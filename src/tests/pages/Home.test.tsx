import { render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Home from "../../pages/Home";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY).toISOString();

function reservation(id: string, over: Record<string, unknown> = {}) {
    return {
        id, status: "PAID", startDate: inDays(30), endDate: inDays(30), totalPrice: 1000,
        venue: { id: `v-${id}`, name: `Espaço ${id}` }, tenant: { slug: "recanto", name: "Recanto Vila Rica" }, ...over,
    };
}

const SALON = {
    slug: "jardim", name: "Salão Jardim das Flores", logoUrl: null, logoVariants: null, primaryColor: null, primaryColorDark: null, cover: null,
    neighborhood: "Centro", city: "Lavras", state: "MG", capacity: { min: 50, max: 120 }, startingPrice: 590,
    amenities: { hasPool: false, hasKidsArea: true }, venueCount: 1, distanceKm: 2.4, nearestVenueId: "v1",
};

function mock({ reservations = [] as unknown[], grants = [] as unknown[], salons = [SALON] as unknown[], onSalons }: { reservations?: unknown[]; grants?: unknown[]; salons?: unknown[]; onSalons?: (url: URL) => void } = {}) {
    server.use(
        http.get(`${BASE}/reservations`, () => HttpResponse.json({ data: reservations, pagination: { page: 1, limit: 100, total: reservations.length, totalPages: 1 } })),
        http.get(`${BASE}/promotions/my-grants`, () => HttpResponse.json({ data: grants })),
        http.get(`${BASE}/salons`, ({ request }) => {
            onSalons?.(new URL(request.url));
            return HttpResponse.json({ data: salons, pagination: { page: 1, limit: 3, total: salons.length, totalPages: 1 }, origin: null });
        }),
    );
}

function renderPage(user: Record<string, unknown> = { id: "u1", name: "Mariana Costa", email: "m@x.com", role: "USER" }) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user }));
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Home />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe("Início do cliente", () => {
    it("cumprimenta pelo primeiro nome e leva para a vitrine", async () => {
        mock();
        renderPage();
        expect(screen.getByText(/carregando seu painel/i)).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: /, mariana\./i })).toBeInTheDocument();
        expect(screen.getByText("Suas festas em todos os salões do Festário.")).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "Encontrar um salão" })[0]).toHaveAttribute("href", "/saloes");
    });

    it("lista as próximas festas de vários salões, cada uma com o salão; passadas e canceladas ficam de fora", async () => {
        mock({
            reservations: [
                reservation("b", { startDate: inDays(40), tenant: { slug: "pampulha", name: "Casa Pampulha" } }),
                reservation("a", { startDate: inDays(10) }),
                reservation("velha", { startDate: inDays(-5) }),
                reservation("cancelada", { status: "CANCELLED", startDate: inDays(20) }),
            ],
        });
        renderPage();
        const panel = (await screen.findByRole("heading", { name: "Próximas festas" })).closest("article")!;
        expect(within(panel).getByText("Espaço a")).toBeInTheDocument();
        expect(within(panel).getByText("Recanto Vila Rica")).toBeInTheDocument();
        expect(within(panel).getByText("Espaço b")).toBeInTheDocument();
        expect(within(panel).getByText("Casa Pampulha")).toBeInTheDocument();
        expect(within(panel).queryByText("Espaço velha")).not.toBeInTheDocument();
        expect(within(panel).queryByText("Espaço cancelada")).not.toBeInTheDocument();
        // a primeira (mais próxima) é a de destaque, com o atalho para a reserva
        expect(within(panel).getByRole("link", { name: "Ver reserva" })).toHaveAttribute("href", "/reservations");
    });

    it("espaço com o mesmo nome do salão não repete o nome", async () => {
        mock({ reservations: [reservation("x", { status: "PENDING", venue: { id: "v", name: "Recanto Vila Rica" } })] });
        renderPage();
        const callout = (await screen.findByRole("heading", { name: "Reserva esperando pagamento" })).closest("section")!;
        expect(within(callout).getByText(/^Recanto Vila Rica, em/)).toBeInTheDocument();
    });

    it("reserva esperando pagamento aparece em destaque, com o link para pagar", async () => {
        mock({ reservations: [reservation("p", { status: "PENDING", startDate: inDays(15) })] });
        renderPage();
        const callout = (await screen.findByRole("heading", { name: "Reserva esperando pagamento" })).closest("section")!;
        expect(within(callout).getByText(/Espaço p, Recanto Vila Rica/)).toBeInTheDocument();
        expect(within(callout).getByRole("link", { name: "Ver pagamento" })).toHaveAttribute("href", "/checkout/p");
    });

    it("sem festas marcadas, convida a encontrar um salão", async () => {
        mock();
        renderPage();
        expect(await screen.findByText("Nenhuma festa marcada.")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Reserva esperando pagamento" })).not.toBeInTheDocument();
    });

    it("mostra os descontos com o salão onde cada um vale", async () => {
        mock({
            grants: [
                { id: "g1", percentOff: 10, validUntil: inDays(20), campaign: { id: "c1", name: "Indicação", type: "REFERRAL" }, tenant: { slug: "recanto", name: "Recanto Vila Rica" } },
                { id: "g2", percentOff: 5, validUntil: null, campaign: { id: "c2", name: "Fidelidade", type: "LOYALTY" }, tenant: null },
            ],
        });
        renderPage();
        expect(await screen.findByText("10% OFF")).toBeInTheDocument();
        expect(screen.getByText(/Vale em Recanto Vila Rica · até/)).toBeInTheDocument();
        expect(screen.getByText(/sem data de expiração/)).toBeInTheDocument();
    });

    it("sugere salões perto do endereço do perfil", async () => {
        const urls: URL[] = [];
        mock({ onSalons: (u) => urls.push(u) });
        renderPage({ id: "u1", name: "Mariana", email: "m@x.com", role: "USER", hasLocation: true, neighborhood: "Centro", city: "Lavras", state: "MG" });
        expect(await screen.findByRole("heading", { name: "Salões perto de Centro, Lavras - MG" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /salão jardim das flores/i })).toHaveAttribute("href", "/s/jardim");
        expect(urls.at(-1)?.searchParams.get("origin")).toBe("profile");
        expect(urls.at(-1)?.searchParams.get("limit")).toBe("3");
    });

    it("sem endereço, os salões aparecem como destaque", async () => {
        mock();
        renderPage();
        expect(await screen.findByRole("heading", { name: "Salões em destaque" })).toBeInTheDocument();
    });

    it("uma parte que falha não esconde as outras", async () => {
        mock({ grants: [{ id: "g1", percentOff: 10, validUntil: null, campaign: { id: "c1", name: "Indicação", type: "REFERRAL" }, tenant: null }] });
        server.use(http.get(`${BASE}/reservations`, () => HttpResponse.json({ message: "erro" }, { status: 500 })));
        renderPage();
        expect(await screen.findByText(/não foi possível carregar as suas reservas/i)).toBeInTheDocument();
        expect(screen.getByText("10% OFF")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Salões em destaque" })).toBeInTheDocument();
    });

    it("dono vê o atalho para o painel", async () => {
        mock();
        renderPage({ id: "o1", name: "Dona", email: "d@x.com", role: "OWNER" });
        expect(await screen.findByRole("link", { name: "Abrir painel do espaço" })).toHaveAttribute("href", "/painel");
    });
});
