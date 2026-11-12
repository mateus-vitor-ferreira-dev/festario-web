import type { InviteStatus, Tenant } from "../../types";

export const TENANTS_PAGE_SIZE = 20;
export const INVITES_PAGE_SIZE = 10;

/** Plano único da plataforma: uma assinatura por estabelecimento, com quantos espaços ele tiver. */
export const SUBSCRIPTION_NAME = "Assinatura Festário";
export const SUBSCRIPTION_MONTHLY_PRICE_CENTS = 10_000;
export const SUBSCRIPTION_TRIAL_DAYS = 30;

function reais(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: cents % 100 ? 2 : 0 });
}

/** "Assinatura Festário: R$ 100/mês" (com o nome e o preço que a API mandar, se mandar). */
export function subscriptionLabel(tenant?: Pick<Tenant, "subscription"> | null): string {
    const name = tenant?.subscription?.name ?? SUBSCRIPTION_NAME;
    const cents = tenant?.subscription?.monthlyPriceCents ?? SUBSCRIPTION_MONTHLY_PRICE_CENTS;
    return `${name}: ${reais(cents)}/mês`;
}

/**
 * Situação do mês grátis: "Grátis até 12/12/2026" durante o teste e "Mês grátis até 12/12/2026" depois
 * dele. Ainda não há cobrança automática, então o fim do teste é só informativo. Sem data, `null`.
 */
export function trialText(tenant: Pick<Tenant, "trialEndsAt" | "subscription">, now: Date = new Date()): string | null {
    const end = tenant.subscription?.trialEndsAt ?? tenant.trialEndsAt;
    if (!end) return null;
    const date = new Date(end).toLocaleDateString("pt-BR");
    const inTrial = tenant.subscription?.inTrial ?? new Date(end) > now;
    return inTrial ? `Grátis até ${date}` : `Mês grátis até ${date}`;
}

export const TENANT_STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "inactive", label: "Desativados" },
];

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
    valid: "Pendente",
    expired: "Vencido",
    accepted: "Aceito",
    revoked: "Revogado",
};

export const INVITE_STATUS_OPTIONS = [
    { value: "", label: "Todas as situações" },
    ...(Object.keys(INVITE_STATUS_LABELS) as InviteStatus[]).map((value) => ({ value, label: INVITE_STATUS_LABELS[value] })),
];

/** Slugs que a API recusa (colidem com subdomínios/rotas da plataforma). */
export const RESERVED_SLUGS = ["www", "api", "app", "admin", "platform", "plataforma", "static", "assets", "mail", "status"];

/** Sugestão de endereço a partir do nome: minúsculas, sem acentos, palavras separadas por hífen. */
export function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 63)
        .replace(/-+$/g, "");
}

/** Mesma regra da API: kebab-case, 3–63 caracteres, fora da lista reservada. Retorna a mensagem de erro ou `null`. */
export function validateSlug(slug: string): string | null {
    if (!slug) return "Informe o endereço (slug) do estabelecimento.";
    if (slug.length < 3) return "Use pelo menos 3 caracteres.";
    if (slug.length > 63) return "Use no máximo 63 caracteres.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "Use só letras minúsculas sem acento, números e hífens entre as palavras.";
    if (RESERVED_SLUGS.includes(slug)) return "Esse endereço é reservado pela plataforma. Escolha outro.";
    return null;
}

/** Link de login do espaço — o dono entra por ele (envia o `X-Tenant-Slug`). */
export function tenantLoginUrl(slug: string): string {
    return `${window.location.origin}/login?espaco=${slug}`;
}

export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
