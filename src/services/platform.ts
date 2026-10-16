/**
 * @module services/platform
 * @description Área da plataforma (só ADMIN): estabelecimentos (tenants) e convites
 * de dono, e o aceite público do convite. As rotas `/platform/*` e `/owner-invites/*`
 * não dependem do `X-Tenant-Slug`.
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type {
    AcceptInviteResult,
    CreateInviteResult,
    InviteInfo,
    ListParams,
    OwnerInvite,
    PaginatedResult,
    Tenant,
    TenantPlan,
} from "../types";

/**
 * Lista os estabelecimentos com as contagens (`q` busca nome/slug; `isActive` = "true" | "false").
 *
 * @see GET /platform/tenants
 */
export async function listTenantsPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Tenant>> {
    const { data } = await api.get("/platform/tenants", { params: cleanParams(params), signal });
    return toPaginated<Tenant>(data, params);
}

/**
 * Busca um estabelecimento pelo slug (a API não tem `GET /platform/tenants/:id`;
 * a busca `q` também casa o slug, e aqui fica só o resultado exato).
 */
export async function findTenantBySlug(slug: string, signal?: AbortSignal): Promise<Tenant | null> {
    const { data } = await listTenantsPage({ q: slug, limit: 100 }, signal);
    return data.find((t) => t.slug === slug) ?? null;
}

export interface CreateTenantPayload {
    name: string;
    slug: string;
    plan?: TenantPlan;
}

/** @see POST /platform/tenants — 409 `TENANT_SLUG_IN_USE` */
export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    const { data } = await api.post("/platform/tenants", payload);
    return data.data;
}

/** @see PATCH /platform/tenants/:id */
export async function updateTenant(id: string, patch: Partial<Pick<Tenant, "name" | "plan" | "isActive">>): Promise<Tenant> {
    const { data } = await api.patch(`/platform/tenants/${id}`, patch);
    return data.data;
}

/**
 * Convida o dono por e-mail (revoga o convite válido anterior do mesmo e-mail).
 * Fora de produção a resposta traz `inviteUrl`, porque o e-mail pode não estar configurado.
 *
 * @see POST /platform/tenants/:id/invites — 409 `EMAIL_ALREADY_IN_USE`
 */
export async function createInvite(tenantId: string, email: string): Promise<CreateInviteResult> {
    const { data } = await api.post(`/platform/tenants/${tenantId}/invites`, { email });
    return data.data;
}

/** @see GET /platform/tenants/:id/invites?status=valid|expired|accepted|revoked */
export async function listInvitesPage(tenantId: string, params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<OwnerInvite>> {
    const { data } = await api.get(`/platform/tenants/${tenantId}/invites`, { params: cleanParams(params), signal });
    return toPaginated<OwnerInvite>(data, params);
}

/** @see DELETE /platform/tenants/:id/invites/:inviteId — 409 `INVITE_ALREADY_ACCEPTED` */
export async function revokeInvite(tenantId: string, inviteId: string): Promise<OwnerInvite> {
    const { data } = await api.delete(`/platform/tenants/${tenantId}/invites/${inviteId}`);
    return data.data;
}

// ─── Convite (público) ───────────────────────────────────────────────────────

/** @see GET /owner-invites/:token — 404 `INVITE_NOT_FOUND` */
export async function getInvite(token: string, signal?: AbortSignal): Promise<InviteInfo> {
    const { data } = await api.get(`/owner-invites/${token}`, { signal });
    return data.data;
}

/**
 * Cria a conta do dono a partir do convite e devolve a sessão + o espaço
 * (`tenant.slug` passa a ir no `X-Tenant-Slug`).
 *
 * @see POST /owner-invites/:token/accept
 */
export async function acceptInvite(token: string, payload: { name: string; password: string }): Promise<AcceptInviteResult> {
    const { data } = await api.post(`/owner-invites/${token}/accept`, payload);
    return data.data;
}
