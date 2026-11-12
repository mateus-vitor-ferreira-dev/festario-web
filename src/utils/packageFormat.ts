/**
 * Formatação e conversões das regras do salão: minutos ↔ "HH:MM", dias da semana, moeda,
 * forma de cobrança e frases da política de cancelamento (as mesmas da API).
 */
import type { ItemChargeType, PackagePricingMode, QuoteLine } from "../types";

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

/** "R$ 45,00 por hora", "R$ 450,00". */
export function describePrice(unitPrice: number | string, chargeType: ItemChargeType): string {
    if (Number(unitPrice) === 0) return "Sem custo";
    return chargeType === "FIXED" ? formatBRL(unitPrice) : `${formatBRL(unitPrice)} ${CHARGE_LABELS[chargeType]}`;
}

/** Como cobrar o pacote, para o seletor do painel. */
export const PRICING_MODE_OPTIONS: { value: PackagePricingMode; label: string }[] = [
    { value: "FIXED", label: "Valor fixo pela festa" },
    { value: "PER_HOUR", label: "Por hora" },
    { value: "PER_GUEST", label: "Por convidado" },
];

/** Rótulo do campo de preço conforme a forma de cobrança. */
export const PRICE_FIELD_LABELS: Record<PackagePricingMode, string> = {
    FIXED: "Preço (R$)",
    PER_HOUR: "Preço por hora (R$)",
    PER_GUEST: "Preço por convidado (R$)",
};

/** Unidade do preço depois do valor: "" (pela festa), " por hora", " por convidado". */
export function pricingUnit(mode: PackagePricingMode | null | undefined): string {
    return mode === "PER_HOUR" ? " por hora" : mode === "PER_GUEST" ? " por convidado" : "";
}

/** "R$ 1.200,00", "R$ 300,00 por hora", "R$ 50,00 por convidado". */
export function describePackagePrice(amount: number | string, mode: PackagePricingMode | null | undefined): string {
    return `${formatBRL(amount)}${pricingUnit(mode)}`;
}

/**
 * Preço base do pacote para uma festa, com a mesma regra da API: por hora, em horas cheias (hora
 * começada conta inteira), nunca menos que a duração mínima; por convidado, nunca menos que o mínimo
 * de convidados. Devolve a quantidade cobrada e o total, em reais.
 */
export function packageBaseTotal(
    amount: number,
    mode: PackagePricingMode | null | undefined,
    { durationMinutes, guests, minDurationMinutes, minGuests }: { durationMinutes: number; guests: number; minDurationMinutes?: number | null; minGuests?: number | null },
): { quantity: number; total: number } {
    if (mode === "PER_HOUR") {
        const quantity = Math.max(Math.ceil(durationMinutes / 60), minDurationMinutes != null ? Math.ceil(minDurationMinutes / 60) : 0);
        return { quantity, total: amount * quantity };
    }
    if (mode === "PER_GUEST") {
        const quantity = Math.max(guests, minGuests ?? 0);
        return { quantity, total: amount * quantity };
    }
    return { quantity: 1, total: amount };
}

/**
 * A conta do preço base no orçamento quando o pacote não é valor fixo: "6 h × R$ 300,00" ou
 * "80 convidados × R$ 50,00". Quantidade e valor unitário são os da API (horas cheias e mínimos já aplicados).
 */
export function planBaseMath(line: Pick<QuoteLine, "quantity" | "unitAmountCents" | "metadata">, pkg?: { pricingMode?: PackagePricingMode } | null): string | null {
    const mode = line.metadata?.pricingMode ?? pkg?.pricingMode ?? "FIXED";
    const unit = formatBRL(line.unitAmountCents / 100);
    if (mode === "PER_HOUR") return `${line.quantity} h × ${unit}`;
    if (mode === "PER_GUEST") return `${line.quantity} convidado${line.quantity === 1 ? "" : "s"} × ${unit}`;
    return null;
}

export { describeTiers, refundFor } from "./cancellationPolicy";
