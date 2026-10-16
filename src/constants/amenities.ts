/**
 * Comodidades de um espaço, com o nome que o cliente lê. Os códigos e a ordem são os do catálogo da API
 * (`src/domain/venue/amenities.ts`): um código novo precisa entrar nos dois.
 */
export const AMENITY_GROUPS = [
    {
        key: "STRUCTURE",
        label: "Estrutura",
        items: [
            { value: "POOL", label: "Piscina" },
            { value: "KIDS_AREA", label: "Área kids" },
            { value: "PLAYGROUND", label: "Parquinho" },
            { value: "COURT", label: "Quadra" },
            { value: "BARBECUE", label: "Churrasqueira" },
            { value: "GAME_ROOM", label: "Salão de jogos" },
            { value: "GARDEN", label: "Área verde" },
            { value: "DANCE_FLOOR", label: "Pista de dança" },
            { value: "STAGE", label: "Palco" },
            { value: "AIR_CONDITIONING", label: "Ar-condicionado" },
            { value: "PARKING", label: "Estacionamento" },
            { value: "ACCESSIBILITY", label: "Acessibilidade" },
            { value: "KITCHEN", label: "Cozinha equipada" },
            { value: "WIFI", label: "Wi-Fi" },
            { value: "SUPPORT_ROOM", label: "Camarim" },
        ],
    },
    {
        key: "SERVICE",
        label: "Serviços",
        items: [
            { value: "BUFFET", label: "Buffet" },
            { value: "WAITERS", label: "Garçons" },
            { value: "BAR", label: "Bebidas e bar" },
            { value: "DJ", label: "DJ e som" },
            { value: "LIVE_MUSIC", label: "Banda / música ao vivo" },
            { value: "DECORATION", label: "Decoração" },
            { value: "KIDS_ENTERTAINMENT", label: "Recreação infantil" },
            { value: "CAKE_SWEETS", label: "Bolo e doces" },
            { value: "PHOTOGRAPHY", label: "Fotografia" },
            { value: "SECURITY", label: "Segurança" },
            { value: "CLEANING", label: "Limpeza" },
        ],
    },
] as const;

export type AmenityCode = (typeof AMENITY_GROUPS)[number]["items"][number]["value"];

export const AMENITY_LABELS: Record<string, string> = Object.fromEntries(
    AMENITY_GROUPS.flatMap((g) => g.items.map((i) => [i.value, i.label])),
);

const ORDER = new Map<string, number>(AMENITY_GROUPS.flatMap((g) => g.items.map((i) => i.value)).map((v, i) => [v, i]));

/** Só os códigos conhecidos, sem repetir, na ordem do catálogo. */
export function sortAmenities(codes: readonly string[] | null | undefined): string[] {
    return [...new Set((codes ?? []).filter((c) => ORDER.has(c)))].sort((a, b) => ORDER.get(a)! - ORDER.get(b)!);
}
