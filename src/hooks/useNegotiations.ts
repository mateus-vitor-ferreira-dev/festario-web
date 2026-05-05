/**
 * @module hooks/useNegotiations
 * @description Hook para buscar as negociações do usuário autenticado.
 */
import { listNegotiations } from "../services/negotiation";
import { useApiData } from "./useApiData";
import type { Negotiation } from "../types";

/**
 * Busca as negociações do usuário via `GET /negotiations`.
 * Cancela a requisição automaticamente ao desmontar o componente.
 */
export function useNegotiations(): {
    negotiations: Negotiation[];
    isLoading: boolean;
} {
    const { data: negotiations, isLoading } = useApiData<Negotiation[]>(listNegotiations, {
        initialData: [],
        errorMessage: "Erro ao carregar negociações.",
    });

    return { negotiations: negotiations ?? [], isLoading };
}
