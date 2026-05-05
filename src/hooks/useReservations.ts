/**
 * @module hooks/useReservations
 * @description Hook para buscar e gerenciar as reservas do usuário autenticado.
 */
import { listReservations } from "../services/reservation";
import { useApiData } from "./useApiData";
import type { Reservation } from "../types";

/**
 * Busca as reservas do usuário via `GET /reservations`.
 * Cancela a requisição automaticamente ao desmontar o componente.
 */
export function useReservations(): {
    reservations: Reservation[];
    isLoading: boolean;
    refresh: () => Promise<void>;
} {
    const { data: reservations, isLoading, refresh } = useApiData<Reservation[]>(listReservations, {
        initialData: [],
        errorMessage: "Erro ao carregar reservas.",
    });

    return { reservations: reservations ?? [], isLoading, refresh };
}
