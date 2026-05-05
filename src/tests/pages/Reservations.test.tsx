import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import Reservations from "../../pages/Reservations";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const mockReservation = {
    id: "res-1",
    status: "PENDING",
    planCode: "ESSENCIAL",
    totalPrice: 85000,
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue: { name: "Salão Principal" },
};

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/reservations"]}>
            <Routes>
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/checkout/:id" element={<div>Checkout Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Reservations page", () => {
    afterEach(() => localStorage.clear());

    it("shows empty state when there are no reservations", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/nenhuma reserva encontrada/i)).toBeInTheDocument()
        );
    });

    it("shows reservations list", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );
        expect(screen.getByText("Pendente")).toBeInTheDocument();
        expect(screen.getByText("Essencial")).toBeInTheDocument();
    });

    it("shows pay button for PENDING reservations", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /ir para pagamento/i })).toBeInTheDocument()
        );
    });

    it("navigates to checkout on pay button click", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /ir para pagamento/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /ir para pagamento/i }));
        expect(screen.getByText("Checkout Page")).toBeInTheDocument();
    });

    it("cancels a reservation successfully", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            ),
            http.patch(`${BASE}/reservations/res-1/cancel`, () =>
                HttpResponse.json({ success: true, data: { ...mockReservation, status: "CANCELLED" } })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /cancelar reserva/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /cancelar reserva/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /sim, cancelar/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /sim, cancelar/i }));
        await waitFor(() =>
            expect(screen.getByText(/reserva cancelada com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when load fails", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar reservas." }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar reservas/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when cancel fails", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            ),
            http.patch(`${BASE}/reservations/res-1/cancel`, () =>
                HttpResponse.json({ success: false, message: "Erro ao cancelar reserva." }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /cancelar reserva/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /cancelar reserva/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /sim, cancelar/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /sim, cancelar/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao cancelar reserva/i)).toBeInTheDocument()
        );
    });

    it("shows PAID status correctly without action buttons", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, status: "PAID" }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Pago")).toBeInTheDocument()
        );
        expect(screen.queryByRole("button", { name: /ir para pagamento/i })).not.toBeInTheDocument();
    });

    it("shows raw status when not in STATUS_MAP", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, status: "CUSTOM_STATUS" }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("CUSTOM_STATUS")).toBeInTheDocument()
        );
    });

    it("shows 'Salão' when venue is absent", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, venue: null }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão")).toBeInTheDocument()
        );
    });

    it("shows raw planCode when not in PLAN_LABELS", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, planCode: "CUSTOM_PLAN" }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("CUSTOM_PLAN")).toBeInTheDocument()
        );
    });

    it("shows '—' when planCode is null", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, planCode: null }] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("—")).toBeInTheDocument()
        );
    });

        it("closes cancel modal when Voltar is clicked", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [mockReservation] })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /cancelar reserva/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /cancelar reserva/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /sim, cancelar/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /voltar/i }));
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /sim, cancelar/i })).not.toBeInTheDocument()
        );
    });

    it("shows '1 hora' for 1-hour reservation", async () => {
        const now = Date.now();
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{
                        ...mockReservation,
                        startDate: new Date(now + 86400000).toISOString(),
                        endDate: new Date(now + 86400000 + 3600000).toISOString(),
                    }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("1 hora")).toBeInTheDocument()
        );
    });
});
