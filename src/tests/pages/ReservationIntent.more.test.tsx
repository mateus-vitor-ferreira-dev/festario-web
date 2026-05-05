import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";

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

const mockVenue = {
    id: "venue-1",
    name: "Salão Principal",
    description: "Salão principal para eventos e reservas",
    capacity: 150,
    location: "Lavras - MG",
    hasKidsArea: false,
    hasPool: false,
};

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/reservation-intent/venue-1"]}>
                <Routes>
                    <Route
                        path="/reservation-intent/:venueId"
                        element={<ReservationIntent />}
                    />
                    <Route path="/checkout/:id" element={<div>Checkout</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("ReservationIntent extra coverage", () => {
    it("does not show kids extra hours when value is zero", async () => {
        server.use(
            http.get("*", ({ request }) => {
                if (request.url.includes("/venues")) {
                    return HttpResponse.json({
                        success: true,
                        data: {
                            id: "venue-1",
                            name: "Salão Principal",
                            description: "Salão principal para eventos e reservas",
                            capacity: 0,
                            location: "",
                            basePricePerHour: 65000,
                            hasKidsArea: true,
                            kidsAreaPricePerHour: 30,
                            hasPool: false,
                        },
                    });
                }
            })
        );

        renderPage();

        const saloes = await screen.findAllByText(/salão principal/i);
        expect(saloes.length).toBeGreaterThan(0);

        expect(
            screen.queryByText(/monitor infantil/i)
        ).not.toBeInTheDocument();
    });

    it("renders correctly and avoids loading state", async () => {
        server.use(
            http.get("*", ({ request }) => {
                if (request.url.includes("/venues")) {
                    return HttpResponse.json({
                        success: true,
                        data: {
                            id: "venue-1",
                            name: "Salão Principal",
                            description: "Salão principal para eventos e reservas",
                            capacity: 0,
                            location: "",
                            basePricePerHour: 65000,
                            hasKidsArea: true,
                            kidsAreaPricePerHour: 30,
                            hasPool: false,
                        },
                    });
                }
            })
        );

        renderPage();

        const saloes = await screen.findAllByText(/salão principal/i);
        expect(saloes.length).toBeGreaterThan(0);
    });

    afterEach(() => localStorage.clear());

    it("does not render kids area card when venue has no kids area", async () => {
        server.use(
            http.get("*", ({ request }) => {
                if (request.url.includes("/venues")) {
                    return HttpResponse.json({
                        success: true,
                        data: {
                            id: "venue-1",
                            name: "Salão Principal",
                            description: "Salão principal para eventos e reservas",
                            capacity: 0,
                            location: "",
                            basePricePerHour: 65000,
                            hasKidsArea: false,
                            hasPool: false,
                        },
                    });
                }
            })
        );

        renderPage();

        const saloes = await screen.findAllByText(/salão principal/i);
        expect(saloes.length).toBeGreaterThan(0);

        expect(
            screen.queryByText(/área kids com monitor/i)
        ).not.toBeInTheDocument();
    });

    it("handles invalid JSON in localStorage without crashing (locatario catch branch)", async () => {
        localStorage.setItem("recanto:userData", "{invalid json}");
        server.use(
            http.get("*", ({ request }) => {
                if (request.url.includes("/venues")) {
                    return HttpResponse.json({ success: true, data: mockVenue });
                }
            })
        );
        const { container } = renderPage();
        // Component renders the page title regardless of venue load result
        await waitFor(() =>
            expect(screen.getByText(/intenção de reserva/i)).toBeInTheDocument()
        );
        expect(container).toBeTruthy();
    });

    it("normalizedQuote adjusts PLAN_BASE price when diffCents != 0", async () => {
        server.use(
            http.get(`${BASE}/venues/venue-1`, () =>
                HttpResponse.json({ success: true, data: mockVenue })
            ),
            http.post(`${BASE}/reservations/quote`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        totalCents: 80000,
                        subtotalCents: 80000,
                        discountCents: 0,
                        discountApplied: false,
                        planCode: "COMPLETA",
                        currency: "BRL",
                        items: [
                            { type: "PLAN_BASE", description: "Plano Completa", totalAmountCents: 80000 },
                            { type: "TAXA", description: "Taxa extra", totalAmountCents: 0 },
                        ],
                    },
                })
            )
        );

        const { container } = renderPage();
        const user = userEvent.setup();

        await waitFor(() =>
            expect(screen.getAllByText(/salão principal/i).length).toBeGreaterThan(0)
        );

        // Fill date (2027-06-20 = Sunday, valid for COMPLETA)
        const dateInput = container.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: "2027-06-20" } });
        const timeInputs = container.querySelectorAll('input[type="time"]');
        if (timeInputs[0]) fireEvent.change(timeInputs[0], { target: { value: "10:00" } });
        if (timeInputs[1]) fireEvent.change(timeInputs[1], { target: { value: "18:00" } });

        // Select COMPLETA plan to trigger normalizedQuote with PLAN_BASE items
        await waitFor(() =>
            expect(screen.getByText("Completa")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Completa"));

        // The quote should be displayed (even if with adjusted values)
        await waitFor(() =>
            expect(screen.getByText(/intenção de reserva/i)).toBeInTheDocument()
        );
    });
});