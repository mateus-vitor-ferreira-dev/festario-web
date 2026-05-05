/**
 * @module services/reservation
 * @description Funções de acesso à API de reservas.
 *
 * Fluxo principal:
 *   1. `quoteReservation` — calcula preço antes de confirmar
 *   2. `createReservation` — cria a reserva (status PENDING)
 *   3. Usuário paga via Checkout (Stripe ou PIX)
 *   4. `cancelReservation` — cancelamento com reembolso proporcional
 */
import api from "./api";
import type {
    QuotePayload,
    QuoteResult,
    CreateReservationPayload,
    Reservation,
    PaginatedResult,
} from "../types";

/**
 * Calcula o preço estimado de uma reserva sem criá-la.
 *
 * @see POST /reservations/quote
 */
export async function quoteReservation(
    payload: QuotePayload,
    signal?: AbortSignal,
): Promise<QuoteResult> {
    const { data } = await api.post("/reservations/quote", payload, { signal });
    return data.data;
}

/**
 * Cria uma nova reserva com status PENDING.
 * O campo `termsAccepted: true` é obrigatório pela API.
 *
 * @see POST /reservations
 */
export async function createReservation(
    payload: CreateReservationPayload,
): Promise<Reservation> {
    const { data } = await api.post("/reservations", payload);
    return data.data;
}

/**
 * Lista todas as reservas do usuário autenticado.
 *
 * @see GET /reservations
 */
export async function listReservations(
    signal?: AbortSignal,
): Promise<Reservation[]> {
    const { data } = await api.get("/reservations", { signal });
    return data.data || [];
}

/**
 * Lista as reservas do usuário com suporte a paginação.
 *
 * @see GET /reservations
 */
export async function listReservationsPaginated(
    signal?: AbortSignal,
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
): Promise<PaginatedResult<Reservation>> {
    const { data } = await api.get("/reservations", { signal, params: { page, limit } });
    return { data: data.data || [], meta: data.meta };
}

/**
 * Busca os detalhes completos de uma reserva específica.
 *
 * @see GET /reservations/:id
 */
export async function getReservation(
    reservationId: string,
    signal?: AbortSignal,
): Promise<Reservation> {
    const { data } = await api.get(`/reservations/${reservationId}`, { signal });
    return data.data;
}

/**
 * Cancela uma reserva PENDING ou PAID.
 * Para reservas pagas, o backend processa o reembolso proporcional automaticamente
 * conforme a política de cancelamento (100% / 70% / 40% / 0%).
 *
 * @see PATCH /reservations/:id/cancel
 */
export async function cancelReservation(
    reservationId: string,
): Promise<Reservation> {
    const { data } = await api.patch(`/reservations/${reservationId}/cancel`);
    return data.data;
}
