/**
 * Imagens servidas pela API em vários tamanhos (WebP): `srcset` para o navegador escolher o menor que
 * serve, e o tamanho intrínseco para reservar o espaço antes de carregar (sem pulo de layout).
 */
import type { ImageVariant } from "../types";

export function srcSet(variants: ImageVariant[] | null | undefined): string | undefined {
    if (!variants?.length) return undefined;
    return variants.map((v) => `${v.url} ${v.width}w`).join(", ");
}

/** O menor tamanho com pelo menos `minWidth` px (ou o maior que houver). */
export function pickVariant(variants: ImageVariant[] | null | undefined, minWidth: number): ImageVariant | null {
    if (!variants?.length) return null;
    const sorted = [...variants].sort((a, b) => a.width - b.width);
    return sorted.find((v) => v.width >= minWidth) ?? sorted[sorted.length - 1];
}

const STOP_WORDS = new Set(["de", "da", "das", "do", "dos", "e", "a", "o"]);

/** "Recanto Vila Rica" → "RV"; "Salão das Flores" → "SF"; "Jardim" → "JA". */
export function initials(name: string | null | undefined): string {
    const words = (name ?? "").trim().split(/\s+/).filter((w) => w && !STOP_WORDS.has(w.toLowerCase()));
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}
