/**
 * @module services/availability
 * @description Funções para consultar a disponibilidade de um espaço.
 * Usadas pelo `AvailabilityCalendar` para colorir datas no calendário.
 *
 * - **Datas bloqueadas**: períodos manualmente bloqueados pelo admin (manutenção, etc.)
 * - **Datas ocupadas**: períodos com reservas PENDING ou PAID
 */
import api from "./api";
import type { BlockedDate, OccupiedDate } from "../types";

/**
 * Retorna os períodos manualmente bloqueados para um espaço.
 *
 * @see GET /blocked-dates?venueId=
 */
export async function getBlockedDates(
    venueId: string,
    signal?: AbortSignal,
): Promise<BlockedDate[]> {
    const { data } = await api.get("/blocked-dates", { params: { venueId }, signal });
    return data.data || [];
}

/**
 * Retorna os períodos com reservas ativas (PENDING ou PAID) para um espaço.
 * Endpoint público — não requer autenticação.
 *
 * @see GET /reservations/occupied-dates?venueId=
 */
export async function getOccupiedDates(
    venueId: string,
    signal?: AbortSignal,
): Promise<OccupiedDate[]> {
    const { data } = await api.get("/reservations/occupied-dates", { params: { venueId }, signal });
    return data.data || [];
}
