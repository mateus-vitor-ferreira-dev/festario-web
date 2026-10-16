import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import type { ReservationPayment } from "../../types";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const RES = "res-1";

const reservation = (over: Record<string, unknown> = {}) => ({
    id: RES, status: "PENDING", totalPrice: "1200.00", startDate: "2026-12-12T17:00:00.000Z", endDate: "2026-12-12T22:00:00.000Z",
    user: { id: "u1", name: "Joana Lima", email: "j@x.com" }, venue: { id: "v1", name: "Salão Principal" }, packageSnapshot: { name: "Sábado" },
    payment: null, cancellationPolicy: { tiers: [{ minDays: 30, percentage: 80 }, { minDays: 0, percentage: 0 }], summary: [] }, ...over,
});

function pay(over: Partial<ReservationPayment> = {}, summary: Partial<ReservationPayment["summary"]> = {}): ReservationPayment {
    return {
        reservationId: RES, reservationStatus: "PENDING", mode: "MANUAL",
        summary: { totalCents: 120000, requiredCents: 36000, paidCents: 0, refundedCents: 0, netCents: 0, balanceCents: 120000, missingToConfirmCents: 36000, confirmed: false, ...summary },
        depositCents: 36000, balanceDueAt: "2026-12-05T17:00:00.000Z", confirmBy: "2026-11-20T21:30:00.000Z", refundDueCents: null, refundPercentage: null,
        entries: [], instructions: null, venue: null, tenant: null, ...over,
    };
}

function renderPanel() {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "dono@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/painel?tab=reservations"]}>
                <Routes><Route path="/painel" element={<Admin />} /></Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

function listWith(res: Record<string, unknown>) {
    server.use(http.get(`${BASE}/admin/reservations`, () => HttpResponse.json({ data: [res], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 } })));
}

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

describe("Painel → Reservas → Pagamentos", () => {
    it("registra o sinal sugerido e avisa que a reserva foi confirmada", async () => {
        listWith(reservation());
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({ data: pay() })),
            http.post(`${BASE}/admin/reservations/${RES}/payments`, async ({ request }) => {
                body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ data: pay({ reservationStatus: "PAID", confirmBy: null, entries: [{ id: "e1", kind: "PAYMENT", method: "CASH", amountCents: 36000, paidAt: new Date().toISOString(), note: "Sinal", createdAt: new Date().toISOString(), recordedBy: { id: "o1", name: "Dona" } }] }, { paidCents: 36000, netCents: 36000, balanceCents: 84000, missingToConfirmCents: 0, confirmed: true }) }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderPanel();
        await user.click(await screen.findByRole("button", { name: /pagamentos de joana lima/i }));

        const dialog = await screen.findByRole("dialog", { name: /pagamentos de joana lima/i });
        await waitFor(() => expect(within(dialog).getByLabelText("Valor (R$)")).toHaveValue("360,00"));
        expect(within(dialog).getByText("Falta para confirmar")).toBeInTheDocument();
        expect(within(dialog).getByText(/a reserva expira e a data fica livre/i)).toBeInTheDocument();

        await user.selectOptions(within(dialog).getByLabelText("Forma"), "CASH");
        await user.type(within(dialog).getByLabelText(/observação/i), "Sinal");
        await user.click(within(dialog).getByRole("button", { name: "Registrar pagamento" }));

        await waitFor(() => expect(body).toEqual({ kind: "PAYMENT", method: "CASH", amount: 360, note: "Sinal" }));
        expect(await screen.findByText(/reserva confirmada e cliente avisado/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/R\$\s?360,00 · Dinheiro/)).toBeInTheDocument();
        expect(within(dialog).getByLabelText("Valor (R$)")).toHaveValue("840,00");
    });

    it("reserva cancelada: só devolução, com o valor devido sugerido; erro da API aparece no modal", async () => {
        listWith(reservation({ status: "CANCELLED", payment: { id: "p", amount: "360.00", status: "PAID", refundDueAmount: "288.00" } }));
        server.use(
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({ data: pay({ reservationStatus: "CANCELLED", confirmBy: null, refundDueCents: 28800, refundPercentage: 80, entries: [{ id: "e1", kind: "PAYMENT", method: "PIX", amountCents: 36000, paidAt: "2026-11-19T15:00:00.000Z", note: null, createdAt: "2026-11-19T15:00:00.000Z", recordedBy: null }] }, { paidCents: 36000, netCents: 36000 }) })),
            http.post(`${BASE}/admin/reservations/${RES}/payments`, () => HttpResponse.json({ message: "A devolução não pode passar do que foi recebido (R$ 360,00)." }, { status: 422 })),
        );
        const user = userEvent.setup();
        renderPanel();
        expect(await screen.findByText(/R\$\s?360,00 recebido/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /pagamentos de joana lima/i }));
        const dialog = await screen.findByRole("dialog");
        await waitFor(() => expect(within(dialog).getByLabelText("Valor (R$)")).toHaveValue("288,00"));
        expect(within(dialog).queryByRole("radio", { name: "Pagamento recebido" })).not.toBeInTheDocument();
        expect(within(dialog).getByText(/registre a devolução feita ao cliente/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/devolução pela política \(80%\)/i)).toBeInTheDocument();

        await user.clear(within(dialog).getByLabelText("Valor (R$)"));
        await user.type(within(dialog).getByLabelText("Valor (R$)"), "999");
        await user.click(within(dialog).getByRole("button", { name: "Registrar devolução" }));
        expect(await within(dialog).findByRole("alert")).toHaveTextContent(/não pode passar do que foi recebido/);
    });

    it("desfaz um lançamento depois de confirmar", async () => {
        listWith(reservation({ status: "PAID" }));
        const entry = { id: "e9", kind: "PAYMENT" as const, method: "PIX" as const, amountCents: 10000, paidAt: "2026-11-19T15:00:00.000Z", note: null, createdAt: "2026-11-19T15:00:00.000Z", recordedBy: null };
        server.use(
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({ data: pay({ reservationStatus: "PAID", entries: [entry] }, { paidCents: 10000, netCents: 10000 }) })),
            http.delete(`${BASE}/admin/reservations/${RES}/payments/e9`, () => HttpResponse.json({ data: pay({ reservationStatus: "PAID", entries: [] }) })),
        );
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderPanel();
        await user.click(await screen.findByRole("button", { name: /pagamentos de joana lima/i }));
        const dialog = await screen.findByRole("dialog");
        await user.click(await within(dialog).findByRole("button", { name: /desfazer pagamento de R\$\s?100,00/i }));
        expect(await screen.findByText(/lançamento desfeito/i)).toBeInTheDocument();
        expect(within(dialog).getByText(/nenhum pagamento registrado ainda/i)).toBeInTheDocument();
    });

    it("cancelar uma pendente com sinal pago mostra a devolução pela política", async () => {
        listWith(reservation({ startDate: new Date(Date.now() + 60 * 86400000).toISOString(), payment: { id: "p", amount: "360.00", status: "PAID" } }));
        const user = userEvent.setup();
        renderPanel();
        await user.click(await screen.findByRole("button", { name: /^cancelar$/i }));
        expect(await screen.findByText(/o salão já recebeu por esta reserva/i)).toBeInTheDocument();
        expect(screen.getByText("80%")).toBeInTheDocument();
        expect(screen.getByText(/R\$\s?288,00/)).toBeInTheDocument();
        expect(screen.getByText(/não há estorno automático/i)).toBeInTheDocument();
    });
});
