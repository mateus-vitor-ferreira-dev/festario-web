/**
 * @module utils/returnPath
 * @description Para onde voltar depois de entrar (`?voltar=`): só caminhos dentro do app. Um endereço
 * externo, `//outro.site` ou `/\outro.site` é ignorado, para o link de login não virar redirecionamento
 * para fora.
 */
export const RETURN_PARAM = "voltar";

export function safeReturnPath(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const path = raw.trim();
    if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
    // Caracteres de controle podem ser lidos pelo navegador como parte de outro endereço.
    if (/[\u0000-\u001f\u007f]/.test(path)) return null;
    return path;
}

/** `/login?voltar=...` (ou `/cadastro`), levando o caminho de volta quando houver. */
export function withReturn(base: "/login" | "/cadastro", returnPath: string | null | undefined): string {
    const safe = safeReturnPath(returnPath);
    return safe ? `${base}?${RETURN_PARAM}=${encodeURIComponent(safe)}` : base;
}
