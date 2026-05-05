/**
 * @module hooks/usePagination
 * @description Hook for paginated data fetching with AbortController and toast on error.
 *
 * fetchFn must accept (signal, { page, limit }) and return { data, meta }.
 */
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../utils/getErrorMessage";
import type { PaginatedResult, PaginationMeta } from "../types";

interface PaginationParams {
    page: number;
    limit: number;
}

interface UsePaginationOptions {
    limit?: number;
    errorMessage?: string;
}

interface UsePaginationResult<T> {
    data: T[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    refresh: () => Promise<void>;
}

export function usePagination<T>(
    fetchFn: (signal?: AbortSignal, params?: PaginationParams) => Promise<PaginatedResult<T>>,
    { limit = 10, errorMessage = "Erro ao carregar dados." }: UsePaginationOptions = {},
): UsePaginationResult<T> {
    const [page, setPage] = useState(1);
    const [data, setData] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRef = useRef(fetchFn);
    fetchRef.current = fetchFn;

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchRef.current(signal, { page, limit });
                if (!signal.aborted) {
                    setData(result.data);
                    setMeta(result.meta);
                }
            } catch (err) {
                const e = err as { name?: string };
                if (e?.name === "CanceledError" || e?.name === "AbortError") return;
                toast.error(getErrorMessage(err, errorMessage));
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }

        load();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    async function refresh() {
        try {
            setIsLoading(true);
            const result = await fetchRef.current(undefined, { page, limit });
            setData(result.data);
            setMeta(result.meta);
        } catch (err) {
            toast.error(getErrorMessage(err, errorMessage));
        } finally {
            setIsLoading(false);
        }
    }

    return { data, meta, isLoading, page, setPage, refresh };
}
