import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import { createReferral, listReferrals } from "../../services/referral";
import { server } from "../mocks/server";

describe("referralService", () => {
    afterEach(() => localStorage.clear());

    it("listReferrals returns the data array", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { id: "ref-1", referredEmail: "a@a.com", status: "PENDING" },
                    ],
                })
            )
        );

        const result = await listReferrals();
        expect(result).toHaveLength(1);
        expect(result[0].referredEmail).toBe("a@a.com");
    });

    it("createReferral sends referredEmail and returns the new referral", async () => {
        const result = await createReferral("amigo@email.com");
        expect(result.referredEmail).toBe("amigo@email.com");
        expect(result.status).toBe("PENDING");
    });

    it("createReferral throws when there is no active campaign", async () => {
        server.use(
            http.post("http://localhost:3000/referrals", () =>
                HttpResponse.json(
                    { success: false, error: { code: "NO_ACTIVE_REFERRAL_CAMPAIGN", message: "No active campaign" } },
                    { status: 422 }
                )
            )
        );

        await expect(createReferral("amigo@email.com")).rejects.toThrow();
    });
});
