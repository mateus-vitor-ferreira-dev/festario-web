/**
 * @module services/payment
 * @description Pagamento da reserva. Combinado com o salão: o cliente paga direto (PIX, dinheiro, cartão na
 * maquininha) e o dono registra. Online (salões com conta no Asaas): o cliente paga por Pix ou cartão e o
 * dinheiro cai na conta do salão. Nos dois, a reserva confirma quando o recebido chega ao sinal (ou ao total).
 */
import api from "./api";
import { tenantHeaderFor } from "../config/tenantStorage";
import type { OnlineChargeResult, OnlineMethod, PaymentAccountHolder, PaymentAccountInfo, PaymentEntryInput, ReservationPayment } from "../types";

/**
 * Resumo do pagamento da reserva, os lançamentos e como pagar (instruções e contatos do salão).
 * O cliente vê as próprias reservas de qualquer salão; o salão da reserva vai no header.
 *
 * @see GET /payments/reservation/:reservationId
 */
export async function getReservationPayment(reservationId: string, tenantSlug?: string | null, signal?: AbortSignal): Promise<ReservationPayment> {
    const { data } = await api.get(`/payments/reservation/${reservationId}`, { signal, headers: tenantHeaderFor(tenantSlug) });
    return data.data;
}

/**
 * O dono registra um pagamento recebido ou uma devolução.
 *
 * @see POST /admin/reservations/:id/payments
 */
export async function recordPaymentEntry(reservationId: string, payload: PaymentEntryInput): Promise<ReservationPayment> {
    const { data } = await api.post(`/admin/reservations/${reservationId}/payments`, payload);
    return data.data;
}

/**
 * Desfaz um lançamento feito por engano.
 *
 * @see DELETE /admin/reservations/:id/payments/:entryId
 */
export async function deletePaymentEntry(reservationId: string, entryId: string): Promise<ReservationPayment> {
    const { data } = await api.delete(`/admin/reservations/${reservationId}/payments/${entryId}`);
    return data.data;
}

/**
 * O cliente paga online o que falta (o sinal, ou o restante). Na primeira vez em cada salão a API pede o
 * CPF (erro `CPF_REQUIRED`), que vai só para o Asaas.
 *
 * @see POST /payments/reservation/:reservationId/online
 */
export async function payOnline(reservationId: string, method: OnlineMethod, cpfCnpj?: string | null, tenantSlug?: string | null): Promise<OnlineChargeResult> {
    const { data } = await api.post(`/payments/reservation/${reservationId}/online`, { method, ...(cpfCnpj ? { cpfCnpj } : {}) }, { headers: tenantHeaderFor(tenantSlug) });
    return data.data;
}

/** Devolve um pagamento online pelo Asaas. @see POST /admin/reservations/:id/payments/:entryId/refund */
export async function refundOnlineEntry(reservationId: string, entryId: string, amount: number): Promise<ReservationPayment> {
    const { data } = await api.post(`/admin/reservations/${reservationId}/payments/${entryId}/refund`, { amount });
    return data.data;
}

/** @see GET /admin/payment-account */
export async function getPaymentAccount(signal?: AbortSignal): Promise<PaymentAccountInfo> {
    const { data } = await api.get("/admin/payment-account", { signal });
    return data.data;
}

/** Cria a conta do salão no Asaas. @see POST /admin/payment-account */
export async function createPaymentAccount(holder: PaymentAccountHolder): Promise<PaymentAccountInfo> {
    const { data } = await api.post("/admin/payment-account", holder);
    return data.data;
}

/** Consulta a aprovação no Asaas e o link dos documentos. @see POST /admin/payment-account/refresh */
export async function refreshPaymentAccount(): Promise<PaymentAccountInfo> {
    const { data } = await api.post("/admin/payment-account/refresh");
    return data.data;
}

/** Liga (conta aprovada) ou desliga o pagamento online. @see PATCH /admin/payment-mode */
export async function setPaymentMode(mode: "MANUAL" | "ONLINE"): Promise<PaymentAccountInfo> {
    const { data } = await api.patch("/admin/payment-mode", { mode });
    return data.data;
}
