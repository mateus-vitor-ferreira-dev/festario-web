import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
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
            expect(screen.getByRole("button", { name: /como pagar/i })).toBeInTheDocument()
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
            expect(screen.getByRole("button", { name: /como pagar/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /como pagar/i }));
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

    it("shows the salon and cancels on the reservation's own salon, not the stored one", async () => {
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "recanto-vila-rica", name: "Recanto Vila Rica" }));
        let cancelTenant: string | null = null;
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, tenant: { slug: "casa-pampulha-eventos", name: "Casa Pampulha Eventos" } }] })
            ),
            http.patch(`${BASE}/reservations/res-1/cancel`, ({ request }) => {
                cancelTenant = request.headers.get("X-Tenant-Slug");
                return HttpResponse.json({ success: true, data: { ...mockReservation, status: "CANCELLED" } });
            })
        );
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText("Casa Pampulha Eventos")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /cancelar reserva/i }));
        await user.click(await screen.findByRole("button", { name: /sim, cancelar/i }));
        await waitFor(() => expect(screen.getByText(/reserva cancelada com sucesso/i)).toBeInTheDocument());
        expect(cancelTenant).toBe("casa-pampulha-eventos");
    });

    it("baixa o contrato aceito da reserva, no salão dela", async () => {
        let contractTenant: string | null = null;
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, tenant: { slug: "casa-pampulha-eventos", name: "Casa Pampulha Eventos" } }] })
            ),
            http.get(`${BASE}/reservations/res-1/contract`, ({ request }) => {
                contractTenant = request.headers.get("X-Tenant-Slug");
                return HttpResponse.json({ success: true, data: { landlord: { tradeName: "Casa Pampulha Eventos" }, event: { date: "01/01/2030" } } });
            })
        );
        const download = vi.fn();
        vi.doMock("../../components/Contract/download", () => ({ downloadContract: download }));
        const user = userEvent.setup();
        renderPage();
        await user.click(await screen.findByRole("button", { name: /baixar contrato/i }));
        await waitFor(() => expect(download).toHaveBeenCalledWith(expect.objectContaining({ landlord: { tradeName: "Casa Pampulha Eventos" } })));
        expect(contractTenant).toBe("casa-pampulha-eventos");
        vi.doUnmock("../../components/Contract/download");
    });

    it("shows error toast when load fails", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar reservas." }, { status: 500 })
            )
        );
        renderPage();
        // 5xx: mesma mensagem genérica das demais listagens
        await waitFor(() =>
            expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument()
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
        expect(screen.queryByRole("button", { name: /como pagar/i })).not.toBeInTheDocument();
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

    it("shows the contracted package name from the reservation copy", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, planCode: null, packageSnapshot: { name: "Sábado à tarde" } }] })
            )
        );
        renderPage();
        expect(await screen.findByText("Sábado à tarde")).toBeInTheDocument();
    });

    it("estimates the refund with the policy saved in the reservation", async () => {
        const policy = {
            tiers: [{ minDays: 30, percentage: 80 }, { minDays: 0, percentage: 10 }],
            notes: "Remarcação grátis uma vez.",
            summary: ["Com 30 dias ou mais de antecedência: 80% de reembolso", "Com menos de 30 dias de antecedência: 10% de reembolso"],
        };
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ ...mockReservation, status: "PAID", totalPrice: 1000, payment: { amount: 1000 }, cancellationPolicy: policy }] })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.click(await screen.findByRole("button", { name: /cancelar reserva/i }));
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Com menos de 30 dias de antecedência")).toBeInTheDocument();
        expect(within(dialog).getByText("10% de reembolso")).toBeInTheDocument();
        expect(within(dialog).getByText(/remarcação grátis/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/R\$\s?100,00 \(10%\)/)).toBeInTheDocument();
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
