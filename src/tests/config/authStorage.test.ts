import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config/refreshMode", () => ({ isBodyRefreshMode: vi.fn(() => false) }));

import {
    clearSession,
    hasSessionHint,
    PREVIEW_REFRESH_KEY,
    readPreviewRefreshToken,
    readSession,
    SESSION_HINT_KEY,
    STORAGE_KEY,
    subscribeSession,
    takeLegacyRefreshToken,
    updateSessionTokens,
    writeSession,
} from "../../config/authStorage";
import { isBodyRefreshMode } from "../../config/refreshMode";

const user = { id: "u1", name: "Mateus", email: "m@m.com", role: "USER" as const, emailVerified: true };

describe("authStorage", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(isBodyRefreshMode).mockReturnValue(false);
    });

    afterEach(() => vi.mocked(isBodyRefreshMode).mockReturnValue(false));

    it("keeps the session in memory only, with just a secret-free marker in localStorage", () => {
        writeSession({ user, token: "access", refreshToken: "refresh" });

        expect(readSession()).toEqual({ user, token: "access" });
        expect(localStorage.getItem(SESSION_HINT_KEY)).toBe("1");
        expect(hasSessionHint()).toBe(true);
        expect(JSON.stringify({ ...localStorage })).not.toMatch(/access|refresh"/);
        // Fora das prévias o refresh token é do cookie HttpOnly: o front não o guarda em lugar nenhum.
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBeNull();
        expect(readPreviewRefreshToken()).toBeNull();
    });

    it("keeps the refresh token in sessionStorage on previews", () => {
        vi.mocked(isBodyRefreshMode).mockReturnValue(true);

        writeSession({ user, token: "access", refreshToken: "rt-preview" });

        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBe("rt-preview");
        expect(readPreviewRefreshToken()).toBe("rt-preview");
        expect(localStorage.getItem(PREVIEW_REFRESH_KEY)).toBeNull();
    });

    it("updateSessionTokens swaps the access token and, on previews, the refresh token", () => {
        updateSessionTokens("ignored");
        expect(readSession()).toBeNull();

        writeSession({ user, token: "old" });
        updateSessionTokens("new", "rt-ignorado");
        expect(readSession()).toEqual({ user, token: "new" });
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBeNull();

        vi.mocked(isBodyRefreshMode).mockReturnValue(true);
        updateSessionTokens("newer", "rt-novo");
        expect(readSession()?.token).toBe("newer");
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBe("rt-novo");
    });

    it("clearSession wipes memory, marker, preview token and any legacy session", () => {
        writeSession({ user, token: "t" });
        sessionStorage.setItem(PREVIEW_REFRESH_KEY, "rt");
        localStorage.setItem(STORAGE_KEY, "{}");

        clearSession();

        expect(readSession()).toBeNull();
        expect(hasSessionHint()).toBe(false);
        expect(sessionStorage.getItem(PREVIEW_REFRESH_KEY)).toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("notifies subscribers until they unsubscribe", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSession(listener);

        writeSession({ user, token: "t" });
        expect(listener).toHaveBeenLastCalledWith({ user, token: "t" });
        clearSession();
        expect(listener).toHaveBeenLastCalledWith(null);

        unsubscribe();
        writeSession({ user, token: "t2" });
        expect(listener).toHaveBeenCalledTimes(2);
    });

    describe("takeLegacyRefreshToken", () => {
        it("returns the refresh token of the nested format once and deletes the old session", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token: "a", refreshToken: "legado" }));

            expect(takeLegacyRefreshToken()).toBe("legado");
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
            expect(takeLegacyRefreshToken()).toBeNull();
        });

        it("reads the flat format too", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, token: "a", refreshToken: "plano" }));
            expect(takeLegacyRefreshToken()).toBe("plano");
        });

        it.each([
            ["invalid JSON", "{oops"],
            ["not an object", "42"],
            ["no refresh token", JSON.stringify({ user, token: "a", refreshToken: null })],
            ["empty refresh token", JSON.stringify({ user, token: "a", refreshToken: "" })],
        ])("deletes the old session and returns null on %s", (_case, raw) => {
            localStorage.setItem(STORAGE_KEY, raw);
            expect(takeLegacyRefreshToken()).toBeNull();
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });
    });
});
