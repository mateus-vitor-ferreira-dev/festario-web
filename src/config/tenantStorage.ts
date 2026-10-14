/**
 * @module config/tenantStorage
 * @description Espaço (tenant) em que o navegador está operando.
 *
 * A API escolhe o tenant pelo cabeçalho `X-Tenant-Slug`; sem ele, usa o espaço
 * padrão. O web guarda o slug quando:
 * - o dono aceita um convite (`/convite/:token` → `tenant.slug` da resposta);
 * - a pessoa abre o login de um espaço específico (`/login?espaco=<slug>`);
 * - o ADMIN da plataforma abre o painel de um espaço (`Abrir painel`).
 *
 * Fica separado da sessão porque precisa existir antes do login (o login de um
 * dono de outro espaço só funciona com o cabeçalho certo).
 */
import type { TenantRef } from "../types";

export const TENANT_STORAGE_KEY = "recanto:tenant";

/** Mesmo formato aceito pela API (kebab-case, 3–63). */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidTenantSlug(slug: string): boolean {
    return slug.length >= 3 && slug.length <= 63 && SLUG_PATTERN.test(slug);
}

export function readTenant(): TenantRef | null {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(TENANT_STORAGE_KEY) || "null");
        if (!raw || typeof raw !== "object") return null;
        const { slug, name } = raw as Record<string, unknown>;
        if (typeof slug !== "string" || !isValidTenantSlug(slug)) return null;
        return { slug, name: typeof name === "string" ? name : null };
    } catch {
        return null;
    }
}

export function writeTenant(tenant: TenantRef): void {
    localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify({ slug: tenant.slug, name: tenant.name ?? null }));
}

export function clearTenant(): void {
    localStorage.removeItem(TENANT_STORAGE_KEY);
}

/** Cabeçalho para chamadas feitas fora do axios (`fetch`). */
export function tenantHeaders(): Record<string, string> {
    const slug = readTenant()?.slug;
    return slug ? { "X-Tenant-Slug": slug } : {};
}
