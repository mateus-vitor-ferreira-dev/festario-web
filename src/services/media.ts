/**
 * @module services/media
 * @description Marca do salão (logo e cor) e fotos dos espaços, no painel do dono. As imagens vão em
 * multipart; a API confere o tipo pelo conteúdo, gera WebP em três tamanhos e devolve as URLs.
 */
import api from "./api";
import type { SalonBranding, VenuePhoto } from "../types";

/** Progresso do envio, de 0 a 1. */
export type UploadProgress = (fraction: number) => void;

const progressOf = (onProgress?: UploadProgress) =>
    onProgress ? { onUploadProgress: (e: { loaded: number; total?: number }) => onProgress(e.total ? e.loaded / e.total : 0) } : {};

/** @see GET /tenant/branding */
export async function getBranding(signal?: AbortSignal): Promise<SalonBranding> {
    const { data } = await api.get("/tenant/branding", { signal });
    return data.data;
}

/** Cor da marca; nula volta à cor da plataforma. @see PUT /tenant/branding */
export async function updateBrandColor(primaryColor: string | null): Promise<SalonBranding> {
    const { data } = await api.put("/tenant/branding", { primaryColor });
    return data.data;
}

/** @see POST /tenant/branding/logo */
export async function uploadLogo(file: File, onProgress?: UploadProgress): Promise<SalonBranding> {
    const form = new FormData();
    form.append("logo", file);
    const { data } = await api.post("/tenant/branding/logo", form, progressOf(onProgress));
    return data.data;
}

/** @see DELETE /tenant/branding/logo */
export async function removeLogo(): Promise<SalonBranding> {
    const { data } = await api.delete("/tenant/branding/logo");
    return data.data;
}

/** @see GET /venues/:id/photos */
export async function listVenuePhotos(venueId: string, signal?: AbortSignal): Promise<VenuePhoto[]> {
    const { data } = await api.get(`/venues/${venueId}/photos`, { signal });
    return data.data;
}

/** A primeira foto do espaço vira a capa. @see POST /venues/:id/photos */
export async function uploadVenuePhoto(venueId: string, file: File, alt: string, onProgress?: UploadProgress): Promise<VenuePhoto[]> {
    const form = new FormData();
    form.append("alt", alt);
    form.append("photo", file);
    const { data } = await api.post(`/venues/${venueId}/photos`, form, progressOf(onProgress));
    return data.data;
}

/** Texto alternativo e/ou capa. @see PATCH /venues/:id/photos/:photoId */
export async function updateVenuePhoto(venueId: string, photoId: string, payload: { alt?: string; isCover?: true }): Promise<VenuePhoto[]> {
    const { data } = await api.patch(`/venues/${venueId}/photos/${photoId}`, payload);
    return data.data;
}

/** A lista completa de ids, na ordem nova. @see PUT /venues/:id/photos/order */
export async function reorderVenuePhotos(venueId: string, ids: string[]): Promise<VenuePhoto[]> {
    const { data } = await api.put(`/venues/${venueId}/photos/order`, { ids });
    return data.data;
}

/** @see DELETE /venues/:id/photos/:photoId */
export async function deleteVenuePhoto(venueId: string, photoId: string): Promise<VenuePhoto[]> {
    const { data } = await api.delete(`/venues/${venueId}/photos/${photoId}`);
    return data.data;
}
