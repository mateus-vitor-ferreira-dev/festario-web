/**
 * @module hooks/useListParams
 * @description Mantém filtros e página de uma listagem na query string da URL
 * (`useSearchParams`), para que voltar, recarregar ou compartilhar o link
 * restaure exatamente a mesma visão.
 *
 * - Valores vazios (ou iguais ao padrão) são removidos da URL.
 * - Mudar qualquer filtro volta para a página 1.
 * - Parâmetros que não pertencem à lista (ex.: `tab` do painel) são preservados.
 */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const PAGE_PARAM = "page";

type Values<K extends string> = Record<K, string>;

interface Options<K extends string> {
    /** Valor padrão de cada chave (não aparece na URL e não conta como filtro ativo). */
    defaults?: Partial<Values<K>>;
    /** Chaves que não contam como filtro ativo (ex.: `sort`). */
    nonFilterKeys?: readonly K[];
}

interface SetOptions {
    /** Substitui a entrada do histórico em vez de criar uma nova (ex.: digitação). */
    replace?: boolean;
}

export interface ListParamsApi<K extends string> {
    values: Values<K>;
    page: number;
    /** Chaves de filtro com valor diferente do padrão. */
    activeKeys: K[];
    setFilters: (patch: Partial<Values<K>>, options?: SetOptions) => void;
    setFilter: (key: K, value: string, options?: SetOptions) => void;
    setPage: (page: number) => void;
    clearFilters: () => void;
}

export function useListParams<K extends string>(
    keys: readonly K[],
    { defaults = {}, nonFilterKeys = [] }: Options<K> = {},
): ListParamsApi<K> {
    const [searchParams, setSearchParams] = useSearchParams();
    // as listas de chaves/padrões são constantes de módulo; serializar evita dependências instáveis
    const keysKey = keys.join("|");
    const defaultsKey = JSON.stringify(defaults);

    const values = useMemo(() => {
        const out = {} as Values<K>;
        for (const k of keys) out[k] = searchParams.get(k) ?? defaults[k] ?? "";
        return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, keysKey, defaultsKey]);

    const rawPage = Number.parseInt(searchParams.get(PAGE_PARAM) ?? "1", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const activeKeys = keys.filter(
        (k) => !nonFilterKeys.includes(k) && values[k] !== (defaults[k] ?? ""),
    );

    const setFilters = useCallback((patch: Partial<Values<K>>, { replace = false }: SetOptions = {}) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [k, v] of Object.entries(patch) as [K, string | undefined][]) {
                const value = (v ?? "").trim();
                if (!value || value === (defaults[k] ?? "")) next.delete(k);
                else next.set(k, value);
            }
            next.delete(PAGE_PARAM);
            return next;
        }, { replace });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setSearchParams, defaultsKey]);

    const setFilter = useCallback(
        (key: K, value: string, options?: SetOptions) => setFilters({ [key]: value } as Partial<Values<K>>, options),
        [setFilters],
    );

    const setPage = useCallback((nextPage: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (nextPage <= 1) next.delete(PAGE_PARAM);
            else next.set(PAGE_PARAM, String(nextPage));
            return next;
        });
    }, [setSearchParams]);

    const clearFilters = useCallback(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const k of keys) if (!nonFilterKeys.includes(k)) next.delete(k);
            next.delete(PAGE_PARAM);
            return next;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setSearchParams, keysKey]);

    return { values, page, activeKeys, setFilters, setFilter, setPage, clearFilters };
}
