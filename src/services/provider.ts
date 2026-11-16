/**
 * @module services/provider
 * @description Marketplace: vitrine de prestadores e o painel "Meu negócio". A API atende `/providers`
 * fora do contexto de um salão: o `X-Tenant-Slug` guardado no navegador não muda nada aqui.
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type { UploadProgress } from "./media";
import type {
    ListParams, MyProvider, PackageInput, PaginatedResult, ProviderCard, ProviderDetail, ProviderPhoto, ProviderProfileInput, SalonOrigin,
} from "../types";

export interface ProviderList extends PaginatedResult<ProviderCard> {
    origin: SalonOrigin | null;
}

/** @see GET /providers?category=&q=&city=&state=&date=&maxPrice=&lat=&lng=&cep=&origin=&sort=&page=&limit= */
export async function listProviders(params: ListParams = {}, signal?: AbortSignal): Promise<ProviderList> {
    const { data } = await api.get("/providers", { signal, params: cleanParams(params) });
    return { ...toPaginated<ProviderCard>(data, params), origin: data?.origin ?? null };
}

/** @see GET /providers/:slug */
export async function getProvider(slug: string, signal?: AbortSignal): Promise<ProviderDetail> {
    const { data } = await api.get(`/providers/${encodeURIComponent(slug)}`, { signal });
    return data.data;
}

// ── Meu negócio ─────────────────────────────────────────────────────────────

/** Nulo quando a conta ainda não tem perfil. @see GET /providers/me */
export async function getMyProvider(signal?: AbortSignal): Promise<MyProvider | null> {
    const { data } = await api.get("/providers/me", { signal });
    return data.data;
}

/** @see POST /providers/me */
export async function createMyProvider(input: ProviderProfileInput & { name: string }): Promise<MyProvider> {
    const { data } = await api.post("/providers/me", input);
    return data.data;
}

/** @see PATCH /providers/me */
export async function updateMyProvider(input: ProviderProfileInput): Promise<MyProvider> {
    const { data } = await api.patch("/providers/me", input);
    return data.data;
}

/** @see POST /providers/me/publish */
export async function publishMyProvider(): Promise<MyProvider> {
    const { data } = await api.post("/providers/me/publish");
    return data.data;
}

/** @see POST /providers/me/unpublish */
export async function unpublishMyProvider(): Promise<MyProvider> {
    const { data } = await api.post("/providers/me/unpublish");
    return data.data;
}

/** @see POST /providers/me/packages */
export async function addPackage(input: PackageInput & { name: string; price: number }): Promise<MyProvider> {
    const { data } = await api.post("/providers/me/packages", input);
    return data.data;
}

/** @see PATCH /providers/me/packages/:id */
export async function updatePackage(id: string, input: PackageInput): Promise<MyProvider> {
    const { data } = await api.patch(`/providers/me/packages/${id}`, input);
    return data.data;
}

/** @see DELETE /providers/me/packages/:id */
export async function deletePackage(id: string): Promise<MyProvider> {
    const { data } = await api.delete(`/providers/me/packages/${id}`);
    return data.data;
}

/** @see POST /providers/me/busy-dates */
export async function addBusyDates(dates: string[], note?: string | null): Promise<MyProvider> {
    const { data } = await api.post("/providers/me/busy-dates", { dates, note });
    return data.data;
}

/** @see DELETE /providers/me/busy-dates/:id */
export async function removeBusyDate(id: string): Promise<MyProvider> {
    const { data } = await api.delete(`/providers/me/busy-dates/${id}`);
    return data.data;
}

const progressOf = (onProgress?: UploadProgress) =>
    onProgress ? { onUploadProgress: (e: { loaded: number; total?: number }) => onProgress(e.total ? e.loaded / e.total : 0) } : {};

/** A primeira foto vira a capa. @see POST /providers/me/photos */
export async function uploadPortfolioPhoto(file: File, alt: string, onProgress?: UploadProgress): Promise<ProviderPhoto[]> {
    const form = new FormData();
    form.append("alt", alt);
    form.append("photo", file);
    const { data } = await api.post("/providers/me/photos", form, progressOf(onProgress));
    return (data.data as MyProvider).photos;
}

/** @see PATCH /providers/me/photos/:photoId */
export async function updatePortfolioPhoto(photoId: string, input: { alt?: string; isCover?: true }): Promise<ProviderPhoto[]> {
    const { data } = await api.patch(`/providers/me/photos/${photoId}`, input);
    return (data.data as MyProvider).photos;
}

/** @see PUT /providers/me/photos/order */
export async function reorderPortfolio(ids: string[]): Promise<ProviderPhoto[]> {
    const { data } = await api.put("/providers/me/photos/order", { ids });
    return (data.data as MyProvider).photos;
}

/** @see DELETE /providers/me/photos/:photoId */
export async function deletePortfolioPhoto(photoId: string): Promise<ProviderPhoto[]> {
    const { data } = await api.delete(`/providers/me/photos/${photoId}`);
    return (data.data as MyProvider).photos;
}
