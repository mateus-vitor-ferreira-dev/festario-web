/**
 * @module hooks/usePaginatedQuery
 * @description Busca uma página de uma listagem sempre que os parâmetros mudam
 * (filtros + `page` + `limit`), cancelando a requisição anterior.
 *
 * Mantém os itens da página anterior visíveis enquanto a próxima carrega
 * (`isFetching`), evitando que a tabela "pisque" e a página pule.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getLoadErrorMessage } from "../utils/getErrorMessage";
import { isAbortError } from "../utils/errors";
import type { ListParams, PaginatedResult, PaginationMeta } from "../types";

type Fetcher<T> = (params: ListParams, signal?: AbortSignal) => Promise<PaginatedResult<T>>;

interface Options {
    errorMessage?: string;
    /** Chamado quando a página pedida passou do fim (ex.: link antigo); recebe a última página válida. */
    onPageOutOfRange?: (lastPage: number) => void;
    /** Não busca enquanto for `false`. */
    enabled?: boolean;
}

export interface PaginatedQuery<T> {
    data: T[];
    meta: PaginationMeta | null;
    /** Primeira carga (ainda sem dados para mostrar). */
    isLoading: boolean;
    /** Qualquer carga em andamento, inclusive troca de página/filtro. */
    isFetching: boolean;
    refresh: () => void;
}

export function usePaginatedQuery<T>(
    fetcher: Fetcher<T>,
    params: ListParams,
    { errorMessage = "Erro ao carregar dados.", onPageOutOfRange, enabled = true }: Options = {},
): PaginatedQuery<T> {
    const [data, setData] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isFetching, setIsFetching] = useState(enabled);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;
    const outOfRangeRef = useRef(onPageOutOfRange);
    outOfRangeRef.current = onPageOutOfRange;

    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        const { signal } = controller;
        const current = JSON.parse(paramsKey) as ListParams;

        (async () => {
            try {
                setIsFetching(true);
                const result = await fetcherRef.current(current, signal);
                if (signal.aborted) return;
                const page = current.page ?? 1;
                const lastPage = result.meta.totalPages;
                if (result.data.length === 0 && page > 1 && lastPage !== undefined && page > lastPage && outOfRangeRef.current) {
                    outOfRangeRef.current(Math.max(1, lastPage));
                    return;
                }
                setData(result.data);
                setMeta(result.meta);
                setHasLoaded(true);
            } catch (err) {
                if (isAbortError(err)) return;
                toast.error(getLoadErrorMessage(err, errorMessage));
                setHasLoaded(true);
            } finally {
                if (!signal.aborted) setIsFetching(false);
            }
        })();

        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey, reloadKey, enabled]);

    const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

    return { data, meta, isLoading: !hasLoaded, isFetching, refresh };
}
