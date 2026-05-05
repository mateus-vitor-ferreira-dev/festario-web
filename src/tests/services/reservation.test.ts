import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
    cancelReservation,
    createReservation,
    getReservation,
    listReservations,
    quoteReservation,
} from "../../services/reservation";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("reservationService", () => {
    it("quoteReservation returns quote data", async () => {
        server.use(
            http.post(`${BASE}/reservations/quote`, () =>
                HttpResponse.json({ success: true, data: { totalCents: 85000, planCode: "ESSENCIAL" } })
            )
        );
        const result = await quoteReservation({ venueId: "v1", planCode: "ESSENCIAL" });
        expect(result.totalCents).toBe(85000);
    });

    it("createReservation returns the new reservation", async () => {
        server.use(
            http.post(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: { id: "res-1", status: "PENDING", checkoutUrl: "https://stripe.com/pay" },
                }, { status: 201 })
            )
        );
        const result = await createReservation({ venueId: "v1", planCode: "ESSENCIAL" });
        expect(result.id).toBe("res-1");
        expect(result.checkoutUrl).toBe("https://stripe.com/pay");
    });

    it("listReservations returns array", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [{ id: "res-1" }] })
            )
        );
        const result = await listReservations();
        expect(result).toHaveLength(1);
    });

    it("listReservations returns empty array when data is null", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: null })
            )
        );
        const result = await listReservations();
        expect(result).toEqual([]);
    });

    it("getReservation returns a single reservation", async () => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: { id: "res-1", status: "PAID" } })
            )
        );
        const result = await getReservation("res-1");
        expect(result.status).toBe("PAID");
    });

    it("cancelReservation sends PATCH and returns updated reservation", async () => {
        server.use(
            http.patch(`${BASE}/reservations/res-1/cancel`, () =>
                HttpResponse.json({ success: true, data: { id: "res-1", status: "CANCELLED" } })
            )
        );
        const result = await cancelReservation("res-1");
        expect(result.status).toBe("CANCELLED");
    });
});
