import { CATEGORY_LABELS, PRICE_UNIT_SUFFIX } from "../constants/providers";
import type { ProviderCategory, ProviderPriceUnit } from "../types";
import { formatPrice } from "./salonFormat";

/** "R$ 45 por convidado"; nulo sem preço. */
export function formatProviderPrice(value: number | null | undefined, unit: ProviderPriceUnit | null | undefined): string | null {
    const price = formatPrice(value);
    return price ? `${price}${PRICE_UNIT_SUFFIX[unit ?? "FIXED"]}` : null;
}

export const categoryList = (categories: ProviderCategory[]) => categories.map((c) => CATEGORY_LABELS[c]).join(", ");

/** "2026-11-21" → "sábado, 21 de novembro de 2026". */
export function formatEventDate(dateKey: string, opts: { weekday?: boolean } = { weekday: true }): string {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { ...(opts.weekday && { weekday: "long" }), day: "numeric", month: "long", year: "numeric" });
}

/** Link do WhatsApp com DDI e uma mensagem pronta. */
export function whatsappLink(raw: string | null | undefined, text?: string): string | null {
    const digits = (raw ?? "").replace(/\D/g, "");
    if (digits.length < 10) return null;
    const full = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** "(35) 99999-0000" a partir dos dígitos guardados pela API. */
export function formatPhoneDigits(raw: string | null | undefined): string {
    const d = (raw ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return raw ?? "";
}

export function instagramUrl(handle: string): string {
    return `https://instagram.com/${handle.replace(/^@/, "").trim()}`;
}
