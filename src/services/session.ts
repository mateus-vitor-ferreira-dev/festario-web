/**
 * @module services/session
 * @description Renovação da sessão pelo `/auth/refresh`, usada ao abrir a página e pelo interceptor
 * do axios quando o access token vence.
 *
 * Usa `fetch` direto, e não a instância do axios, para não passar pelos interceptores (um 401 aqui
 * não pode disparar outra renovação). Pedidos simultâneos dividem a mesma chamada: dois refresh com o
 * mesmo token fariam a API girar o primeiro e enxergar o segundo como reuso.
 */
import { env } from "../config/env";
import {
    clearSession,
    hasSessionHint,
    readPreviewRefreshToken,
    STORAGE_KEY,
    readSession,
    takeLegacyRefreshToken,
    writeSession,
} from "../config/authStorage";
import { isBodyRefreshMode } from "../config/refreshMode";
import { tenantHeaders } from "../config/tenantStorage";
import type { AuthSession, User } from "../types";

/** Cabeçalho que a API exige nas rotas que leem o cookie da sessão (proteção contra CSRF). */
export const CSRF_HEADERS = { "X-Requested-With": "festario" } as const;

/** Cabeçalhos de sessão de toda chamada à API. */
export function sessionHeaders(): Record<string, string> {
    return isBodyRefreshMode() ? { ...CSRF_HEADERS, "X-Refresh-Mode": "body" } : { ...CSRF_HEADERS };
}

let inflight: Promise<AuthSession | null> | null = null;

interface RefreshPayload {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
}

async function doRefresh(): Promise<AuthSession | null> {
    // Sessão do formato antigo: o refresh token dela vai no corpo uma vez só; a resposta grava o
    // cookie e daí em diante é ele que vale.
    const bodyToken = takeLegacyRefreshToken() ?? readPreviewRefreshToken();
    if (isBodyRefreshMode() && !bodyToken) {
        clearSession();
        return null;
    }

    let res: Response;
    try {
        res = await fetch(`${env.apiUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...sessionHeaders(), ...tenantHeaders() },
            body: JSON.stringify(bodyToken ? { refreshToken: bodyToken } : {}),
        });
    } catch {
        // Sem rede a sessão pode muito bem estar valendo: o marcador fica para a próxima tentativa.
        return null;
    }

    if (!res.ok) {
        clearSession();
        return null;
    }

    const { data } = (await res.json()) as { data?: RefreshPayload };
    const user = data?.user ?? readSession()?.user;
    if (!data?.accessToken || !user) {
        clearSession();
        return null;
    }
    const session: AuthSession = { user, token: data.accessToken, refreshToken: data.refreshToken ?? null };
    writeSession(session);
    return readSession();
}

/** Renova a sessão; `null` quando não há sessão para renovar. */
export function refreshSession(): Promise<AuthSession | null> {
    if (!inflight) {
        inflight = doRefresh().finally(() => {
            inflight = null;
        });
    }
    return inflight;
}

/**
 * Há com que renovar a sessão? O cookie HttpOnly não é visível daqui: vale o marcador de login, uma
 * sessão antiga a migrar ou, nas prévias, o refresh token da aba.
 */
export function hasRefreshCredential(): boolean {
    if (localStorage.getItem(STORAGE_KEY) !== null) return true;
    if (isBodyRefreshMode()) return readPreviewRefreshToken() !== null;
    return hasSessionHint();
}

/** Ao abrir a página: só tenta restaurar quando não há sessão em memória e há com que renová-la. */
export function canRestoreSession(): boolean {
    return !readSession() && hasRefreshCredential();
}
