import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { createCheckoutSession, createPixCharge, getPaymentStatus } from "../../services/payment";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("payment service", () => {
    it("createCheckoutSession returns data from POST /payments/checkout/:id", async () => {
        server.use(
            http.post(`${BASE}/payments/checkout/res-1`, () =>
                HttpResponse.json({ url: "https://stripe.com/pay/session-1", sessionId: "cs_123" })
            )
        );

        const result = await createCheckoutSession("res-1");
        expect(result.url).toBe("https://stripe.com/pay/session-1");
    });

    it("createPixCharge returns data.data from POST /payments/pix/:id", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: { txid: "txid-abc", qrCode: "base64", copyPaste: "pix-code", expiresAt: "2026-06-01T11:00:00Z" },
                })
            )
        );

        const result = await createPixCharge("res-1");
        expect(result.txid).toBe("txid-abc");
        expect(result.copyPaste).toBe("pix-code");
    });

    it("getPaymentStatus returns data.data from GET /payments/reservation/:id", async () => {
        server.use(
            http.get(`${BASE}/payments/reservation/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: { payment: { status: "PAID" }, reservationStatus: "PAID" },
                })
            )
        );

        const result = await getPaymentStatus("res-1", new AbortController().signal);
        expect(result.payment.status).toBe("PAID");
        expect(result.reservationStatus).toBe("PAID");
    });
});
