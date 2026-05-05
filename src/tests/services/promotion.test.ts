import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { listMyGrants } from "../../services/promotion";
import { server } from "../mocks/server";

describe("promotionService", () => {
    it("listMyGrants returns empty array when user has no grants", async () => {
        const result = await listMyGrants();
        expect(result).toEqual([]);
    });

    it("listMyGrants returns grants when available", async () => {
        server.use(
            http.get("http://localhost:3000/promotions/my-grants", () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "grant-1",
                            percentOff: 10,
                            validUntil: "2026-12-31T00:00:00.000Z",
                            campaign: { id: "camp-1", name: "Indique um amigo" },
                        },
                    ],
                })
            )
        );

        const result = await listMyGrants();
        expect(result).toHaveLength(1);
        expect(result[0].percentOff).toBe(10);
    });
});
