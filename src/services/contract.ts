/**
 * @module services/contract
 * @description Contrato de locação montado pela API com os dados do salão.
 */
import api from "./api";
import { tenantHeaderFor } from "../config/tenantStorage";
import type { ContractDocument, QuotePayload } from "../types";

/**
 * Prévia do contrato antes de reservar: mesmo corpo do orçamento.
 *
 * @see POST /reservations/contract-preview
 */
export async function previewContract(payload: QuotePayload): Promise<ContractDocument> {
    const { data } = await api.post("/reservations/contract-preview", payload);
    return data.data;
}

/**
 * Contrato aceito de uma reserva. A reserva pode ser de outro salão: a chamada vai para o salão dela.
 *
 * @see GET /reservations/:id/contract
 */
export async function getReservationContract(reservationId: string, tenantSlug?: string | null): Promise<ContractDocument> {
    const { data } = await api.get(`/reservations/${reservationId}/contract`, { headers: tenantHeaderFor(tenantSlug) });
    return data.data;
}
