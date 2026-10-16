import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:3000";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authHandlers = [
    http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json({
            success: true,
            message: "Login successful",
            data: {
                token: "fake-token",
                user: { id: "user-1", name: "Mateus", email: "mateus@email.com", role: "USER" },
            },
        })
    ),
];

// ─── Users ───────────────────────────────────────────────────────────────────

export const userHandlers = [
    http.get(`${BASE_URL}/users/me`, () =>
        HttpResponse.json({
            success: true,
            data: { id: "user-1", name: "Mateus", email: "mateus@email.com", role: "USER", phone: null, birthDate: null },
        })
    ),

    http.patch(`${BASE_URL}/users/:id`, () =>
        HttpResponse.json({
            success: true,
            data: { id: "user-1", name: "Mateus Atualizado", email: "mateus@email.com", role: "USER" },
        })
    ),

    http.post(`${BASE_URL}/users/me/verify-password`, () =>
        HttpResponse.json({ success: true, data: null })
    ),
];

// ─── Venues ──────────────────────────────────────────────────────────────────

export const venueHandlers = [
    http.get(`${BASE_URL}/salons`, () =>
        HttpResponse.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 }, origin: null, sort: "relevance" })
    ),

    http.get(`${BASE_URL}/venues`, () =>
        HttpResponse.json({
            success: true,
            data: [
                { id: "venue-1", name: "Salão Principal", location: "Lavras - MG", basePrice: 65000 },
            ],
        })
    ),

    http.get(`${BASE_URL}/venues/:id`, () =>
        HttpResponse.json({
            success: true,
            data: {
                id: "venue-1",
                name: "Salão Principal",
                location: "Lavras - MG",
                description: "Salão para eventos e celebrações",
                capacity: 150,
                hasKidsArea: false,
                hasPool: false,
            },
        })
    ),

    http.get(`${BASE_URL}/venues/:id/packages`, () =>
        HttpResponse.json({ success: true, data: { date: null, holiday: null, packages: [] } })
    ),

    http.get(`${BASE_URL}/tenant`, () =>
        HttpResponse.json({
            success: true,
            data: {
                slug: "recanto", name: "Recanto", timezone: "America/Sao_Paulo", minLeadHours: null, maxAdvanceDays: null,
                cancellationPolicy: { tiers: [{ minDays: 0, percentage: 0 }], notes: null, isDefault: true, summary: [] },
            },
        })
    ),
];

// ─── Reservations ────────────────────────────────────────────────────────────

export const reservationHandlers = [
    http.get(`${BASE_URL}/reservations`, () =>
        HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    ),

    http.get(`${BASE_URL}/reservations/:id`, () =>
        HttpResponse.json({
            success: true,
            data: {
                id: "res-1",
                status: "PENDING",
                planCode: "ESSENCIAL",
                totalPrice: 85000,
                checkoutUrl: "https://stripe.com/pay/session-1",
                startDate: "2026-06-01T10:00:00.000Z",
                endDate: "2026-06-01T18:00:00.000Z",
                venue: { name: "Salão Principal" },
            },
        })
    ),

    http.post(`${BASE_URL}/reservations/quote`, () =>
        HttpResponse.json({
            success: true,
            data: {
                currency: "BRL",
                packageId: "pkg-sab",
                packageName: "Sábado",
                guestCount: 80,
                items: [{ type: "PLAN_BASE", description: "Sábado", quantity: 1, unitAmountCents: 120000, totalAmountCents: 120000 }],
                cancellationPolicy: { tiers: [{ minDays: 30, percentage: 100 }, { minDays: 0, percentage: 0 }], notes: null, summary: ["Com 30 dias ou mais de antecedência: 100% de reembolso", "Com menos de 30 dias de antecedência: sem reembolso"] },
                subtotalCents: 120000,
                discountCents: 0,
                totalCents: 120000,
                discountApplied: null,
            },
        })
    ),

    http.post(`${BASE_URL}/reservations`, () =>
        HttpResponse.json(
            { success: true, data: { id: "res-new", status: "PENDING" } },
            { status: 201 }
        )
    ),
];

// ─── Promotions ──────────────────────────────────────────────────────────────

export const promotionHandlers = [
    http.get(`${BASE_URL}/promotions/my-grants`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),
    http.get(`${BASE_URL}/promotions/active`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),
    http.get(`${BASE_URL}/promotions/status`, () =>
        HttpResponse.json({
            success: true,
            data: [
                { type: "REFERRAL_NEXT_BOOKING", status: "not_configured", campaign: null },
                { type: "LOYALTY_ALWAYS_HERE",   status: "not_configured", campaign: null },
                { type: "RAFFLE_VIP",            status: "not_configured", campaign: null },
            ],
        })
    ),
];

// ─── Referrals ───────────────────────────────────────────────────────────────

export const referralHandlers = [
    http.get(`${BASE_URL}/referrals`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.post(`${BASE_URL}/referrals`, () =>
        HttpResponse.json({
            success: true,
            data: {
                id: "ref-1",
                referredEmail: "amigo@email.com",
                status: "PENDING",
                createdAt: new Date().toISOString(),
                campaign: { id: "camp-1", name: "Indique um amigo" },
            },
        }, { status: 201 })
    ),
];

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminHandlers = [
    http.get(`${BASE_URL}/admin/reservations/summary`, () =>
        HttpResponse.json({
            success: true,
            data: {
                totalReservations: 10,
                totalRevenue: 500000,
                pendingReservations: 2,
                paidReservations: 7,
                cancelledReservations: 1,
                expiredReservations: 0,
            },
        })
    ),

    http.get(`${BASE_URL}/admin/reservations/revenue/monthly`, () =>
        HttpResponse.json({
            success: true,
            data: {
                year: new Date().getFullYear(),
                months: Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    revenue: 0,
                    count: 0,
                    stripe: 0,
                    pix: 0,
                })),
            },
        })
    ),

    // formato do contrato: `{ data: T[], pagination }`
    http.get(`${BASE_URL}/admin/reservations`, () =>
        HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    ),

    http.get(`${BASE_URL}/admin/campaigns`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/holidays`, () =>
        HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    ),

    http.get(`${BASE_URL}/admin/users`, () =>
        HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    ),

    http.get(`${BASE_URL}/admin/plans`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/items`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/items/templates`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/contract/clauses`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/contract/templates`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/blocked-dates`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),
];

// ─── Availability ─────────────────────────────────────────────────────────────

export const availabilityHandlers = [
    http.get(`${BASE_URL}/blocked-dates`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/reservations/occupied-dates`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),
];

// ─── Negotiations ─────────────────────────────────────────────────────────────

export const negotiationHandlers = [
    http.get(`${BASE_URL}/negotiations`, () =>
        HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
    ),

    http.post(`${BASE_URL}/negotiations`, () =>
        HttpResponse.json({ success: true, data: { id: "neg-1", subject: "Nova negociação", status: "OPEN" } }, { status: 201 })
    ),

    http.get(`${BASE_URL}/negotiations/:id`, () =>
        HttpResponse.json({
            success: true,
            data: {
                id: "neg-1",
                subject: "Quero reservar para 80 pessoas",
                status: "OPEN",
                user: { id: "user-1", name: "Mateus", email: "mateus@email.com", role: "USER" },
                messages: [],
                reservationId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        })
    ),

    http.post(`${BASE_URL}/negotiations/:id/messages`, () =>
        HttpResponse.json({
            success: true,
            data: {
                id: "msg-1",
                content: "Olá, gostaria de saber mais.",
                isSystem: false,
                author: { id: "user-1", name: "Mateus", role: "USER" },
                metadata: null,
                createdAt: new Date().toISOString(),
            },
        }, { status: 201 })
    ),

    http.patch(`${BASE_URL}/negotiations/:id/status`, () =>
        HttpResponse.json({ success: true, data: { id: "neg-1", status: "CLOSED" } })
    ),

    http.post(`${BASE_URL}/negotiations/:id/proposal`, () =>
        HttpResponse.json({ success: true, data: { id: "neg-1", status: "PENDING_APPROVAL" } })
    ),

    http.post(`${BASE_URL}/negotiations/:id/proposal/respond`, () =>
        HttpResponse.json({ success: true, data: { id: "neg-1", status: "ACCEPTED", reservation: { id: "res-1" } } })
    ),

    http.get(`${BASE_URL}/contact`, () =>
        HttpResponse.json({
            success: true,
            data: {
                name: "Salão Lagoa",
                whatsapp: { number: "5531997842215", display: "(31) 99784-2215" },
                phone: "(31) 3333-4444",
                email: "contato@salaolagoa.com.br",
                instagram: { url: "https://www.instagram.com/salaolagoa", display: "@salaolagoa" },
                address: "Av. Otacílio Negrão de Lima, 1000 - Belo Horizonte",
            },
        })
    ),
];

// ─── Plataforma (ADMIN) e convite do dono ────────────────────────────────────

export const INVITE_TOKEN = "a".repeat(64);

export const mockTenants = [
    {
        id: "tenant-1",
        slug: "salao-jardim-das-flores",
        name: "Salão Jardim das Flores",
        plan: "STARTER",
        isActive: true,
        createdAt: "2026-03-28T14:39:45.615Z",
        updatedAt: "2026-10-14T14:39:45.955Z",
        stats: { venues: 1, owners: 1, reservations: 6, pendingInvites: 1, paidRevenue: 3320 },
    },
    {
        id: "tenant-2",
        slug: "recanto-vila-rica",
        name: "Recanto Vila Rica",
        plan: "FREE",
        isActive: false,
        createdAt: "2025-08-20T14:39:45.615Z",
        updatedAt: "2026-10-14T14:39:45.650Z",
        stats: { venues: 2, owners: 1, reservations: 48, pendingInvites: 0, paidRevenue: 28190.5 },
    },
];

export const mockInvites = [
    { id: "inv-1", tenantId: "tenant-1", email: "socia@jardim.com", status: "valid", expiresAt: "2026-10-19T14:39:45.615Z", acceptedAt: null, revokedAt: null, createdAt: "2026-10-12T14:39:45.615Z", invitedBy: { id: "admin-1", name: "Equipe" } },
    { id: "inv-2", tenantId: "tenant-1", email: "antigo@jardim.com", status: "expired", expiresAt: "2026-09-01T10:00:00.000Z", acceptedAt: null, revokedAt: null, createdAt: "2026-08-25T10:00:00.000Z", invitedBy: null },
    { id: "inv-3", tenantId: "tenant-1", email: "dono@jardim.com", status: "accepted", expiresAt: "2026-04-01T10:00:00.000Z", acceptedAt: "2026-03-29T10:00:00.000Z", revokedAt: null, createdAt: "2026-03-28T10:00:00.000Z", invitedBy: null },
    { id: "inv-4", tenantId: "tenant-1", email: "errado@jardim.com", status: "revoked", expiresAt: "2026-04-01T10:00:00.000Z", acceptedAt: null, revokedAt: "2026-03-30T10:00:00.000Z", createdAt: "2026-03-28T10:00:00.000Z", invitedBy: null },
];

const paginate = <T,>(data: T[], url: URL) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    return { message: "ok", data, pagination: { page, limit, total: data.length, totalPages: Math.max(1, Math.ceil(data.length / limit)) } };
};

export const platformHandlers = [
    http.get(`${BASE_URL}/platform/tenants`, ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q")?.toLowerCase() ?? "";
        const isActive = url.searchParams.get("isActive");
        const list = mockTenants.filter((t) =>
            (!q || t.name.toLowerCase().includes(q) || t.slug.includes(q)) &&
            (isActive === null || String(t.isActive) === isActive),
        );
        return HttpResponse.json(paginate(list, url));
    }),

    http.post(`${BASE_URL}/platform/tenants`, async ({ request }) => {
        const body = (await request.json()) as { name: string; slug: string; plan?: string };
        return HttpResponse.json(
            { message: "created", data: { id: "tenant-new", isActive: true, plan: "FREE", ...body } },
            { status: 201 },
        );
    }),

    http.patch(`${BASE_URL}/platform/tenants/:id`, async ({ params, request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const tenant = mockTenants.find((t) => t.id === params.id) ?? mockTenants[0];
        return HttpResponse.json({ message: "updated", data: { ...tenant, ...body } });
    }),

    http.get(`${BASE_URL}/platform/tenants/:id/invites`, ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        return HttpResponse.json(paginate(mockInvites.filter((i) => !status || i.status === status), url));
    }),

    http.post(`${BASE_URL}/platform/tenants/:id/invites`, async ({ request }) => {
        const { email } = (await request.json()) as { email: string };
        return HttpResponse.json(
            {
                message: "created",
                data: {
                    invite: { ...mockInvites[0], id: "inv-new", email },
                    emailSent: false,
                    inviteUrl: `http://localhost:5173/convite/${INVITE_TOKEN}`,
                },
            },
            { status: 201 },
        );
    }),

    http.delete(`${BASE_URL}/platform/tenants/:id/invites/:inviteId`, ({ params }) =>
        HttpResponse.json({ message: "revoked", data: { ...mockInvites[0], id: params.inviteId, status: "revoked" } })
    ),

    http.get(`${BASE_URL}/owner-invites/:token`, ({ params }) => {
        if (params.token !== INVITE_TOKEN) {
            return HttpResponse.json({ error: { code: "INVITE_NOT_FOUND", message: "Convite não encontrado" } }, { status: 404 });
        }
        return HttpResponse.json({
            message: "ok",
            data: { tenantName: "Salão Jardim das Flores", email: "socia@jardim.com", status: "valid", expiresAt: "2026-10-19T14:39:45.615Z" },
        });
    }),

    http.post(`${BASE_URL}/owner-invites/:token/accept`, async ({ request }) => {
        const { name } = (await request.json()) as { name: string };
        return HttpResponse.json(
            {
                message: "accepted",
                data: {
                    user: { id: "owner-new", name, email: "socia@jardim.com", role: "OWNER", emailVerified: true },
                    token: "owner-token",
                    refreshToken: "owner-refresh",
                    tenant: { id: "tenant-1", slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" },
                },
            },
            { status: 201 },
        );
    }),
];

// ─── All handlers ─────────────────────────────────────────────────────────────

export const handlers = [
    ...availabilityHandlers,  // must come before reservationHandlers (/reservations/:id would match /reservations/occupied-dates)
    ...authHandlers,
    ...userHandlers,
    ...venueHandlers,
    ...reservationHandlers,
    ...promotionHandlers,
    ...referralHandlers,
    ...adminHandlers,
    ...negotiationHandlers,
    ...platformHandlers,
];
