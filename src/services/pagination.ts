/**
 * @module services/pagination
 * @description Normaliza as respostas de listagem da API para `PaginatedResult`.
 *
 * Formato do contrato: `{ message, data: T[], pagination: { page, limit, total, totalPages } }`.
 * Durante a transição ainda aceita os formatos antigos:
 * - `{ data: { page, limit, total?, data: T[] } }` (listagens do admin);
 * - `{ data: T[], meta }`;
 * - `{ data: T[] }` sem metadados (a API ignorou `page`/`limit`) — nesse caso a
 *   lista é paginada no cliente quando vier maior que o limite.
 */
import type { PaginatedResult, PaginationMeta } from "../types";

interface RawMeta {
    page?: number | string;
    limit?: number | string;
    total?: number | string;
    totalPages?: number | string;
}

const toNum = (v: unknown): number | undefined => {
    const n = Number(v);
    return v === undefined || v === null || v === "" || Number.isNaN(n) ? undefined : n;
};

function buildMeta(raw: RawMeta, length: number, fallback: { page: number; limit: number }): PaginationMeta {
    const page = toNum(raw.page) ?? fallback.page;
    const limit = toNum(raw.limit) ?? fallback.limit;
    let total = toNum(raw.total);
    // página curta sem total: sabemos que é a última, então o total é dedutível
    if (total === undefined && length < limit) total = (page - 1) * limit + length;
    const totalPages = toNum(raw.totalPages) ?? (total !== undefined ? Math.max(1, Math.ceil(total / limit)) : undefined);
    const hasNext = totalPages !== undefined ? page < totalPages : length >= limit;
    return { page, limit, total, totalPages, hasNext };
}

/**
 * Converte o corpo da resposta (envelope `{ data, pagination }`) em `{ data, meta }`.
 *
 * @param body - `response.data` do Axios
 * @param requested - página e limite pedidos (usados quando a API não os devolve)
 */
export function toPaginated<T>(body: unknown, requested: { page?: number; limit?: number } = {}): PaginatedResult<T> {
    const fallback = { page: requested.page ?? 1, limit: requested.limit ?? 20 };
    const env = (body && typeof body === "object" ? body : {}) as {
        data?: unknown;
        pagination?: RawMeta;
        meta?: RawMeta;
    };
    const metaRaw = env.pagination ?? env.meta;

    if (Array.isArray(env.data)) {
        const list = env.data as T[];
        if (metaRaw) return { data: list, meta: buildMeta(metaRaw, list.length, fallback) };
        // sem metadados: a API devolveu tudo — pagina no cliente
        if (list.length > fallback.limit) {
            const start = (fallback.page - 1) * fallback.limit;
            const total = list.length;
            const totalPages = Math.ceil(total / fallback.limit);
            return {
                data: list.slice(start, start + fallback.limit),
                meta: { ...fallback, total, totalPages, hasNext: fallback.page < totalPages },
            };
        }
        return { data: list, meta: buildMeta({}, list.length, fallback) };
    }

    if (env.data && typeof env.data === "object" && Array.isArray((env.data as { data?: unknown }).data)) {
        const inner = env.data as RawMeta & { data: T[] };
        return { data: inner.data, meta: buildMeta(inner, inner.data.length, fallback) };
    }

    return { data: [], meta: { ...fallback, total: 0, totalPages: 1, hasNext: false } };
}

/** Remove parâmetros vazios para não enviar `?status=&q=` à API. */
export function cleanParams<P extends Record<string, unknown>>(params: P): Partial<P> {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    ) as Partial<P>;
}

/** Minúsculas e sem acentos — para comparações de busca feitas no cliente. */
export function normalizeText(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
