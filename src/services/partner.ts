/**
 * @module services/partner
 * @description Fornecedores que o salão indica (painel do dono, no tenant do salão) e o "Monte a sua
 * festa" de uma reserva.
 */
import api from "./api";
import type { PartnerSearchResult, PartyServices, SalonPartner } from "../types";

/** @see GET /admin/partners */
export async function listPartners(signal?: AbortSignal): Promise<SalonPartner[]> {
    const { data } = await api.get("/admin/partners", { signal });
    return data.data;
}

/** @see GET /admin/partners/search?q= */
export async function searchPartnerCandidates(q: string, signal?: AbortSignal): Promise<PartnerSearchResult[]> {
    const { data } = await api.get("/admin/partners/search", { signal, params: q ? { q } : {} });
    return data.data;
}

/** @see POST /admin/partners */
export async function addPartner(providerSlug: string, note?: string | null): Promise<SalonPartner[]> {
    const { data } = await api.post("/admin/partners", { providerSlug, note });
    return data.data;
}

/** @see PATCH /admin/partners/:id */
export async function updatePartner(id: string, input: { note?: string | null; sortOrder?: number }): Promise<SalonPartner[]> {
    const { data } = await api.patch(`/admin/partners/${id}`, input);
    return data.data;
}

/** @see DELETE /admin/partners/:id */
export async function removePartner(id: string): Promise<SalonPartner[]> {
    const { data } = await api.delete(`/admin/partners/${id}`);
    return data.data;
}

/**
 * A reserva é de um salão: a chamada vai com o `X-Tenant-Slug` dele, mesmo que o navegador esteja
 * com outro salão guardado.
 * @see GET /reservations/:id/party-services
 */
export async function getPartyServices(reservationId: string, tenantSlug?: string | null, signal?: AbortSignal): Promise<PartyServices> {
    const { data } = await api.get(`/reservations/${reservationId}/party-services`, {
        signal,
        ...(tenantSlug && { headers: { "X-Tenant-Slug": tenantSlug } }),
    });
    return data.data;
}
