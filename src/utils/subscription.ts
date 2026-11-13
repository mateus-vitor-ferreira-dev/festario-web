/**
 * @module utils/subscription
 * @description Textos e formatos da Assinatura Festário (painel do dono e plataforma).
 */
import type { SubscriptionChargeStatus, SubscriptionStatus, TenantSubscription } from "../types";

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
    TRIAL: "Mês grátis",
    AUTORIZACAO_PENDENTE: "Falta aprovar no banco",
    ATIVA: "Em dia",
    EM_ATRASO: "Pagamento atrasado",
    SUSPENSA: "Só para consulta",
    CANCELADA: "Pix Automático cancelado",
};

/** Cor do selo: as mesmas famílias de status do resto do painel. */
export type SubscriptionTone = "paid" | "pending" | "error" | "info" | "neutral";

export const SUBSCRIPTION_STATUS_TONE: Record<SubscriptionStatus, SubscriptionTone> = {
    TRIAL: "info",
    AUTORIZACAO_PENDENTE: "pending",
    ATIVA: "paid",
    EM_ATRASO: "pending",
    SUSPENSA: "error",
    CANCELADA: "neutral",
};

export const CHARGE_STATUS_LABELS: Record<SubscriptionChargeStatus, string> = {
    PENDENTE: "Aguardando pagamento",
    AGENDADA: "Débito agendado",
    PAGA: "Paga",
    FALHOU: "Não debitada",
    CANCELADA: "Cancelada",
};

export const CHARGE_STATUS_TONE: Record<SubscriptionChargeStatus, SubscriptionTone> = {
    PENDENTE: "pending",
    AGENDADA: "info",
    PAGA: "paid",
    FALHOU: "error",
    CANCELADA: "neutral",
};

/** "2026-12-10" → "10/12/2026" (sem passar por Date: não muda de dia com o fuso). */
export function formatDay(key: string | null | undefined): string {
    if (!key) return "—";
    const [y, m, d] = key.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
}

export function formatCents(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Só dígitos; CPF (11) ou CNPJ (14). A conferência dos dígitos verificadores fica com a API. */
export function looksLikeDocument(value: string): boolean {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 || digits.length === 14;
}

/** Situação curta para a lista da plataforma: "Em dia · vence 10/12/2026". */
export function subscriptionSummary(sub: TenantSubscription | undefined): { label: string; tone: SubscriptionTone; detail: string | null } | null {
    if (!sub?.status) return null;
    const label = SUBSCRIPTION_STATUS_LABELS[sub.status];
    const tone = SUBSCRIPTION_STATUS_TONE[sub.status];
    if (sub.status === "EM_ATRASO" || sub.status === "SUSPENSA") {
        return { label, tone, detail: `venceu ${formatDay(sub.nextDueDate)}` };
    }
    return { label, tone, detail: sub.nextDueDate ? `vence ${formatDay(sub.nextDueDate)}` : null };
}
