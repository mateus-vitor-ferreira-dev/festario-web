import { afterEach, describe, expect, it } from "vitest";
import {
    readSession,
    writeSession,
    clearSession,
    updateSessionTokens,
    STORAGE_KEY,
} from "../../config/authStorage";
import type { AuthSession } from "../../types";

const validSession: AuthSession = {
    user: { id: "u1", name: "Mateus", email: "m@test.com", role: "USER" },
    token: "tok-123",
    refreshToken: "ref-456",
};

afterEach(() => localStorage.clear());

// ─── readSession ──────────────────────────────────────────────────────────────

describe("readSession", () => {
    it("returns null when localStorage is empty", () => {
        expect(readSession()).toBeNull();
    });

    it("returns null for malformed JSON", () => {
        localStorage.setItem(STORAGE_KEY, "not-json");
        expect(readSession()).toBeNull();
    });

    it("returns null for unrecognized object shape", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));
        expect(readSession()).toBeNull();
    });

    it("returns a valid AuthSession as-is", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validSession));
        expect(readSession()).toEqual(validSession);
    });

    it("migrates a legacy flat session to AuthSession format", () => {
        const legacy = {
            id: "u1",
            name: "Mateus",
            email: "m@test.com",
            role: "USER",
            emailVerified: true,
            token: "tok-legacy",
            refreshToken: "ref-legacy",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

        const result = readSession();

        expect(result).toEqual({
            user: {
                id: "u1",
                name: "Mateus",
                email: "m@test.com",
                role: "USER",
                emailVerified: true,
            },
            token: "tok-legacy",
            refreshToken: "ref-legacy",
        });
    });

    it("persists the migrated session to localStorage", () => {
        const legacy = { id: "u1", name: "X", email: "x@x.com", role: "ADMIN", token: "t", refreshToken: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

        readSession();

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.user).toBeDefined();
        expect(stored.token).toBe("t");
    });

    it("defaults emailVerified to true when absent in legacy session", () => {
        const legacy = { id: "u1", name: "X", email: "x@x.com", role: "USER", token: "t" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

        const result = readSession();
        expect(result?.user.emailVerified).toBe(true);
    });
});

// ─── writeSession ─────────────────────────────────────────────────────────────

describe("writeSession", () => {
    it("persists the session to localStorage", () => {
        writeSession(validSession);
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(validSession);
    });

    it("overwrites an existing session", () => {
        writeSession(validSession);
        const updated = { ...validSession, token: "new-tok" };
        writeSession(updated);
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).token).toBe("new-tok");
    });
});

// ─── clearSession ─────────────────────────────────────────────────────────────

describe("clearSession", () => {
    it("removes the session from localStorage", () => {
        writeSession(validSession);
        clearSession();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("is a no-op when storage is already empty", () => {
        expect(() => clearSession()).not.toThrow();
    });
});

// ─── updateSessionTokens ──────────────────────────────────────────────────────

describe("updateSessionTokens", () => {
    it("updates token and refreshToken preserving user data", () => {
        writeSession(validSession);
        updateSessionTokens("new-access", "new-refresh");

        const result = readSession();
        expect(result?.token).toBe("new-access");
        expect(result?.refreshToken).toBe("new-refresh");
        expect(result?.user).toEqual(validSession.user);
    });

    it("accepts null as refreshToken", () => {
        writeSession(validSession);
        updateSessionTokens("new-access", null);

        expect(readSession()?.refreshToken).toBeNull();
    });

    it("is a no-op when no session exists", () => {
        expect(() => updateSessionTokens("tok", null)).not.toThrow();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});
