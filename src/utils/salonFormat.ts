/**
 * Textos curtos da vitrine: distância, endereço, preço e capacidade de um salão ou espaço.
 */

/** "a 850 m", "a 3,2 km", "a 48 km". */
export function formatDistance(km: number | null | undefined): string | null {
    if (km == null || !Number.isFinite(km)) return null;
    if (km < 1) return `a ${Math.max(100, Math.round((km * 1000) / 50) * 50)} m`;
    const digits = km < 10 ? 1 : 0;
    return `a ${km.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })} km`;
}

/** "Jardim Vila Rica, Lavras - MG"; partes vazias somem. */
export function formatPlace(neighborhood?: string | null, city?: string | null, state?: string | null): string {
    const cityState = city && state ? `${city} - ${state}` : city || state || "";
    return [neighborhood, cityState].filter(Boolean).join(", ");
}

/** Preço sem centavos, para "a partir de": R$ 1.200. */
export function formatPrice(value: number | null | undefined): string | null {
    if (value == null) return null;
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/** "até 150 convidados" ou "de 40 a 150 convidados". */
export function formatCapacityRange({ min, max }: { min: number; max: number }): string {
    return min === max || !min ? `até ${max} convidados` : `de ${min} a ${max} convidados`;
}
