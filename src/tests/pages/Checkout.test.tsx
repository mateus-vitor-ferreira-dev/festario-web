import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import Checkout from "../../pages/Checkout";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const mockReservation = {
    id: "res-1",
    status: "PENDING",
    planCode: "ESSENCIAL",
    totalPrice: 850,
    startDate: "2026-06-01T10:00:00.000Z",
    endDate: "2026-06-01T18:00:00.000Z",
    venue: { name: "Salão Principal" },
};

function renderPage(reservationId = "res-1") {
    return render(
        <MemoryRouter initialEntries={[`/checkout/${reservationId}`]}>
            <Routes>
                <Route path="/checkout/:reservationId" element={<Checkout />} />
                <Route path="/reservations" element={<div>Reservations Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Checkout page", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("shows loading then reservation details", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            )
        );
        renderPage();
        expect(screen.getByText(/carregando dados da reserva/i)).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );
        expect(screen.getByText(/aguardando pagamento/i)).toBeInTheDocument();
        expect(screen.getAllByText(/850/).length).toBeGreaterThan(0);
    });

    it("shows planCode when present", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
    });

    it("creates checkout session and redirects on payment button click", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            ),
            http.post(`${BASE}/payments/checkout/res-1`, () =>
                HttpResponse.json({
                    message: "Checkout session created successfully",
                    sessionId: "cs_test_123",
                    url: "https://stripe.com/pay/session-1",
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /pagar com cartão/i })).toBeInTheDocument()
        );

        vi.stubGlobal("location", { href: "http://localhost/" });
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /pagar com cartão/i }));
        await waitFor(() =>
            expect(window.location.href).toBe("https://stripe.com/pay/session-1")
        );
    });

    it("shows 409 specific error when payment session already exists", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            ),
            http.post(`${BASE}/payments/checkout/res-1`, () =>
                HttpResponse.json({ success: false }, { status: 409 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /pagar com cartão/i })).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /pagar com cartão/i }));
        await waitFor(() =>
            expect(screen.getByText(/já existe uma sessão de pagamento/i)).toBeInTheDocument()
        );
    });

    it("shows InfoBox when reservation is not PENDING", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: { ...mockReservation, status: "PAID" },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/esta reserva não está disponível para pagamento/i)).toBeInTheDocument()
        );
    });

    it("navigates to /reservations on cancel link click", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/voltar para minhas reservas/i)).toBeInTheDocument()
        );
        await user.click(screen.getByText(/voltar para minhas reservas/i));
        expect(screen.getByText("Reservations Page")).toBeInTheDocument();
    });

    it("shows generic error toast when payment POST fails with non-409 status", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            ),
            http.post(`${BASE}/payments/checkout/res-1`, () =>
                HttpResponse.json({ success: false, message: "Erro ao iniciar o pagamento." }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /pagar com cartão/i })).toBeInTheDocument()
        );
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /pagar com cartão/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao iniciar o pagamento/i)).toBeInTheDocument()
        );
    });

    it("redirects to /reservations when loading reservation fails", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: false }, { status: 404 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Reservations Page")).toBeInTheDocument()
        );
    });
});
