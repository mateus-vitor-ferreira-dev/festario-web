import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import Checkout from "../../pages/Checkout";
import type { PaymentAccountInfo, ReservationPayment } from "../../types";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const RES = "res-1a2b3c4d";

const reservation = {
    id: RES, status: "PENDING", packageSnapshot: { name: "Sábado à tarde" }, totalPrice: 1200, guestCount: 80,
    startDate: "2026-12-12T17:00:00.000Z", endDate: "2026-12-12T22:00:00.000Z", venue: { name: "Salão Principal" },
    user: { id: "u1", name: "Joana Lima", email: "j@x.com" }, payment: null,
    cancellationPolicy: { tiers: [{ minDays: 0, percentage: 0 }], summary: [] },
};

function payment(over: Partial<ReservationPayment> = {}, summary: Partial<ReservationPayment["summary"]> = {}): ReservationPayment {
    return {
        reservationId: RES, reservationStatus: "PENDING", mode: "ONLINE",
        online: { payableCents: 36000, pendingCharge: null },
        summary: { totalCents: 120000, requiredCents: 36000, paidCents: 0, refundedCents: 0, netCents: 0, balanceCents: 120000, missingToConfirmCents: 36000, confirmed: false, ...summary },
        depositCents: 36000, balanceDueAt: null, confirmBy: "2026-11-20T21:30:00.000Z", refundDueCents: null, refundPercentage: null, entries: [],
        instructions: { text: null, whatsapp: "(35) 99999-0000", phone: null, email: null, instagram: null },
        venue: { id: "v1", name: "Salão Principal" }, tenant: { slug: "salao", name: "Salão das Flores" },
        ...over,
    };
}

const assign = vi.fn();
beforeEach(() => {
    localStorage.clear();
    assign.mockReset();
    vi.stubGlobal("location", { ...window.location, assign });
});
afterEach(() => vi.unstubAllGlobals());

function renderCheckout(path = `/checkout/${RES}`) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes><Route path="/checkout/:reservationId" element={<Checkout />} /></Routes>
            <ToastContainer />
        </MemoryRouter>,
    );
}

describe("Checkout com pagamento online", () => {
    it("pede o CPF quando o Asaas exige e leva para a fatura", async () => {
        const bodies: Record<string, unknown>[] = [];
        server.use(
            http.get(`${BASE}/reservations/${RES}`, () => HttpResponse.json({ data: reservation })),
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({ data: payment() })),
            http.post(`${BASE}/payments/reservation/${RES}/online`, async ({ request }) => {
                const body = (await request.json()) as Record<string, unknown>;
                bodies.push(body);
                if (!body.cpfCnpj) return HttpResponse.json({ success: false, message: "Informe o seu CPF.", error: { code: "CPF_REQUIRED" } }, { status: 422 });
                return HttpResponse.json({ data: { chargeId: "c1", invoiceUrl: "https://sandbox.asaas.com/i/pay_1", amountCents: 36000, method: "CARD", dueDate: "2026-11-20" } }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderCheckout();

        expect(await screen.findByRole("heading", { name: "Pague para confirmar a reserva" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /pagar agora: R\$\s?360,00/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Prefere combinar com o salão?" })).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: /cartão de crédito/i }));
        await user.click(screen.getByRole("button", { name: /pagar R\$\s?360,00 com cartão/i }));

        const cpf = await screen.findByLabelText("Seu CPF");
        expect(screen.getByText(/o festário não guarda/i)).toBeInTheDocument();
        await user.type(cpf, "529");
        await user.click(screen.getByRole("button", { name: /pagar R\$\s?360,00 com cartão/i }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/CPF completo/);

        await user.type(cpf, "98224725");
        expect(cpf).toHaveValue("529.982.247-25");
        await user.click(screen.getByRole("button", { name: /pagar R\$\s?360,00 com cartão/i }));
        await waitFor(() => expect(assign).toHaveBeenCalledWith("https://sandbox.asaas.com/i/pay_1"));
        expect(bodies.at(-1)).toEqual({ method: "CARD", cpfCnpj: "52998224725" });
    });

    it("mostra a cobrança aberta para continuar", async () => {
        server.use(
            http.get(`${BASE}/reservations/${RES}`, () => HttpResponse.json({ data: reservation })),
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({
                data: payment({ online: { payableCents: 36000, pendingCharge: { id: "c1", method: "PIX", amountCents: 36000, invoiceUrl: "https://sandbox.asaas.com/i/pay_9", dueDate: "2026-11-20" } } }),
            })),
        );
        renderCheckout();
        expect(await screen.findByRole("link", { name: "Continuar esse pagamento" })).toHaveAttribute("href", "https://sandbox.asaas.com/i/pay_9");
    });

    it("de volta do Asaas, avisa que está confirmando e atualiza quando o pagamento entra", async () => {
        let calls = 0;
        server.use(
            http.get(`${BASE}/reservations/${RES}`, () => HttpResponse.json({ data: reservation })),
            http.get(`${BASE}/payments/reservation/${RES}`, () => {
                calls += 1;
                return HttpResponse.json({
                    data: calls < 2 ? payment() : payment({ reservationStatus: "PAID", confirmBy: null, online: { payableCents: 84000, pendingCharge: null }, entries: [{ id: "e1", kind: "PAYMENT", method: "PIX", amountCents: 36000, paidAt: "2026-11-19T15:00:00.000Z", note: "Pago online (Pix)", createdAt: "2026-11-19T15:00:00.000Z", recordedBy: null, online: true, refundableCents: 36000 }] }, { paidCents: 36000, netCents: 36000, balanceCents: 84000, missingToConfirmCents: 0, confirmed: true }),
                });
            }),
        );
        renderCheckout(`/checkout/${RES}?pago=1`);
        expect(await screen.findByText(/confirmando o seu pagamento com o asaas/i)).toBeInTheDocument();
        expect(await screen.findByText(/pagamento aprovado\. reserva confirmada/i, {}, { timeout: 8000 })).toBeInTheDocument();
        expect(screen.getByText(/PIX \(online\)/i)).toBeInTheDocument();
    }, 12000);

    it("salão no modo manual não mostra o pagamento online", async () => {
        server.use(
            http.get(`${BASE}/reservations/${RES}`, () => HttpResponse.json({ data: reservation })),
            http.get(`${BASE}/payments/reservation/${RES}`, () => HttpResponse.json({ data: payment({ mode: "MANUAL", online: null }) })),
        );
        renderCheckout();
        expect(await screen.findByRole("heading", { name: "Combine o pagamento com o salão" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /pagar agora/i })).not.toBeInTheDocument();
    });
});

function renderPanel(path: string) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "dono@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes><Route path="/painel" element={<Admin />} /></Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

describe("Painel → devolução pelo Asaas", () => {
    it("pagamento online não se desfaz; devolve pelo Asaas com o valor sugerido", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const online = { id: "e1", kind: "PAYMENT" as const, method: "PIX" as const, amountCents: 36000, paidAt: "2026-11-19T15:00:00.000Z", note: "Pago online (Pix)", createdAt: "2026-11-19T15:00:00.000Z", recordedBy: null, online: true, refundableCents: 36000 };
        let refundBody: unknown = null;
        server.use(
            http.get(`${BASE}/admin/reservations`, () => HttpResponse.json({ data: [{ ...reservation, id: "res-1", status: "CANCELLED" }], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 } })),
            http.get(`${BASE}/payments/reservation/res-1`, () => HttpResponse.json({ data: payment({ reservationId: "res-1", reservationStatus: "CANCELLED", confirmBy: null, refundDueCents: 28800, refundPercentage: 80, entries: [online] }, { paidCents: 36000, netCents: 36000 }) })),
            http.post(`${BASE}/admin/reservations/res-1/payments/e1/refund`, async ({ request }) => {
                refundBody = await request.json();
                return HttpResponse.json({ data: payment({ reservationId: "res-1", reservationStatus: "CANCELLED", confirmBy: null, entries: [{ ...online, refundableCents: 7200 }, { ...online, id: "e2", kind: "REFUND", amountCents: 28800, refundableCents: 0, note: "Devolvido pelo Asaas" }] }, { paidCents: 36000, refundedCents: 28800, netCents: 7200 }) });
            }),
        );
        const user = userEvent.setup();
        renderPanel("/painel?tab=reservations");
        await user.click(await screen.findByRole("button", { name: /pagamentos de joana lima/i }));
        const dialog = await screen.findByRole("dialog", { name: /pagamentos de joana lima/i });

        expect(await within(dialog).findByText(/· online/)).toBeInTheDocument();
        expect(within(dialog).queryByRole("button", { name: /desfazer/i })).not.toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: /devolver pelo asaas: pagamento/i }));

        // Sugere o que a política manda devolver (80% de R$ 360,00).
        const amount = within(dialog).getByLabelText(/valor a devolver/i);
        expect(amount).toHaveValue("288,00");
        await user.click(within(dialog).getByRole("button", { name: "Devolver pelo Asaas" }));

        await waitFor(() => expect(refundBody).toEqual({ amount: 288 }));
        expect(await screen.findByText(/devolução feita pelo asaas/i)).toBeInTheDocument();
    });
});

describe("Painel → Regras → Pagamento online", () => {
    const info = (over: Partial<PaymentAccountInfo> = {}): PaymentAccountInfo => ({ available: true, mode: "MANUAL", account: null, ...over });
    const settings = { slug: "salao", name: "Salão", legalName: "Maria Souza", documentNumber: "529.982.247-25", contactEmail: "maria@salao.com", contactWhatsapp: "(35) 99999-0000", contactPhone: null };

    it("cria a conta com os dados do contrato já preenchidos e mostra o próximo passo", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/admin/payment-account`, () => HttpResponse.json({ data: info() })),
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: settings })),
            http.post(`${BASE}/admin/payment-account`, async ({ request }) => {
                body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ data: info({ account: { status: "PENDING", detail: "Falta enviar os documentos ao Asaas", checkedAt: null, createdAt: "2026-10-16T00:00:00Z", onboardingUrl: null } }) }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderPanel("/painel?tab=rules&section=online");

        expect(await screen.findByLabelText("Nome completo ou razão social")).toHaveValue("Maria Souza");
        await user.click(screen.getByRole("button", { name: "Criar conta no Asaas" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/data de nascimento/);

        await user.type(screen.getByLabelText("Data de nascimento"), "1985-04-02");
        await user.type(screen.getByLabelText("Faturamento mensal (R$)"), "8.000");
        await user.type(screen.getByLabelText("CEP"), "37200-000");
        await user.type(screen.getByLabelText("Rua"), "Rua das Flores");
        await user.type(screen.getByLabelText("Número"), "10");
        await user.type(screen.getByLabelText("Bairro"), "Centro");
        await user.click(screen.getByRole("button", { name: "Criar conta no Asaas" }));

        await waitFor(() => expect(body).toMatchObject({ cpfCnpj: "52998224725", birthDate: "1985-04-02", incomeValue: 8000, postalCode: "37200000", mobilePhone: "35999990000", companyType: null }));
        expect(await screen.findByText("Falta enviar os documentos ao Asaas")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Atualizar situação" })).toBeInTheDocument();
    });

    it("com a conta aprovada, liga o pagamento online", async () => {
        const approved = { status: "APPROVED" as const, detail: null, checkedAt: null, createdAt: "2026-10-16T00:00:00Z", onboardingUrl: null };
        server.use(
            http.get(`${BASE}/admin/payment-account`, () => HttpResponse.json({ data: info({ account: approved }) })),
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: settings })),
            http.patch(`${BASE}/admin/payment-mode`, () => HttpResponse.json({ data: info({ account: approved, mode: "ONLINE" }) })),
        );
        const user = userEvent.setup();
        renderPanel("/painel?tab=rules&section=online");
        await user.click(await screen.findByRole("button", { name: "Ligar pagamento online" }));
        expect(await screen.findByText(/os clientes veem "pagar agora"/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Desligar" })).toBeInTheDocument();
    });

    it("sem o gateway na plataforma, explica que ainda não está disponível", async () => {
        server.use(
            http.get(`${BASE}/admin/payment-account`, () => HttpResponse.json({ data: info({ available: false }) })),
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: settings })),
        );
        renderPanel("/painel?tab=rules&section=online");
        expect(await screen.findByText(/ainda não está disponível no festário/i)).toBeInTheDocument();
    });
});
