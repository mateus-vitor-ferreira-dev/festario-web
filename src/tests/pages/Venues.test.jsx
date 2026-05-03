import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Venues from "../../pages/Venues";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/venues"]}>
            <Routes>
                <Route path="/venues" element={<Venues />} />
                <Route path="/reservation-intent/:venueId" element={<div>ReservationIntent Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

const mockVenue = {
    id: "venue-1",
    name: "Salão Principal",
    description: "Espaço amplo",
    capacity: 100,
    location: "Lavras - MG",
    hasKidsArea: true,
    hasPool: false,
    mapsUrl: "https://maps.google.com",
};

describe("Venues page", () => {
    it("shows error toast when venues load fails", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar os espaços." }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument()
        );
    });

    it("shows loading state initially", () => {
        renderPage();
        expect(screen.getByText(/carregando espaços/i)).toBeInTheDocument();
    });

    it("shows empty state when no venues are returned", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/nenhum espaço encontrado/i)).toBeInTheDocument()
        );
    });

    it("shows venues list with details", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [mockVenue] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );
        expect(screen.getByText("Espaço amplo")).toBeInTheDocument();
        expect(screen.getByText("100 pessoas")).toBeInTheDocument();
        expect(screen.getByText("Lavras - MG")).toBeInTheDocument();
    });

    it("shows 'Disponível' for hasKidsArea and 'Não disponível' for hasPool", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [mockVenue] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Disponível")).toBeInTheDocument()
        );
        expect(screen.getByText("Não disponível")).toBeInTheDocument();
    });

    it("renders mapsUrl as a link when present", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [mockVenue] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("link", { name: /rotas/i })).toBeInTheDocument()
        );
    });

    it("renders disabled button when mapsUrl is absent", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockVenue, mapsUrl: null }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^rotas$/i })).toBeDisabled()
        );
    });

    it("shows fallback text when description and capacity are missing", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ ...mockVenue, description: null, capacity: null, location: null }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Sem descrição cadastrada para este espaço.")).toBeInTheDocument()
        );
        expect(screen.getAllByText("Não informada").length).toBeGreaterThan(0);
    });

    it("shows Disponível for hasPool when true", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockVenue, hasKidsArea: false, hasPool: true }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Disponível")).toBeInTheDocument()
        );
        expect(screen.getByText("Não disponível")).toBeInTheDocument();
    });

    it("navigates to reservation-intent on Reservar click", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [mockVenue] })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /reservar/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /reservar/i }));
        expect(screen.getByText("ReservationIntent Page")).toBeInTheDocument();
    });
});
