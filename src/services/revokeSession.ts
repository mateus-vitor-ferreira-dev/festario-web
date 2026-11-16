/**
 * @module services/revokeSession
 * @description Revoga no backend o refresh token da sessão, antes de a sessão local ser apagada.
 *
 * Usado tanto pelo "Sair" quanto pelas saídas forçadas do interceptor (token expirado, conta de
 * outro espaço): apagar só o estado do navegador deixaria o refresh token valendo no servidor até
 * expirar, e uma cópia vazada dele continuaria renovando a sessão. O token vai no cookie HttpOnly
 * (a API o apaga na resposta) ou, nas prévias, no corpo.
 *
 * Usa `fetch` direto, e não a instância do axios, para não passar pelos interceptores (um 401
 * aqui não pode disparar outra renovação nem outra saída).
 */
import { env } from "../config/env";
import { hasSessionHint, readPreviewRefreshToken, readSession } from "../config/authStorage";
import { isBodyRefreshMode } from "../config/refreshMode";
import { tenantHeaders } from "../config/tenantStorage";
import { sessionHeaders } from "./session";

/** Dispara e esquece: a saída local acontece mesmo se a rede falhar. */
export function revokeStoredRefreshToken(): void {
    const previewToken = readPreviewRefreshToken();
    if (isBodyRefreshMode() ? !previewToken : !readSession() && !hasSessionHint()) return;
    fetch(`${env.apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...sessionHeaders(), ...tenantHeaders() },
        body: JSON.stringify(previewToken ? { refreshToken: previewToken } : {}),
    }).catch(() => {});
}
