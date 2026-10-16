/**
 * @module services/admin
 * @description Funções de acesso à API para o painel administrativo.
 * Todos os endpoints requerem `role === "ADMIN"` — o token JWT é enviado
 * automaticamente pelo interceptor do Axios (`services/api.js`).
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type {
    Reservation,
    User,
    Campaign,
    Holiday,
    BlockedDate,
    ReservationSummary,
    MonthlyRevenue,
    RaffleWinnerResult,
    PaginatedResult,
    ListParams,
} from "../types";

/**
 * As listagens paginadas do admin respondem `{ page, limit, total?, data: [...] }`
 * dentro do envelope `data`. Extrai a lista (e aceita lista direta, por compatibilidade).
 */
function unwrapList<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: T[] }).data;
    }
    return [];
}

// ─── Reservations ────────────────────────────────────────────────────────────

/**
 * Retorna um resumo de reservas com contagens por status.
 *
 * @see GET /admin/reservations/summary
 */
export async function getReservationsSummary(filters: Record<string, unknown> = {}): Promise<ReservationSummary> {
    const { data } = await api.get("/admin/reservations/summary", { params: filters });
    return data.data;
}

/**
 * Lista todas as reservas do sistema com suporte a filtros.
 *
 * @see GET /admin/reservations
 */
export async function listAdminReservations(filters: Record<string, unknown> = {}, signal?: AbortSignal): Promise<Reservation[]> {
    const { data } = await api.get("/admin/reservations", { params: filters, signal });
    return unwrapList<Reservation>(data.data);
}

/**
 * Lista reservas do admin com paginação e filtros (`status`, `startDate`, `endDate`,
 * `q`, `venueId`, `packageId`, `minPrice`, `maxPrice`, `sort`).
 *
 * @see GET /admin/reservations
 */
export async function listAdminReservationsPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Reservation>> {
    const { data } = await api.get("/admin/reservations", { params: cleanParams(params), signal });
    return toPaginated<Reservation>(data, params);
}

/**
 * Cancela uma reserva como administrador.
 *
 * @see PATCH /admin/reservations/:id/cancel
 */
export async function cancelAdminReservation(id: string): Promise<Reservation> {
    const { data } = await api.patch(`/admin/reservations/${id}/cancel`);
    return data.data;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * Lista todos os usuários do sistema.
 *
 * @see GET /admin/users
 */
export async function listAdminUsers(filters: Record<string, unknown> = {}): Promise<User[]> {
    const { data } = await api.get("/admin/users", { params: filters });
    return unwrapList<User>(data.data);
}

/**
 * Lista usuários com paginação e filtros (`q` — nome ou e-mail — e `role`).
 *
 * @see GET /admin/users
 */
export async function listAdminUsersPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<User>> {
    const { data } = await api.get("/admin/users", { params: cleanParams(params), signal });
    return toPaginated<User>(data, params);
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

/**
 * Retorna a receita mensal agrupada por mês para um determinado ano.
 *
 * @see GET /admin/reservations/revenue/monthly
 */
export async function getMonthlyRevenue(year: number): Promise<MonthlyRevenue> {
    const { data } = await api.get("/admin/reservations/revenue/monthly", { params: { year } });
    return data.data;
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

/**
 * Lista todas as campanhas de desconto/referral/sorteio.
 *
 * @see GET /admin/campaigns
 */
export async function listCampaigns(): Promise<Campaign[]> {
    const { data } = await api.get("/admin/campaigns");
    return data.data;
}

/**
 * Cria uma nova campanha.
 *
 * @see POST /admin/campaigns
 */
export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.post("/admin/campaigns", payload);
    return data.data;
}

/**
 * Atualiza uma campanha existente.
 *
 * @see PATCH /admin/campaigns/:id
 */
export async function updateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.patch(`/admin/campaigns/${id}`, payload);
    return data.data;
}

/**
 * Sorteia um ganhador para uma campanha do tipo `RAFFLE`.
 *
 * @see POST /admin/campaigns/:id/draw-winner
 */
export async function drawRaffleWinner(id: string): Promise<RaffleWinnerResult> {
    const { data } = await api.post(`/admin/campaigns/${id}/draw-winner`);
    return data.data;
}

// ─── Holidays ─────────────────────────────────────────────────────────────────

/**
 * Lista todos os feriados de um determinado ano.
 *
 * @see GET /admin/holidays
 */
export async function listHolidays(year: number, signal?: AbortSignal): Promise<Holiday[]> {
    const { data } = await api.get("/admin/holidays", { params: { year }, signal });
    return data.data;
}

/**
 * Lista feriados de um ano com paginação.
 *
 * @see GET /admin/holidays?year=&page=&limit=
 */
export async function listHolidaysPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Holiday>> {
    const { data } = await api.get("/admin/holidays", { params: cleanParams(params), signal });
    return toPaginated<Holiday>(data, params);
}

/**
 * Sincroniza feriados nacionais automaticamente via API externa para o ano informado.
 *
 * @see POST /admin/holidays/sync
 */
export async function syncHolidays(year: number): Promise<{ synced: number }> {
    const { data } = await api.post("/admin/holidays/sync", null, { params: { year } });
    return data.data;
}

/**
 * Cria um feriado do salão; com `type: national` (só ADMIN), um feriado nacional.
 *
 * @see POST /admin/holidays
 */
export async function createHoliday(payload: { date: string; name: string; type?: "national" }): Promise<Holiday> {
    const { data } = await api.post("/admin/holidays", payload);
    return data.data;
}

/**
 * Remove um feriado pelo ID.
 *
 * @see DELETE /admin/holidays/:id
 */
export async function deleteHoliday(id: string): Promise<void> {
    await api.delete(`/admin/holidays/${id}`);
}

// ─── Blocked Dates ────────────────────────────────────────────────────────────

/**
 * Lista os intervalos de datas bloqueadas (sem reservas possíveis).
 *
 * @see GET /blocked-dates
 */
export async function listBlockedDates(filters: Record<string, unknown> = {}): Promise<BlockedDate[]> {
    const { data } = await api.get("/blocked-dates", { params: filters });
    return data.data;
}

/**
 * Lista datas bloqueadas com paginação e filtros (`venueId`, `from`, `to`).
 *
 * @see GET /blocked-dates
 */
export async function listBlockedDatesPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<BlockedDate>> {
    const { data } = await api.get("/blocked-dates", { params: cleanParams(params), signal });
    return toPaginated<BlockedDate>(data, params);
}

/**
 * Cria um novo intervalo de datas bloqueadas para um espaço.
 *
 * @see POST /blocked-dates
 */
export async function createBlockedDate(payload: { venueId: string; startDate: string; endDate: string; reason?: string }): Promise<BlockedDate> {
    const { data } = await api.post("/blocked-dates", payload);
    return data.data;
}

/**
 * Remove um intervalo de datas bloqueadas.
 *
 * @see DELETE /blocked-dates/:id
 */
export async function deleteBlockedDate(id: string): Promise<void> {
    await api.delete(`/blocked-dates/${id}`);
}
