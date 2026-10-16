import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import SalonPage from "../../pages/SalonPage";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const VENUE = {
    id: "v1", name: "Espaço Jardim", description: "Área verde com piscina", capacity: 120, hasPool: true, hasKidsArea: true,
    neighborhood: "Centro", city: "Lavras", state: "MG", location: null, startingPrice: 1500, photos: [],
    mapsUrl: "https://maps.example/v1", distanceKm: null,
};

const SALON = {
    slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores", logoUrl: null, logoVariants: null,
    primaryColor: "#1f6b4f", primaryColorDark: "#7fd1ae", cover: null, neighborhood: "Centro", city: "Lavras", state: "MG",
    capacity: { min: 120, max: 120 }, startingPrice: 1500, amenities: { hasPool: true, hasKidsArea: true }, venueCount: 1,
    distanceKm: null, nearestVenueId: null, priceRange: { min: 1500, max: 1500 },
    contact: { address: null, contactWhatsapp: "(35) 99999-0000", contactPhone: null, contactEmail: "oi@jardim.com", instagram: "@jardim" },
    venues: [VENUE], origin: null,
};

function renderPage(role = "USER", state?: unknown) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "u1", name: "Ana", role } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[{ pathname: "/s/salao-jardim-das-flores", state }]}>
                <Routes>
                    <Route path="/s/:slug" element={<SalonPage />} />
                    <Route path="/reservation-intent/:venueId" element={<div>Reservation Intent</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe("Página do salão", () => {
    it("mostra o salão, os contatos e os espaços; o cliente passa a operar neste salão", async () => {
        server.use(http.get(`${BASE}/salons/salao-jardim-das-flores`, () => HttpResponse.json({ data: SALON })));
        renderPage("USER", { from: "?city=Lavras" });

        expect(await screen.findByRole("heading", { level: 1, name: "Salão Jardim das Flores" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Todos os salões" })).toHaveAttribute("href", "/saloes?city=Lavras");
        expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/5535999990000");
        expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "https://instagram.com/jardim");
        expect(screen.getByRole("heading", { level: 3, name: "Espaço Jardim" })).toBeInTheDocument();
        expect(within(screen.getByRole("article")).getByText("até 120 convidados")).toBeInTheDocument();

        expect(JSON.parse(localStorage.getItem("festario:tenant")!)).toEqual({ slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" });
    });

    it("'Reservar' leva à reserva do espaço", async () => {
        server.use(http.get(`${BASE}/salons/salao-jardim-das-flores`, () => HttpResponse.json({ data: SALON })));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole("button", { name: "Reservar uma data" }));
        expect(screen.getByText("Reservation Intent")).toBeInTheDocument();
    });

    it("o dono vê a página sem 'Reservar' e continua no próprio salão", async () => {
        server.use(http.get(`${BASE}/salons/salao-jardim-das-flores`, () => HttpResponse.json({ data: SALON })));
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "meu-salao", name: "Meu Salão" }));
        renderPage("OWNER");

        expect(await screen.findByText(/para reservar, entre com uma conta de cliente/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /reservar/i })).not.toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem("festario:tenant")!).slug).toBe("meu-salao");
    });

    it("um salão inexistente ou inativo mostra o caminho de volta à vitrine", async () => {
        server.use(http.get(`${BASE}/salons/salao-jardim-das-flores`, () =>
            HttpResponse.json({ success: false, message: "Salão não encontrado.", code: "SALON_NOT_FOUND" }, { status: 404 })));
        renderPage();

        expect(await screen.findByRole("heading", { name: "Este salão não está disponível" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Todos os salões" })).toHaveAttribute("href", "/saloes");
    });
});
