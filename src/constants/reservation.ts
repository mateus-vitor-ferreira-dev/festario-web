import type { PlanCode } from "../types";

export const STATUS_MAP = {
    PENDING: { label: "Pendente", color: "amber" },
    PAID: { label: "Pago", color: "green" },
    CANCELLED: { label: "Cancelado", color: "red" },
    EXPIRED: { label: "Expirado", color: "gray" },
};

export const REFUND_TIERS = [
    { minDays: 181, percentage: 100, label: "Mais de 180 dias antes do evento" },
    { minDays: 121, percentage: 70,  label: "De 121 a 180 dias antes do evento" },
    { minDays: 61,  percentage: 40,  label: "De 61 a 120 dias antes do evento" },
    { minDays: 0,   percentage: 0,   label: "Até 60 dias antes do evento" },
];

export function getRefundPercentage(daysBeforeEvent: number): number {
    for (const tier of REFUND_TIERS) {
        if (daysBeforeEvent >= tier.minDays) return tier.percentage;
    }
    return 0;
}

export const PLANS = [
    { code: "PROMOCIONAL", label: "Promocional", days: "Segunda a Quinta (não feriados)", priceCents: 65000 },
    { code: "ESSENCIAL",   label: "Essencial",   days: "Sexta a Domingo e feriados",      priceCents: 85000 },
    { code: "COMPLETA",    label: "Completa",     days: "Sexta a Domingo e feriados",      priceCents: 100000 },
] as const satisfies ReadonlyArray<{ code: PlanCode; label: string; days: string; priceCents: number }>;

export type Plan = typeof PLANS[number];

// Feriados nacionais fixos (MM-DD) e móveis (AAAA-MM-DD)
export const FIXED_HOLIDAYS = ["01-01","04-21","05-01","09-07","10-12","11-02","11-15","11-20","12-25"];

export const VARIABLE_HOLIDAYS = [
    "2025-03-03","2025-03-04","2025-04-18","2025-06-19",
    "2026-02-16","2026-02-17","2026-04-03","2026-06-04",
    "2027-02-08","2027-02-09","2027-03-26","2027-05-20",
];

export const INCLUDED_KIDS_HOURS_BY_PLAN = { PROMOCIONAL: 4, ESSENCIAL: 4, COMPLETA: 4 };

export function isHoliday(dateString: string): boolean {
    if (!dateString) return false;
    if (VARIABLE_HOLIDAYS.includes(dateString)) return true;
    return FIXED_HOLIDAYS.includes(dateString.slice(5));
}

export function isPlanAvailableForDate(planCode: string, eventDate: string): boolean {
    if (!eventDate) return true;
    const day = new Date(`${eventDate}T12:00:00`).getDay();
    const isWeekendOrHoliday = day === 0 || day === 5 || day === 6 || isHoliday(eventDate);
    if (planCode === "PROMOCIONAL") return !isWeekendOrHoliday;
    return isWeekendOrHoliday;
}

export function getBlockedPlanMessage(planCode: string, eventDate: string): string {
    const day = new Date(`${eventDate}T12:00:00`).getDay();
    const isWeekendOrHoliday = day === 0 || day === 5 || day === 6 || isHoliday(eventDate);
    if (planCode === "PROMOCIONAL" && isWeekendOrHoliday) {
        return isHoliday(eventDate)
            ? "O plano Promocional não está disponível em feriados. Escolha o Essencial ou o Completa."
            : "O plano Promocional é disponível apenas de Segunda a Quinta. Escolha o Essencial ou o Completa para fins de semana.";
    }
    return "Este plano é disponível apenas de Segunda a Quinta (sem feriados). Escolha o Promocional para dias úteis.";
}
