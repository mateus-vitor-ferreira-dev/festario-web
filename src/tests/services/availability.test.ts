import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { getBlockedDates, getOccupiedDates } from "../../services/availability";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("availability service", () => {
    it("getBlockedDates returns array from /blocked-dates", async () => {
        const mockData = [
            { startDate: "2026-05-01T00:00:00.000Z", endDate: "2026-05-03T23:59:59.000Z", reason: "Manutenção" },
        ];
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({ success: true, data: mockData })
            )
        );

        const result = await getBlockedDates("venue-1");
        expect(result).toEqual(mockData);
    });

    it("getBlockedDates returns empty array when data is null", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({ success: true, data: null })
            )
        );

        const result = await getBlockedDates("venue-1");
        expect(result).toEqual([]);
    });

    it("getOccupiedDates returns array from /reservations/occupied-dates", async () => {
        const mockData = [
            { startDate: "2026-06-10T10:00:00.000Z", endDate: "2026-06-10T22:00:00.000Z" },
        ];
        server.use(
            http.get(`${BASE}/reservations/occupied-dates`, () =>
                HttpResponse.json({ success: true, data: mockData })
            )
        );

        const result = await getOccupiedDates("venue-1");
        expect(result).toEqual(mockData);
    });

    it("getOccupiedDates returns empty array when data is null", async () => {
        server.use(
            http.get(`${BASE}/reservations/occupied-dates`, () =>
                HttpResponse.json({ success: true, data: null })
            )
        );

        const result = await getOccupiedDates("venue-1");
        expect(result).toEqual([]);
    });

    it("getBlockedDates passes venueId as query param", async () => {
        let capturedUrl;
        server.use(
            http.get(`${BASE}/blocked-dates`, ({ request }) => {
                capturedUrl = request.url;
                return HttpResponse.json({ success: true, data: [] });
            })
        );

        await getBlockedDates("venue-xyz");
        expect(capturedUrl).toContain("venueId=venue-xyz");
    });

    it("getOccupiedDates passes venueId as query param", async () => {
        let capturedUrl;
        server.use(
            http.get(`${BASE}/reservations/occupied-dates`, ({ request }) => {
                capturedUrl = request.url;
                return HttpResponse.json({ success: true, data: [] });
            })
        );

        await getOccupiedDates("venue-xyz");
        expect(capturedUrl).toContain("venueId=venue-xyz");
    });
});
