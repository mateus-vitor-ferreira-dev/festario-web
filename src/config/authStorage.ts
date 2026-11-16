/**
 * @module config/authStorage
 * @description Sessão do navegador.
 *
 * - O access token e o usuário ficam só em memória (estado deste módulo): um script injetado na
 *   página não acha token nenhum no localStorage, e recarregar a página pede um novo à API.
 * - O refresh token fica no cookie HttpOnly `festario_rt`, que a API grava e só ela lê. Nas
 *   prévias (`*.workers.dev`), onde o cookie não chega à API, ele fica no sessionStorage da aba.
 * - No localStorage fica só um marcador sem segredo nenhum dizendo que houve login, para o
 *   carregamento da página saber se vale tentar restaurar a sessão (o cookie HttpOnly não é visível
 *   daqui). Sem ele, todo visitante anônimo faria um refresh fadado ao 401.
 */
import type { AuthSession } from "../types";
import { isBodyRefreshMode } from "./refreshMode";

/** Sessão antiga, com os dois tokens no localStorage. Só é lida uma vez, para migrar. */
export const STORAGE_KEY = "festario:userData";
export const SESSION_HINT_KEY = "festario:sessao";
export const PREVIEW_REFRESH_KEY = "festario:refreshToken";

type Listener = (session: AuthSession | null) => void;

let current: AuthSession | null = null;
const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((listener) => listener(current));
}

export function readSession(): AuthSession | null {
    return current;
}

/** Avisa quem mostra a sessão (o AuthContext) quando ela muda fora do React, como no refresh do interceptor. */
export function subscribeSession(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function storePreviewRefreshToken(refreshToken: string | null | undefined) {
    if (refreshToken && isBodyRefreshMode()) sessionStorage.setItem(PREVIEW_REFRESH_KEY, refreshToken);
}

export function writeSession(session: AuthSession): void {
    current = { user: session.user, token: session.token };
    storePreviewRefreshToken(session.refreshToken);
    localStorage.setItem(SESSION_HINT_KEY, "1");
    notify();
}

export function clearSession(): void {
    current = null;
    sessionStorage.removeItem(PREVIEW_REFRESH_KEY);
    localStorage.removeItem(SESSION_HINT_KEY);
    localStorage.removeItem(STORAGE_KEY);
    notify();
}

/**
 * Troca o access token da sessão atual (refresh, troca de e-mail ou de senha). Fora das prévias o
 * refresh token novo já veio no cookie e `refreshToken` chega vazio.
 */
export function updateSessionTokens(accessToken: string, refreshToken?: string | null): void {
    if (!current) return;
    current = { ...current, token: accessToken };
    storePreviewRefreshToken(refreshToken);
    notify();
}

/** Refresh token que o front precisa mandar no corpo: só existe nas prévias. */
export function readPreviewRefreshToken(): string | null {
    return isBodyRefreshMode() ? sessionStorage.getItem(PREVIEW_REFRESH_KEY) : null;
}

export function hasSessionHint(): boolean {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
}

/**
 * Refresh token da sessão do formato antigo, para ser trocado uma única vez pelo cookie. Os dois
 * formatos antigos (usuário na raiz ou em `user`) guardavam o token na raiz. A sessão antiga só é
 * apagada aqui quando não tem token aproveitável; com token, ela fica até a API responder (ver
 * `dropLegacySession`), para uma falha de rede não deslogar ninguém.
 */
export function readLegacyRefreshToken(): string | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    let token: unknown = null;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") token = (parsed as Record<string, unknown>).refreshToken;
    } catch {
        // sessão antiga ilegível: não há o que migrar
    }
    if (typeof token === "string" && token) return token;
    localStorage.removeItem(STORAGE_KEY);
    return null;
}

/** A API já respondeu à migração (trocou o token ou o recusou): a sessão antiga sai de vez. */
export function dropLegacySession(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/** Só para os testes: zera o estado em memória entre um caso e outro. */
export function resetSessionForTests(): void {
    current = null;
}
