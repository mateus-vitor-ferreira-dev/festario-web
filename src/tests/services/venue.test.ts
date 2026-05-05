import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getVenue, listVenues } from "../../services/venue";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("venueService", () => {
    it("listVenues returns array of venues", async () => {
        const result = await listVenues();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Salão Principal");
    });

    it("listVenues returns empty array when data is null", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: null })
            )
        );
        const result = await listVenues();
        expect(result).toEqual([]);
    });

    it("getVenue returns a single venue", async () => {
        server.use(
            http.get(`${BASE}/venues/venue-1`, () =>
                HttpResponse.json({ success: true, data: { id: "venue-1", name: "Salão Principal" } })
            )
        );
        const result = await getVenue("venue-1");
        expect(result.id).toBe("venue-1");
    });
});
