/**
 * @module api
 * @description Instância Axios configurada para o backend do Recanto Vila Rica.
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
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "recanto:userData";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const token = userData?.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const MAX_RETRIES = 3;
const isTestEnv =
    import.meta.env.MODE === "test" ||
    Boolean(import.meta.env.VITEST);

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

function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config ?? {};
        const status = error.response?.status;

        if (status === 429) {
            return Promise.reject(error);
        }

        const isAuthEndpoint = config.url?.startsWith("/auth/");
        const isAbortError =
            error?.name === "CanceledError" || error?.name === "AbortError";

        if (status === 401 && !isAuthEndpoint && !config._isRefreshRetry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject, config });
                });
            }

            const userData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            const refreshToken = userData?.refreshToken;

            if (!refreshToken) {
                clearSession();
                return Promise.reject(error);
            }

            isRefreshing = true;

            try {
                const res = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!res.ok) throw new Error("Refresh failed");

                const { data } = await res.json();

                const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
                stored.token = data.accessToken;
                stored.refreshToken = data.refreshToken;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

                drainQueue(data.accessToken);

                config._isRefreshRetry = true;
                config.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(config);
            } catch {
                drainQueue(null);
                clearSession();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        const isGetRequest = config.method?.toLowerCase() === "get";

        if (
            !isTestEnv &&
            !isAbortError &&
            !isAuthEndpoint &&
            isGetRequest &&
            status >= 500
        ) {
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount <= MAX_RETRIES) {
                const delay = 1000 * config._retryCount;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return api(config);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
