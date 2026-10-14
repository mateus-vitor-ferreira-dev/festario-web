import type { Campaign, NegotiationStatus, RaffleWinnerResult } from "../../../types";
// Constantes e helpers compartilhados entre as abas do painel admin
export { REFUND_TIERS, getRefundPercentage } from "../../../constants/reservation";

export const TABS = [
    { key: "dashboard", label: "Dashboard" },
    { key: "reservations", label: "Reservas" },
    { key: "users", label: "Usuários" },
    { key: "negotiations", label: "Negociações" },
    { key: "campaigns", label: "Campanhas" },
    { key: "holidays", label: "Feriados" },
    { key: "blockedDates", label: "Datas bloqueadas" },
    { key: "plans", label: "Planos" },
    { key: "venues", label: "Espaços" },
];


export const STATUS_OPTIONS = [
    { value: "", label: "Todos os status" },
    { value: "PENDING", label: "Pendente" },
    { value: "PAID", label: "Pago" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "EXPIRED", label: "Expirado" },
];

export const STATUS_LABELS = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
};

export const NEG_STATUS_OPTIONS: Array<{ value: NegotiationStatus | ""; label: string }> = [
    { value: "", label: "Todos os status" },
    { value: "OPEN", label: "Aberta" },
    { value: "PENDING_APPROVAL", label: "Proposta enviada" },
    { value: "ACCEPTED", label: "Aceita" },
    { value: "REJECTED", label: "Recusada" },
    { value: "CLOSED", label: "Encerrada" },
];

export const NEG_STATUS_LABELS: Record<NegotiationStatus, string> = {
    OPEN: "Aberta",
    PENDING_APPROVAL: "Proposta enviada",
    ACCEPTED: "Aceita",
    REJECTED: "Recusada",
    CLOSED: "Encerrada",
};

export const CAMPAIGN_TYPE_LABELS = {
    REFERRAL_NEXT_BOOKING: "Indicação",
    LOYALTY_ALWAYS_HERE: "Fidelidade",
    RAFFLE_VIP: "Sorteio VIP",
};

export const CAMPAIGN_TYPE_OPTIONS = [
    { value: "REFERRAL_NEXT_BOOKING", label: "Indicação" },
    { value: "LOYALTY_ALWAYS_HERE", label: "Fidelidade" },
    { value: "RAFFLE_VIP", label: "Sorteio VIP" },
];

export const CAMPAIGN_STATUS_LABELS = {
    active: "Ativa",
    scheduled: "Aguarda início",
    ended: "Encerrada",
    disabled: "Desativada",
};

export function getCampaignStatus(campaign: Campaign) {
    const now = new Date();
    if (!campaign.isActive) return "disabled";
    if (new Date(campaign.startsAt) > now) return "scheduled";
    if (new Date(campaign.endsAt) < now) return "ended";
    return "active";
}

export function getCampaignDateDisplay(campaign: Campaign) {
    const year = new Date().getFullYear();
    if (campaign.type === "LOYALTY_ALWAYS_HERE") return "O ANO TODO";
    if (campaign.type === "REFERRAL_NEXT_BOOKING") return `01/03/${year} → 01/08/${year}`;
    if (campaign.type === "RAFFLE_VIP") {
        const nextYear = year + 1;
        const lastDayFeb = new Date(nextYear, 2, 0).getDate();
        return `01/08/${year} → ${String(lastDayFeb).padStart(2, "0")}/02/${nextYear}`;
    }
    return `${formatDate(campaign.startsAt)} → ${formatDate(campaign.endsAt)}`;
}

export function buildWinnerMessage(winner: RaffleWinnerResult["winner"], campaignName: string) {
    return `Olá, ${winner.name}! 🎉\n\nVocê foi o grande sorteado do *${campaignName}* do Recanto Vila Rica!\n\nPara resgatar seu prêmio, publique um stories no Instagram marcando @recantovilarica e nos envie a confirmação. 📸\n\nQualquer dúvida, é só entrar em contato. Parabéns! 🥳`;
}

export const HOLIDAY_TYPE_OPTIONS = [
    { value: "national", label: "Nacional" },
    { value: "state", label: "Estadual" },
    { value: "municipal", label: "Municipal" },
];

export function getMunicipalHolidaysSeed(year: number) {
    return [
        { name: "Dia de São Sebastião", date: `${year}-01-20` },
        { name: "Dia de Santo Antônio", date: `${year}-06-13` },
        { name: "Aniversário de Lavras", date: `${year}-09-08` },
    ];
}

export const PLAN_CODES = ["PROMOCIONAL", "ESSENCIAL", "COMPLETA"];

export const EMPTY_PLAN_FORM = {
    venueId: "",
    code: "ESSENCIAL",
    name: "",
    basePriceAmount: "",
    partyDurationHours: "",
    endsAtHour: "",
    keyDeliveryOffsetHours: "",
    includedKidsMonitorHours: "",
    includesPool: false,
    includesCleaning: false,
    validOnHolidays: false,
};

export const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function formatDate(date: Date | string | undefined): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatCurrency(value: number): string {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
