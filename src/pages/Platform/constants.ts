import type { InviteStatus, TenantPlan } from "../../types";

export const TENANTS_PAGE_SIZE = 20;
export const INVITES_PAGE_SIZE = 10;

export const PLAN_LABELS: Record<TenantPlan, string> = {
    FREE: "Gratuito",
    STARTER: "Inicial",
    PRO: "Profissional",
};

export const PLAN_OPTIONS = (Object.keys(PLAN_LABELS) as TenantPlan[]).map((value) => ({ value, label: PLAN_LABELS[value] }));

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
