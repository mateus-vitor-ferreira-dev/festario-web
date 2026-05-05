import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, vi } from "vitest";
import Checkout from "../../pages/Checkout";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/checkout/123"]}>
            <Routes>
                <Route path="/checkout/:reservationId" element={<Checkout />} />
                <Route path="/reservations" element={<div>Reservations</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("Checkout extra coverage", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("stays in loading state when reservationId is missing", async () => {
        render(
            <MemoryRouter initialEntries={["/checkout"]}>
                <Routes>
                    <Route path="/checkout" element={<Checkout />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            await screen.findByText(/carregando dados da reserva/i)
        ).toBeInTheDocument();
    });

    it("handles API failure without crashing", async () => {
        server.use(
            http.get(`${BASE}/reservations/123`, () =>
                HttpResponse.json({}, { status: 500 })
            )
        );

        const { container } = renderPage();
        expect(container).toBeTruthy();
    });

    it("uses checkoutUrl directly when reservation already has one", async () => {
        const assignSpy = vi.fn();
        vi.spyOn(window, "location", "get").mockReturnValue({
            ...window.location,
            set href(url) { assignSpy(url); },
        });

        server.use(
            http.get(`${BASE}/reservations/123`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        id: "123",
                        status: "PENDING",
                        planCode: "ESSENCIAL",
                        totalPrice: 850,
                        startDate: "2026-06-01T10:00:00.000Z",
                        endDate: "2026-06-01T18:00:00.000Z",
                        venue: { name: "Salão Principal" },
                        checkoutUrl: "https://checkout.stripe.com/pay/test",
                    },
                })
            )
        );

        render(
            <MemoryRouter initialEntries={["/checkout/123"]}>
                <Routes>
                    <Route path="/checkout/:reservationId" element={<Checkout />} />
                    <Route path="/reservations" element={<div>Reservations</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /pagar com cartão/i }));

        await waitFor(() =>
            expect(assignSpy).toHaveBeenCalledWith("https://checkout.stripe.com/pay/test")
        );
    });
});