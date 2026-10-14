/** Aceita "1.500,50", "1500.5" ou "1500" e devolve "1500.5" (vazio se inválido). */
export function parseMoney(input: string): string {
    const raw = input.replace(/[^\d.,]/g, "");
    if (!raw) return "";
    // com vírgula, os pontos são separadores de milhar (pt-BR)
    const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) return "";
    return String(Math.round(n * 100) / 100);
}
