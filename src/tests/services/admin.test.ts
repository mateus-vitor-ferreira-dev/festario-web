import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
    cancelAdminReservation,
    createBlockedDate,
    createCampaign,
    createHoliday,
    createPlan,
    deleteBlockedDate,
    deleteHoliday,
    deletePlan,
    drawRaffleWinner,
    getMonthlyRevenue,
    getReservationsSummary,
    listAdminReservations,
    listAdminUsers,
    listBlockedDates,
    listCampaigns,
    listHolidays,
    listPlans,
    syncHolidays,
    syncMunicipalHolidays,
    updateCampaign,
    updatePlan,
} from "../../services/admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("adminService", () => {
    it("getReservationsSummary returns summary data", async () => {
        const result = await getReservationsSummary();
        expect(result.totalReservations).toBe(10);
        expect(result.totalRevenue).toBe(500000);
    });

    it("listAdminReservations returns reservations array", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ id: "res-1", status: "PAID" }] })
            )
        );
        const result = await listAdminReservations();
        expect(result).toHaveLength(1);
    });

    it("listAdminReservations unwraps the paginated response returned by the API", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: { page: 1, limit: 20, data: [{ id: "res-1", status: "PAID" }, { id: "res-2", status: "PENDING" }] },
                })
            )
        );
        const result = await listAdminReservations();
        expect(Array.isArray(result)).toBe(true);
        expect(result.map((r) => r.id)).toEqual(["res-1", "res-2"]);
    });

    it("listCampaigns returns campaigns array", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({ success: true, data: [{ id: "camp-1", name: "Indique um amigo" }] })
            )
        );
        const result = await listCampaigns();
        expect(result[0].name).toBe("Indique um amigo");
    });

    it("createCampaign sends POST and returns new campaign", async () => {
        server.use(
            http.post(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({ success: true, data: { id: "camp-2", name: "Nova campanha" } }, { status: 201 })
            )
        );
        const result = await createCampaign({ name: "Nova campanha", code: "NOVA" });
        expect(result.id).toBe("camp-2");
    });

    it("updateCampaign sends PATCH and returns updated campaign", async () => {
        server.use(
            http.patch(`${BASE}/admin/campaigns/camp-1`, () =>
                HttpResponse.json({ success: true, data: { id: "camp-1", isActive: false } })
            )
        );
        const result = await updateCampaign("camp-1", { isActive: false });
        expect(result.isActive).toBe(false);
    });

    it("drawRaffleWinner sends POST and returns winner", async () => {
        server.use(
            http.post(`${BASE}/admin/campaigns/camp-1/draw-winner`, () =>
                HttpResponse.json({
                    success: true,
                    data: { winner: { name: "Maria", email: "maria@email.com" }, totalEntries: 5, campaignName: "Sorteio VIP" },
                })
            )
        );
        const result = await drawRaffleWinner("camp-1");
        expect(result.winner.name).toBe("Maria");
    });

    it("listHolidays returns holidays for a given year", async () => {
        server.use(
            http.get(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({ success: true, data: [{ id: "h-1", name: "Natal", date: "2026-12-25" }] })
            )
        );
        const result = await listHolidays(2026);
        expect(result[0].name).toBe("Natal");
    });

    it("syncHolidays sends POST and returns synced count", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync`, () =>
                HttpResponse.json({ success: true, data: { synced: 12 } })
            )
        );
        const result = await syncHolidays(2026);
        expect(result.synced).toBe(12);
    });

    it("syncMunicipalHolidays sends POST and returns synced count", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync-municipal`, () =>
                HttpResponse.json({ success: true, data: { synced: 3 } })
            )
        );
        const result = await syncMunicipalHolidays(2026, []);
        expect(result.synced).toBe(3);
    });

    it("createHoliday sends POST and returns new holiday", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({ success: true, data: { id: "h-2", name: "Feriado Teste" } }, { status: 201 })
            )
        );
        const result = await createHoliday({ name: "Feriado Teste", date: "2026-10-01", type: "national" });
        expect(result.id).toBe("h-2");
    });

    it("deleteHoliday sends DELETE", async () => {
        server.use(
            http.delete(`${BASE}/admin/holidays/h-1`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        await expect(deleteHoliday("h-1")).resolves.toBeUndefined();
    });

    // ─── cancelAdminReservation ──────────────────────────────────────────────

    it("cancelAdminReservation sends PATCH and returns cancelled reservation", async () => {
        server.use(
            http.patch(`${BASE}/admin/reservations/res-1/cancel`, () =>
                HttpResponse.json({ success: true, data: { id: "res-1", status: "CANCELLED" } })
            )
        );
        const result = await cancelAdminReservation("res-1");
        expect(result.status).toBe("CANCELLED");
    });

    // ─── listAdminUsers ──────────────────────────────────────────────────────

    it("listAdminUsers returns users array", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({ success: true, data: [{ id: "u-1", name: "Mateus", email: "m@email.com" }] })
            )
        );
        const result = await listAdminUsers();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Mateus");
    });

    it("listAdminUsers unwraps the paginated response returned by the API", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({
                    success: true,
                    data: { page: 1, limit: 20, total: 1, data: [{ id: "u-1", name: "Mateus", email: "m@email.com" }] },
                })
            )
        );
        const result = await listAdminUsers();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Mateus");
    });

    it("listAdminUsers returns an empty list for an unexpected payload", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () => HttpResponse.json({ success: true, data: null }))
        );
        expect(await listAdminUsers()).toEqual([]);
    });

    it("listAdminUsers passes filters as query params", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, ({ request }) => {
                const url = new URL(request.url);
                return HttpResponse.json({
                    success: true,
                    data: [{ id: "u-1", name: "Filtered", role: url.searchParams.get("role") }],
                });
            })
        );
        const result = await listAdminUsers({ role: "ADMIN" });
        expect(result[0].role).toBe("ADMIN");
    });

    // ─── getMonthlyRevenue ────────────────────────────────────────────────────

    it("getMonthlyRevenue returns monthly revenue data", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations/revenue/monthly`, () =>
                HttpResponse.json({ success: true, data: { year: 2026, months: [{ month: 1, revenue: 1000 }] } })
            )
        );
        const result = await getMonthlyRevenue(2026);
        expect(result.year).toBe(2026);
    });

    // ─── Plans ────────────────────────────────────────────────────────────────

    it("listPlans returns plans array", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: true, data: [{ id: "plan-1", code: "ESSENCIAL", priceCents: 85000, active: true }] })
            )
        );
        const result = await listPlans();
        expect(result[0].code).toBe("ESSENCIAL");
    });

    it("listPlans passes filters as query params", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, ({ request }) => {
                const url = new URL(request.url);
                return HttpResponse.json({
                    success: true,
                    data: [{ id: "plan-1", code: "ESSENCIAL", active: url.searchParams.get("active") === "true" }],
                });
            })
        );
        const result = await listPlans({ active: true });
        expect(result[0].active).toBe(true);
    });

    it("createPlan sends POST and returns new plan", async () => {
        server.use(
            http.post(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: true, data: { id: "plan-new", code: "PROMOCIONAL", priceCents: 65000 } }, { status: 201 })
            )
        );
        const result = await createPlan({ code: "PROMOCIONAL", priceCents: 65000 });
        expect(result.id).toBe("plan-new");
    });

    it("updatePlan sends PATCH and returns updated plan", async () => {
        server.use(
            http.patch(`${BASE}/admin/plans/plan-1`, () =>
                HttpResponse.json({ success: true, data: { id: "plan-1", priceCents: 90000, active: false } })
            )
        );
        const result = await updatePlan("plan-1", { priceCents: 90000, active: false });
        expect(result.priceCents).toBe(90000);
        expect(result.active).toBe(false);
    });

    it("deletePlan sends DELETE and returns result", async () => {
        server.use(
            http.delete(`${BASE}/admin/plans/plan-1`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        await expect(deletePlan("plan-1")).resolves.toBeUndefined();
    });

    // ─── Blocked Dates ────────────────────────────────────────────────────────

    it("listBlockedDates returns blocked dates array", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ id: "bd-1", startDate: "2026-07-01", endDate: "2026-07-05", venueId: "venue-1" }],
                })
            )
        );
        const result = await listBlockedDates();
        expect(result[0].id).toBe("bd-1");
    });

    it("listBlockedDates passes filters as query params", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, ({ request }) => {
                const url = new URL(request.url);
                return HttpResponse.json({
                    success: true,
                    data: [{ id: "bd-1", venueId: url.searchParams.get("venueId") }],
                });
            })
        );
        const result = await listBlockedDates({ venueId: "venue-1" });
        expect(result[0].venueId).toBe("venue-1");
    });

    it("createBlockedDate sends POST and returns new blocked date", async () => {
        server.use(
            http.post(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: { id: "bd-new", startDate: "2026-08-01", endDate: "2026-08-05", venueId: "venue-1" },
                }, { status: 201 })
            )
        );
        const result = await createBlockedDate({ venueId: "venue-1", startDate: "2026-08-01", endDate: "2026-08-05" });
        expect(result.id).toBe("bd-new");
    });

    it("deleteBlockedDate sends DELETE and returns result", async () => {
        server.use(
            http.delete(`${BASE}/blocked-dates/bd-1`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        await expect(deleteBlockedDate("bd-1")).resolves.toBeUndefined();
    });
});
