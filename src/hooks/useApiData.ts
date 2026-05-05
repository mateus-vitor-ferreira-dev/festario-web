/**
 * @module hooks/useApiData
 * @description Generic hook for data fetching with AbortController and toast on error.
 *
 * fetchFn must accept an AbortSignal as its first argument and return a Promise.
 * Pass module-level service functions directly — avoid inline arrow functions as
 * fetchFn to prevent an infinite re-fetch loop.
 */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../utils/getErrorMessage";
import { isAbortError } from "../utils/errors";

interface ApiError {
    name?: string;
    response?: { status: number };
    message?: string;
}

function resolveErrorMessage(err: ApiError, fallback: string): string {
    if (!err.response) return "Sem conexão com o servidor. Verifique sua internet.";
    if (err.response.status >= 500) return "Erro interno do servidor. Tente novamente em instantes.";
    return getErrorMessage(err, fallback);
}

interface UseApiDataOptions<T> {
    initialData?: T | null;
    errorMessage?: string;
}

interface UseApiDataResult<T> {
    data: T | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

export function useApiData<T>(
    fetchFn: (signal?: AbortSignal) => Promise<T>,
    { initialData = null, errorMessage = "Erro ao carregar dados." }: UseApiDataOptions<T> = {},
): UseApiDataResult<T> {
    const [data, setData] = useState<T | null>(initialData ?? null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRef = useRef(fetchFn);
    fetchRef.current = fetchFn;

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchRef.current(signal);
                if (!signal.aborted) setData(result ?? initialData ?? null);
            } catch (err) {
                const e = err as ApiError;
                if (isAbortError(e)) return;
                toast.error(resolveErrorMessage(e, errorMessage));
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }

        load();
        return () => controller.abort();
        // fetchRef keeps fetchFn current without triggering re-runs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function refresh() {
        try {
            setIsLoading(true);
            const result = await fetchRef.current();
            setData(result ?? initialData ?? null);
        } catch (err) {
            toast.error(resolveErrorMessage(err as ApiError, errorMessage));
        } finally {
            setIsLoading(false);
        }
    }

    return { data, isLoading, refresh };
}
