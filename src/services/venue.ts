/**
 * @module services/venue
 * @description Funções para listar e buscar espaços para eventos.
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type { ListParams, PaginatedResult, Venue } from "../types";

/** Limite usado para popular selects com todos os espaços (máximo da API). */
export const ALL_VENUES_LIMIT = 100;

/**
 * Lista todos os espaços disponíveis para reserva.
 *
 * @see GET /venues
 */
export async function listVenues(signal?: AbortSignal): Promise<Venue[]> {
    // a listagem é paginada (padrão 20); selects e telas internas querem todos
    const { data } = await api.get("/venues", { signal, params: { limit: ALL_VENUES_LIMIT } });
    return data.data || [];
}

/**
 * Lista espaços com paginação e filtros (`minCapacity`, `maxPrice`, `q`;
 * `city` está reservado no contrato para o futuro).
 *
 * @see GET /venues?page=&limit=&minCapacity=&maxPrice=
 */
export async function listVenuesPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Venue>> {
    const { data } = await api.get("/venues", { signal, params: cleanParams(params) });
    return toPaginated<Venue>(data, params);
}

/**
 * Busca os detalhes de um espaço específico.
 *
 * @see GET /venues/:id
 */
export async function getVenue(
    venueId: string,
    signal?: AbortSignal,
): Promise<Venue> {
    const { data } = await api.get(`/venues/${venueId}`, { signal });
    return data.data;
}

/**
 * Atualiza os dados de um espaço (requer perfil ADMIN).
 *
 * @see PATCH /venues/:id
 */
export async function updateVenue(
    venueId: string,
    payload: Partial<Venue>,
): Promise<Venue> {
    const { data } = await api.patch(`/venues/${venueId}`, payload);
    return data.data;
}

/**
 * Cadastra um espaço no espaço (tenant) atual — OWNER ou ADMIN.
 * `basePricePerHour` é obrigatório.
 *
 * @see POST /venues
 */
export async function createVenue(payload: Partial<Venue>): Promise<Venue> {
    const { data } = await api.post("/venues", payload);
    return data.data;
}
