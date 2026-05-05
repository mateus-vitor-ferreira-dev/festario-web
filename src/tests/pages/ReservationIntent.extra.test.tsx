import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import ReservationIntent from "../../pages/ReservationIntent";
import { server } from "../mocks/server";

vi.mock("../../components/AvailabilityCalendar", () => ({
    default: ({ onChange, selectedDate }) => (
        <input
            type="date"
            aria-label="Data do evento"
            value={selectedDate || ""}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/reservation-intent/venue-1"]}>
                <Routes>
                    <Route
                        path="/reservation-intent/:venueId"
                        element={<ReservationIntent />}
                    />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

const venue = {
    id: "venue-1",
    name: "Salão Principal",
    description: "Descrição",
    capacity: 100,
    location: "Rua A",
    hasKidsArea: false,
    hasPool: false,
    mapsUrl: "",
    imageUrl: "",
};

describe("ReservationIntent extra branches", () => {
    it("shows fallback when quote API returns no estimated price", async () => {
        server.use(
            http.get(`${BASE}/venues/venue-1`, () =>
                HttpResponse.json({ data: venue })
            ),
            http.post(`${BASE}/reservations/quote`, () =>
                HttpResponse.json({ data: {} })
            )
        );

        renderPage();

        expect(
            await screen.findByRole("heading", { name: /salão principal/i })
        ).toBeInTheDocument();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/data do evento/i), "2026-12-20");

        await screen.findByText(/essencial/i);
        const planCard = screen.getByText(/essencial/i).parentElement;
        await user.click(planCard);

        await user.type(screen.getByLabelText(/início/i), "10:00");
        await user.type(screen.getByLabelText(/término/i), "14:00");

        await waitFor(() => {
            expect(screen.getByText(/valor estimado/i)).toBeInTheDocument();
        });
    });

    it("shows venue not found when API returns null data", async () => {
        server.use(
            http.get(`${BASE}/venues/venue-1`, () =>
                HttpResponse.json({ data: null })
            )
        );

        renderPage();

        expect(
            await screen.findByText(/salão não encontrado/i)
        ).toBeInTheDocument();
    });

    it("shows error toast when quote request fails", async () => {
        server.use(
            http.get(`${BASE}/venues/venue-1`, () =>
                HttpResponse.json({ data: venue })
            ),
            http.post(`${BASE}/reservations/quote`, () =>
                HttpResponse.json(
                    { message: "Erro ao calcular orçamento." },
                    { status: 500 }
                )
            )
        );

        renderPage();

        expect(
            await screen.findByRole("heading", { name: /salão principal/i })
        ).toBeInTheDocument();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/data do evento/i), "2026-12-20");

        await screen.findByText(/essencial/i);
        const planCard = screen.getByText(/essencial/i).parentElement;
        await user.click(planCard);

        await user.type(screen.getByLabelText(/início/i), "10:00");
        await user.type(screen.getByLabelText(/término/i), "14:00");

        expect(
            await screen.findByText(/erro ao calcular orçamento/i)
        ).toBeInTheDocument();
    });
});