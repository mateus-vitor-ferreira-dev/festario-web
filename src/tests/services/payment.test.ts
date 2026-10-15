import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { deletePaymentEntry, getReservationPayment, recordPaymentEntry } from "../../services/payment";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("payment service (pagamento combinado com o salão, #48)", () => {
    it("getReservationPayment sends the reservation's salon and returns data.data", async () => {
        let tenant: string | null = null;
        server.use(http.get(`${BASE}/payments/reservation/res-1`, ({ request }) => {
            tenant = request.headers.get("X-Tenant-Slug");
            return HttpResponse.json({ data: { reservationId: "res-1", mode: "MANUAL" } });
        }));
        const result = await getReservationPayment("res-1", "casa-pampulha");
        expect(result.mode).toBe("MANUAL");
        expect(tenant).toBe("casa-pampulha");
    });

    it("recordPaymentEntry posts the entry", async () => {
        let body: unknown = null;
        server.use(http.post(`${BASE}/admin/reservations/res-1/payments`, async ({ request }) => {
            body = await request.json();
            return HttpResponse.json({ data: { reservationStatus: "PAID" } }, { status: 201 });
        }));
        const result = await recordPaymentEntry("res-1", { kind: "PAYMENT", method: "PIX", amount: 360 });
        expect(body).toEqual({ kind: "PAYMENT", method: "PIX", amount: 360 });
        expect(result.reservationStatus).toBe("PAID");
    });

    it("deletePaymentEntry calls DELETE", async () => {
        server.use(http.delete(`${BASE}/admin/reservations/res-1/payments/e-1`, () => HttpResponse.json({ data: { entries: [] } })));
        const result = await deletePaymentEntry("res-1", "e-1");
        expect(result.entries).toEqual([]);
    });
});
