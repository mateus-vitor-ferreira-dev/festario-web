/**
 * @module services/venue
 * @description Funções para listar e buscar espaços para eventos.
 */
import api from "./api";
import type { Venue } from "../types";

/**
 * Lista todos os espaços disponíveis para reserva.
 *
 * @see GET /venues
 */
export async function listVenues(signal?: AbortSignal): Promise<Venue[]> {
    const { data } = await api.get("/venues", { signal });
    return data.data || [];
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
