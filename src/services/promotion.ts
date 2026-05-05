/**
 * @module services/promotion
 * @description Funções para consultar promoções e descontos do usuário autenticado.
 */
import api from "./api";
import type { PromotionGrant, Campaign, PromotionStatusItem } from "../types";

/**
 * Lista os grants de desconto disponíveis para o usuário autenticado.
 * Grants são gerados automaticamente pelo sistema de campanhas
 * (referral qualificado, fidelidade, sorteio VIP).
 *
 * @see GET /promotions/my-grants
 */
export async function listMyGrants(signal?: AbortSignal): Promise<PromotionGrant[]> {
    const { data } = await api.get("/promotions/my-grants", { signal });
    return data.data;
}

/**
 * Lista campanhas promocionais ativas no momento.
 *
 * @see GET /promotions/active
 */
export async function listActivePromotions(signal?: AbortSignal): Promise<Campaign[]> {
    const { data } = await api.get("/promotions/active", { signal });
    return data.data ?? [];
}

/**
 * Retorna o status de cada tipo de campanha (ativa, agendada, encerrada, não configurada).
 *
 * @see GET /promotions/status
 */
export async function listPromotionStatus(signal?: AbortSignal): Promise<PromotionStatusItem[]> {
    const { data } = await api.get("/promotions/status", { signal });
    return data.data ?? [];
}
