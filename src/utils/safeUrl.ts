/**
 * Link vindo de dado de terceiros (salão, prestador) só vira `href` se for http(s). O React 19 já
 * bloqueia `javascript:`, mas a regra fica explícita aqui para não depender disso nem de outros
 * esquemas (`data:`, `vbscript:`, `file:`).
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw.trim());
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}
