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
];

// ─── Reservations ────────────────────────────────────────────────────────────

export const reservationHandlers = [
    http.get(`${BASE_URL}/reservations`, () =>
        HttpResponse.json({ success: true, data: [] })
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
                totalCents: 85000,
                subtotalCents: 85000,
                discountCents: 0,
                discountApplied: false,
                items: [{ description: "Aluguel do salão", amountCents: 85000 }],
                planCode: "ESSENCIAL",
                currency: "BRL",
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

    http.get(`${BASE_URL}/admin/reservations`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/campaigns`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/holidays`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/users`, () =>
        HttpResponse.json({ success: true, data: [] })
    ),

    http.get(`${BASE_URL}/admin/plans`, () =>
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
        HttpResponse.json({ success: true, data: [] })
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
                whatsapp: { number: "5535999718824", display: "(35) 9 9971-8824" },
                email: "recanto.vilaricafestas@gmail.com",
                instagram: { url: "https://www.instagram.com/recanto.vilarica", display: "@recanto.vilarica" },
            },
        })
    ),
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
];
