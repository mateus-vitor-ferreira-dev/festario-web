import { describe, expect, it } from "vitest";
import { isAbortError, getHttpStatus } from "../../utils/errors";

// ─── isAbortError ─────────────────────────────────────────────────────────────

describe("isAbortError", () => {
    it("returns true for AbortError", () => {
        const e = new Error("aborted");
        e.name = "AbortError";
        expect(isAbortError(e)).toBe(true);
    });

    it("returns true for CanceledError (axios)", () => {
        const e = new Error("canceled");
        e.name = "CanceledError";
        expect(isAbortError(e)).toBe(true);
    });

    it("returns false for a generic Error", () => {
        expect(isAbortError(new Error("network failure"))).toBe(false);
    });

    it("returns false for a plain object", () => {
        expect(isAbortError({ name: "AbortError" })).toBe(false);
    });

    it("returns false for null", () => {
        expect(isAbortError(null)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isAbortError(undefined)).toBe(false);
    });
});

// ─── getHttpStatus ────────────────────────────────────────────────────────────

describe("getHttpStatus", () => {
    it("extracts status from axios-shaped error", () => {
        const e = { response: { status: 404 } };
        expect(getHttpStatus(e)).toBe(404);
    });

    it("returns undefined when response is absent", () => {
        expect(getHttpStatus(new Error("network"))).toBeUndefined();
    });

    it("returns undefined when status is not a number", () => {
        expect(getHttpStatus({ response: { status: "404" } })).toBeUndefined();
    });

    it("returns undefined for null", () => {
        expect(getHttpStatus(null)).toBeUndefined();
    });

    it("returns undefined for a plain string", () => {
        expect(getHttpStatus("error")).toBeUndefined();
    });
});
