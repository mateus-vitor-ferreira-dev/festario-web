/**
 * Aceita "1.500,50", "1.500", "1500.5" ou "1500" e devolve "1500.5" (vazio se inválido).
 * Sem vírgula, pontos seguidos de grupos de 3 dígitos são milhar (pt-BR): "1.200" = 1200.
 */
export function parseMoney(input: string): string {
    const raw = input.replace(/[^\d.,]/g, "");
    if (!raw) return "";
    let normalized: string;
    if (raw.includes(",")) normalized = raw.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, "");
    else normalized = raw;
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) return "";
    return String(Math.round(n * 100) / 100);
}
