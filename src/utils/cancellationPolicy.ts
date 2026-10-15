/**
 * Política de cancelamento da reserva (#46). As faixas e as frases vêm da API, gravadas em cada reserva;
 * aqui só se acha a faixa que vale para quem cancela agora.
 */
import type { RefundTier } from "../types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Dias inteiros até o início do evento (0 se já passou). */
export function daysUntil(startDate: string, now: Date = new Date()): number {
    return Math.max(0, Math.floor((new Date(startDate).getTime() - now.getTime()) / MS_PER_DAY));
}

/** Índice da faixa (da maior antecedência para a menor) que vale para `daysBefore`; -1 se nenhuma. */
export function tierIndexFor(tiers: RefundTier[], daysBefore: number): number {
    return [...tiers].sort((a, b) => b.minDays - a.minDays).findIndex((t) => daysBefore >= t.minDays);
}

export function refundFor(tiers: RefundTier[], daysBefore: number): number {
    return [...tiers].sort((a, b) => b.minDays - a.minDays).find((t) => daysBefore >= t.minDays)?.percentage ?? 0;
}

/** Política em frases, como a API e o contrato mostram (maior antecedência primeiro). */
export function describeTiers(tiers: RefundTier[]): string[] {
    const sorted = [...tiers].sort((a, b) => b.minDays - a.minDays);
    const days = (n: number) => `${n} dia${n === 1 ? "" : "s"}`;
    return sorted.map((t, i) => {
        const upper = i > 0 ? sorted[i - 1].minDays - 1 : null;
        const when = upper === null
            ? (t.minDays === 0 ? "A qualquer momento" : `Com ${days(t.minDays)} ou mais de antecedência`)
            : t.minDays === 0 ? `Com menos de ${days(upper + 1)} de antecedência` : `De ${days(t.minDays)} a ${days(upper)} de antecedência`;
        return `${when}: ${t.percentage === 0 ? "sem reembolso" : `${t.percentage}% de reembolso`}`;
    });
}

/** Estimativa de reembolso de uma reserva paga, pela política dela. */
export function refundEstimate(totalPaid: number, tiers: RefundTier[], startDate: string, now: Date = new Date()) {
    const daysBeforeEvent = daysUntil(startDate, now);
    const percentage = refundFor(tiers, daysBeforeEvent);
    return { daysBeforeEvent, percentage, refundAmount: Number(((totalPaid * percentage) / 100).toFixed(2)), totalPaid, tierIndex: tierIndexFor(tiers, daysBeforeEvent) };
}
