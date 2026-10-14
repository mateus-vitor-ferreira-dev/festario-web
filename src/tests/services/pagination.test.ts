import { describe, expect, it } from "vitest";
import { cleanParams, normalizeText, toPaginated } from "../../services/pagination";

describe("toPaginated", () => {
    it("reads the contract shape `{ data, pagination }`", () => {
        const r = toPaginated({ data: [1, 2], pagination: { page: 2, limit: 2, total: 5, totalPages: 3 } }, { page: 2, limit: 2 });
        expect(r.data).toEqual([1, 2]);
        expect(r.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3, hasNext: true });
    });

    it("computes totalPages from total when missing", () => {
        const r = toPaginated({ data: [1], meta: { page: "3", limit: "2", total: "5" } });
        expect(r.meta).toMatchObject({ page: 3, limit: 2, total: 5, totalPages: 3, hasNext: false });
    });

    it("tolerates the old admin shape without total", () => {
        const full = toPaginated({ data: { page: 1, limit: 2, data: ["a", "b"] } });
        expect(full.data).toEqual(["a", "b"]);
        expect(full.meta.total).toBeUndefined();
        expect(full.meta.hasNext).toBe(true);

        const last = toPaginated({ data: { page: 3, limit: 2, data: ["e"] } });
        expect(last.meta).toMatchObject({ total: 5, totalPages: 3, hasNext: false });
    });

    it("paginates on the client when the API ignored page/limit", () => {
        const all = Array.from({ length: 25 }, (_, i) => i);
        const r = toPaginated({ data: all }, { page: 2, limit: 10 });
        expect(r.data).toEqual(all.slice(10, 20));
        expect(r.meta).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3, hasNext: true });
    });

    it("returns an empty page for unexpected payloads", () => {
        expect(toPaginated(null)).toEqual({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false } });
    });
});

describe("cleanParams / normalizeText", () => {
    it("drops empty params", () => {
        expect(cleanParams({ a: "", b: undefined, c: null, d: 0, e: "x" })).toEqual({ d: 0, e: "x" });
    });

    it("normalizes accents and case", () => {
        expect(normalizeText("  João ÁVILA ")).toBe("joao avila");
    });
});
