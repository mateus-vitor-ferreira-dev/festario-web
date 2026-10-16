/**
 * @module services/payment
 * @description Pagamento combinado com o salão. Não há cobrança online: o cliente paga direto ao
 * salão (PIX, dinheiro, cartão na maquininha) e o dono registra o que recebeu no painel. A reserva é
 * confirmada quando o recebido chega ao sinal (ou ao total).
 */
import api from "./api";
import { tenantHeaderFor } from "../config/tenantStorage";
import type { PaymentEntryInput, ReservationPayment } from "../types";

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
