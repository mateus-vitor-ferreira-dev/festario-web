/**
 * @module services/subscription
 * @description Assinatura Festário do estabelecimento: situação, histórico e a autorização do Pix
 * Automático (painel do dono), e as ações da plataforma (estender o teste, marcar como pago por fora).
 */
import api from "./api";
import type { SubscriptionDetail } from "../types";

const unwrap = <T,>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

/** @see GET /tenant/subscription */
export const getMySubscription = (signal?: AbortSignal) => unwrap<SubscriptionDetail>(api.get("/tenant/subscription", { signal }));

/**
 * Gera (ou devolve, se pedida há pouco) a autorização do Pix Automático com o copia e cola.
 *
 * @see POST /tenant/subscription/authorization — 409 já autorizado; 503 cobrança desligada
 */
export const requestAutomaticPayment = (payload: { payerName: string; payerDocument: string }) =>
    unwrap<SubscriptionDetail>(api.post("/tenant/subscription/authorization", payload));

/** @see GET /platform/tenants/:id/subscription */
export const getTenantSubscription = (tenantId: string, signal?: AbortSignal) =>
    unwrap<SubscriptionDetail>(api.get(`/platform/tenants/${tenantId}/subscription`, { signal }));

/** Estende o teste (ou adia o vencimento) até `until` (AAAA-MM-DD). @see POST /platform/tenants/:id/subscription/extend */
export const extendTrial = (tenantId: string, until: string) =>
    unwrap<SubscriptionDetail>(api.post(`/platform/tenants/${tenantId}/subscription/extend`, { until }));

/** Registra o pagamento feito por fora. @see POST /platform/tenants/:id/subscription/mark-paid */
export const markSubscriptionPaid = (tenantId: string, note?: string) =>
    unwrap<SubscriptionDetail>(api.post(`/platform/tenants/${tenantId}/subscription/mark-paid`, note ? { note } : {}));
