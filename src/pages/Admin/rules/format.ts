/**
 * Formatação e conversões das regras do salão (#42–#46): minutos ↔ "HH:MM", dias da semana, moeda,
 * forma de cobrança e frases da política de cancelamento (as mesmas da API).
 */
import type { ItemChargeType, RefundTier } from "../../../types";

/** Semana a partir da segunda, como se fala. Índices do JS: 0 = domingo. */
export const WEEK = [
    { day: 1, short: "S", name: "segunda" },
    { day: 2, short: "T", name: "terça" },
    { day: 3, short: "Q", name: "quarta" },
    { day: 4, short: "Q", name: "quinta" },
    { day: 5, short: "S", name: "sexta" },
    { day: 6, short: "S", name: "sábado" },
    { day: 0, short: "D", name: "domingo" },
] as const;

export function minutesToClock(minutes: number | null | undefined): string {
    if (minutes == null) return "";
    const m = ((minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function clockToMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}

export function formatBRL(value: number | string | null | undefined): string {
    return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "4h", "4h30". */
export function formatHours(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export function describeDays(weekdays: number[] | null, holidays: boolean): string {
    const base = !weekdays || weekdays.length === 7
        ? "Todos os dias"
        : WEEK.filter((w) => weekdays.includes(w.day)).map((w) => w.name).join(", ").replace(/^./, (c) => c.toUpperCase());
    return `${base}${holidays ? ", inclusive feriados" : ", exceto feriados"}`;
}

/** "Das 13:00 às 19:00", "Até as 23:00", "A qualquer hora". */
export function describeWindow(earliest: number | null, latest: number | null): string {
    const end = latest != null ? `${minutesToClock(latest)}${latest > 1440 ? " do dia seguinte" : ""}` : null;
    if (earliest != null && end) return `Das ${minutesToClock(earliest)} às ${end}`;
    if (earliest != null) return `A partir das ${minutesToClock(earliest)}`;
    if (end) return `Até as ${end}`;
    return "A qualquer hora";
}

export const CHARGE_LABELS: Record<ItemChargeType, string> = {
    FIXED: "valor fixo",
    PER_HOUR: "por hora",
    PER_GUEST: "por convidado",
};

/** "R$ 30,00 por hora", "R$ 450,00". */
export function describePrice(unitPrice: number | string, chargeType: ItemChargeType): string {
    if (Number(unitPrice) === 0) return "Sem custo";
    return chargeType === "FIXED" ? formatBRL(unitPrice) : `${formatBRL(unitPrice)} ${CHARGE_LABELS[chargeType]}`;
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

export function refundFor(tiers: RefundTier[], daysBefore: number): number {
    return [...tiers].sort((a, b) => b.minDays - a.minDays).find((t) => daysBefore >= t.minDays)?.percentage ?? 0;
}
