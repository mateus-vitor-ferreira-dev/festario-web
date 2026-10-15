/**
 * @module api
 * @description Instância Axios configurada para o backend da plataforma.
 *
 * Comportamentos automáticos:
 * - **Auth**: injeta o Bearer token de `localStorage["recanto:userData"]` em toda requisição.
 * - **Token refresh (401)**: tenta renovar o access token com o refresh token antes de deslogar.
 *   Requests concorrentes ficam na fila e são retentados com o novo token.
 *   Não se aplica a endpoints `/auth/*` (que retornam 401 por credenciais inválidas).
 * - **Retry**: requisições GET que falham com 5xx são reenviadas até 3×
 *   com backoff linear (1 s, 2 s, 3 s). Não reenvía em ambiente de teste,
 *   em endpoints `/auth/*`, nem em erros 429.
 * - **Rate limit (429)**: rejeitado imediatamente sem retry.
 * - **Espaço (tenant)**: com um espaço guardado em `localStorage["recanto:tenant"]`
 *   (convite aceito, `/login?espaco=<slug>` ou painel aberto pelo ADMIN), envia
 *   `X-Tenant-Slug` em toda requisição. Sem espaço guardado, a API usa o padrão.
 * - **403 de espaço**: `TENANT_INACTIVE` mostra um aviso único; `TENANT_ACCESS_DENIED`
 *   (a conta é de outro espaço) avisa e encerra a sessão — fora de `/platform/*`,
 *   onde o 403 só significa "não é ADMIN" e é tratado pela tela.
 */
import axios from "axios";
import { toast } from "react-toastify";
import { env } from "../config/env";
import { readSession, clearSession, updateSessionTokens } from "../config/authStorage";
import { readTenant, tenantHeaders } from "../config/tenantStorage";
import { getApiErrorCode, isAbortError } from "../utils/errors";
import { API_ERROR_CODE_MESSAGES } from "../utils/getErrorMessage";

const BASE_URL = env.apiUrl;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
    const token = readSession()?.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Uma chamada pode fixar o próprio salão (ex.: cancelar a reserva de outro salão, #35).
    const tenantSlug = readTenant()?.slug;
    if (tenantSlug && !config.headers["X-Tenant-Slug"]) {
        config.headers["X-Tenant-Slug"] = tenantSlug;
    }

    return config;
});

const MAX_RETRIES = 3;
const isTestEnv = env.isTest;

interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    config: Record<string, unknown> & { headers: Record<string, string> };
}

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

function drainQueue(newToken: string | null) {
    pendingQueue.forEach(({ resolve, reject, config }) => {
        if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(config));
        } else {
            reject(new Error("Session expired"));
        }
    });
    pendingQueue = [];
}

function invalidateSession() {
    clearSession();
    window.location.href = "/login";
}

/** Avisos de espaço (403). Retorna `true` quando a sessão foi encerrada. */
function handleTenantForbidden(code: string | undefined, url: string | undefined): boolean {
    if (code === "TENANT_INACTIVE") {
        toast.error(API_ERROR_CODE_MESSAGES.TENANT_INACTIVE, { toastId: "tenant-inactive" });
        return false;
    }
    if (code === "TENANT_ACCESS_DENIED" && !url?.startsWith("/platform")) {
        toast.error(API_ERROR_CODE_MESSAGES.TENANT_ACCESS_DENIED, { toastId: "tenant-access-denied" });
        if (readSession()) {
            invalidateSession();
            return true;
        }
    }
    return false;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config ?? {};
        const status = error.response?.status;

        if (status === 429) {
            return Promise.reject(error);
        }

        if (status === 403) {
            handleTenantForbidden(getApiErrorCode(error), config.url);
            return Promise.reject(error);
        }

        const isAuthEndpoint = config.url?.startsWith("/auth/");
        const isAbort = isAbortError(error);

        if (status === 401 && !isAuthEndpoint && !config._isRefreshRetry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject, config });
                });
            }

            const refreshToken = readSession()?.refreshToken;

            if (!refreshToken) {
                invalidateSession();
                return Promise.reject(error);
            }

            isRefreshing = true;

            try {
                const res = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...tenantHeaders() },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!res.ok) throw new Error("Refresh failed");

                const { data } = await res.json();

                updateSessionTokens(data.accessToken, data.refreshToken ?? null);

                drainQueue(data.accessToken);

                config._isRefreshRetry = true;
                config.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(config);
            } catch {
                drainQueue(null);
                invalidateSession();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        const isGetRequest = config.method?.toLowerCase() === "get";

        if (
            !isTestEnv &&
            !isAbort &&
            !isAuthEndpoint &&
            isGetRequest &&
            status >= 500
        ) {
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount <= MAX_RETRIES) {
                // Jitter previne thundering herd quando o backend volta de uma outage
                const jitter = Math.random() * 500;
                const delay = 1000 * config._retryCount + jitter;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return api(config);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
