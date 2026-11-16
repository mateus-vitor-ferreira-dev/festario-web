/**
 * @module services/revokeSession
 * @description Revoga no backend o refresh token guardado, antes de a sessão local ser apagada.
 *
 * Usado tanto pelo "Sair" quanto pelas saídas forçadas do interceptor (token expirado, conta de
 * outro espaço): apagar só o localStorage deixaria o refresh token valendo no servidor até
 * expirar, e uma cópia vazada dele continuaria renovando a sessão.
 *
 * Usa `fetch` direto, e não a instância do axios, para não passar pelos interceptores (um 401
 * aqui não pode disparar outra renovação nem outra saída).
 */
import { env } from "../config/env";
import { readSession } from "../config/authStorage";
import { tenantHeaders } from "../config/tenantStorage";

/** Dispara e esquece: a saída local acontece mesmo se a rede falhar. */
export function revokeStoredRefreshToken(): void {
    const refreshToken = readSession()?.refreshToken;
    if (!refreshToken) return;
    fetch(`${env.apiUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tenantHeaders() },
        body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
}
