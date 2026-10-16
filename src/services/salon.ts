/**
 * @module services/salon
 * @description Vitrine pública de salões. A API atende `/salons` fora do contexto de um salão, então o
 * `X-Tenant-Slug` guardado no navegador não filtra a vitrine.
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type { ListParams, PaginatedResult, SalonCard, SalonDetail, SalonOrigin, SalonOriginParams } from "../types";

export interface SalonList extends PaginatedResult<SalonCard> {
    origin: SalonOrigin | null;
}

/** @see GET /salons?q=&city=&maxPrice=&minCapacity=&hasPool=&hasKidsArea=&lat=&lng=&cep=&origin=&sort=&page=&limit= */
export async function listSalons(params: ListParams = {}, signal?: AbortSignal): Promise<SalonList> {
    const { data } = await api.get("/salons", { signal, params: cleanParams(params) });
    return { ...toPaginated<SalonCard>(data, params), origin: data?.origin ?? null };
}

/** @see GET /salons/:slug?lat=&lng=&cep=&origin= */
export async function getSalon(slug: string, origin: SalonOriginParams = {}, signal?: AbortSignal): Promise<SalonDetail> {
    const { data } = await api.get(`/salons/${encodeURIComponent(slug)}`, { signal, params: origin });
    return data.data;
}
