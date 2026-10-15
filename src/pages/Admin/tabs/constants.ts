import type { Campaign, NegotiationStatus, RaffleWinnerResult } from "../../../types";
// Constantes e helpers compartilhados entre as abas do painel admin

export const TABS = [
    { key: "dashboard", label: "Dashboard" },
    { key: "reservations", label: "Reservas" },
    { key: "users", label: "Usuários" },
    { key: "negotiations", label: "Negociações" },
    { key: "campaigns", label: "Campanhas" },
    { key: "holidays", label: "Feriados" },
    { key: "blockedDates", label: "Datas bloqueadas" },
    { key: "rules", label: "Regras do salão" },
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

/**
 * Mensagem para o ganhador; `venueName` é o nome do salão e `instagram` o perfil dele, quando
 * cadastrado. Sem Instagram, a mensagem pede só a confirmação.
 */
export function buildWinnerMessage(winner: RaffleWinnerResult["winner"], campaignName: string, venueName?: string | null, instagram?: string | null) {
    const venue = venueName ? ` de ${venueName}` : "";
    const redeem = instagram
        ? `publique um stories no Instagram marcando ${instagram} e nos envie a confirmação. 📸`
        : "responda esta mensagem para combinarmos a sua reserva.";
    return `Olá, ${winner.name}! 🎉\n\nVocê foi o grande sorteado do *${campaignName}*${venue}!\n\nPara resgatar seu prêmio, ${redeem}\n\nQualquer dúvida, é só entrar em contato. Parabéns! 🥳`;
}

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
