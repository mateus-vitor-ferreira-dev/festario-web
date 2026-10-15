/**
 * @module services/payment
 * @description Funções para iniciar e consultar pagamentos.
 *
 * Métodos suportados:
 * - **Stripe** (cartão de crédito) — redireciona para checkout.stripe.com
 * - **PIX** (Mercado Pago) — retorna QR Code + copia-e-cola para exibição inline
 */
import api from "./api";
import { tenantHeaderFor } from "../config/tenantStorage";
import type { PixChargeResult, PaymentStatusResult } from "../types";

/**
 * Cria uma sessão de checkout no Stripe para pagamento via cartão.
 * Retorna a URL de redirecionamento para o checkout hospedado pelo Stripe.
 *
 * @see POST /payments/checkout/:reservationId
 */
export async function createCheckoutSession(
    reservationId: string,
    tenantSlug?: string | null,
): Promise<{ url: string }> {
    const { data } = await api.post(`/payments/checkout/${reservationId}`, undefined, { headers: tenantHeaderFor(tenantSlug) });
    return data;
}

/**
 * Gera uma cobrança PIX via Mercado Pago para a reserva.
 * Retorna os dados necessários para exibir o QR Code ao usuário.
 *
 * @see POST /payments/pix/:reservationId
 */
export async function createPixCharge(
    reservationId: string,
    tenantSlug?: string | null,
): Promise<PixChargeResult> {
    const { data } = await api.post(`/payments/pix/${reservationId}`, undefined, { headers: tenantHeaderFor(tenantSlug) });
    return data.data;
}

/**
 * Consulta o status atual do pagamento de uma reserva.
 * Usado pelo polling no Checkout para detectar quando o PIX é pago.
 *
 * @see GET /payments/reservation/:reservationId
 */
export async function getPaymentStatus(
    reservationId: string,
    signal?: AbortSignal,
): Promise<PaymentStatusResult> {
    const { data } = await api.get(`/payments/reservation/${reservationId}`, { signal });
    return data.data;
}
