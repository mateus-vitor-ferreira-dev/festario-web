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

/**
 * Retorna mensagem de toast adequada ao tipo de falha:
 * - Sem resposta (rede): avisa que a conexão falhou
 * - 5xx: indica problema no servidor
 * - 4xx e outros: usa getErrorMessage para erros da API
 */
function resolveErrorMessage(err, fallback) {
    if (!err.response) return "Sem conexão com o servidor. Verifique sua internet.";
    if (err.response.status >= 500) return "Erro interno do servidor. Tente novamente em instantes.";
    return getErrorMessage(err, fallback);
}

/**
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fetchFn
 * @param {{ initialData?: T, errorMessage?: string }} [options]
 * @returns {{ data: T, isLoading: boolean, refresh: () => Promise<void> }}
 */
export function useApiData(fetchFn, { initialData = null, errorMessage = "Erro ao carregar dados." } = {}) {
    const [data, setData] = useState(initialData);
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
                if (!signal.aborted) setData(result ?? initialData);
            } catch (err) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") return;
                toast.error(resolveErrorMessage(err, errorMessage));
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
            setData(result ?? initialData);
        } catch (err) {
            toast.error(resolveErrorMessage(err, errorMessage));
        } finally {
            setIsLoading(false);
        }
    }

    return { data, isLoading, refresh };
}
