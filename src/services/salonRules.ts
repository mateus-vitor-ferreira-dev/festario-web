/**
 * @module services/salonRules
 * @description Regras do salão no painel (#42–#47): pacotes, itens, regras da reserva, cancelamento,
 * perfil do locador e cláusulas do contrato. OWNER do salão (ou ADMIN no painel dele).
 */
import api from "./api";
import type {
    ClauseTemplate, ContractClause, ItemTemplate, SalonItem, SalonPackage, SalonPackageInput, TenantSettings, TenantSettingsInput,
} from "../types";

const unwrap = <T,>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

// ── Pacotes ──────────────────────────────────────────────────────────────────
/** @see GET /admin/plans */
export const listPackages = (signal?: AbortSignal) => unwrap<SalonPackage[]>(api.get("/admin/plans", { signal }));
/** @see POST /admin/plans */
export const createPackage = (payload: SalonPackageInput) => unwrap<SalonPackage>(api.post("/admin/plans", payload));
/** @see PATCH /admin/plans/:id */
export const updatePackage = (id: string, payload: SalonPackageInput) => unwrap<SalonPackage>(api.patch(`/admin/plans/${id}`, payload));
/** @see DELETE /admin/plans/:id */
export const deletePackage = (id: string) => api.delete(`/admin/plans/${id}`).then(() => undefined);

// ── Itens ────────────────────────────────────────────────────────────────────
/** @see GET /admin/items */
export const listItems = (signal?: AbortSignal) => unwrap<SalonItem[]>(api.get("/admin/items", { signal }));
/** @see GET /admin/items/templates */
export const listItemTemplates = (signal?: AbortSignal) => unwrap<ItemTemplate[]>(api.get("/admin/items/templates", { signal }));
/** @see POST /admin/items */
export const createItem = (payload: Partial<Omit<SalonItem, "unitPrice">> & { unitPrice: number }) => unwrap<SalonItem>(api.post("/admin/items", payload));
/** @see PATCH /admin/items/:id */
export const updateItem = (id: string, payload: Partial<Omit<SalonItem, "unitPrice">> & { unitPrice?: number }) => unwrap<SalonItem>(api.patch(`/admin/items/${id}`, payload));
/** @see DELETE /admin/items/:id */
export const deleteItem = (id: string) => api.delete(`/admin/items/${id}`).then(() => undefined);

// ── Regras, cancelamento e perfil ────────────────────────────────────────────
/** @see GET /tenant/settings */
export const getTenantSettings = (signal?: AbortSignal) => unwrap<TenantSettings>(api.get("/tenant/settings", { signal }));
/** @see PUT /tenant/settings */
export const updateTenantSettings = (payload: TenantSettingsInput) => unwrap<TenantSettings>(api.put("/tenant/settings", payload));

// ── Cláusulas do contrato ────────────────────────────────────────────────────
/** @see GET /admin/contract/clauses */
export const listClauses = (signal?: AbortSignal) => unwrap<ContractClause[]>(api.get("/admin/contract/clauses", { signal }));
/** @see GET /admin/contract/templates */
export const listClauseTemplates = (signal?: AbortSignal) => unwrap<ClauseTemplate[]>(api.get("/admin/contract/templates", { signal }));
/** @see POST /admin/contract/clauses */
export const createClause = (payload: Partial<Omit<ContractClause, "fineAmount">> & { fineAmount?: number | null }) => unwrap<ContractClause>(api.post("/admin/contract/clauses", payload));
/** @see PATCH /admin/contract/clauses/:id */
export const updateClause = (id: string, payload: Partial<Omit<ContractClause, "fineAmount">> & { fineAmount?: number | null }) => unwrap<ContractClause>(api.patch(`/admin/contract/clauses/${id}`, payload));
/** @see DELETE /admin/contract/clauses/:id */
export const deleteClause = (id: string) => api.delete(`/admin/contract/clauses/${id}`).then(() => undefined);
