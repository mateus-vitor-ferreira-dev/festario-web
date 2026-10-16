import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toastError = vi.fn();
vi.mock("react-toastify", () => ({ toast: { error: (...args: unknown[]) => toastError(...args), success: vi.fn(), info: vi.fn() } }));

import api from "../../services/api";
import { readTenant, tenantHeaders, writeTenant, clearTenant, isValidTenantSlug } from "../../config/tenantStorage";
import { getErrorMessage } from "../../utils/getErrorMessage";

const SESSION = JSON.stringify({ user: { id: "u1", name: "Dona", email: "d@d.com", role: "OWNER" }, token: "tok", refreshToken: null });

describe("X-Tenant-Slug", () => {
    const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;

    beforeEach(() => localStorage.clear());

    it("is sent when a tenant is stored", async () => {
        writeTenant({ slug: "salao-jardim-das-flores", name: "Jardim" });
        const result = await requestFulfilled({ headers: {} });
        expect(result.headers["X-Tenant-Slug"]).toBe("salao-jardim-das-flores");
    });

    it("is not sent on the default tenant (nothing stored)", async () => {
        const result = await requestFulfilled({ headers: {} });
        expect(result.headers["X-Tenant-Slug"]).toBeUndefined();
    });

    it("ignores an invalid stored slug", async () => {
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "Não Vale!" }));
        const result = await requestFulfilled({ headers: {} });
        expect(result.headers["X-Tenant-Slug"]).toBeUndefined();
        expect(readTenant()).toBeNull();
    });

    it("reaches the network through the axios instance", async () => {
        writeTenant({ slug: "salao-jardim-das-flores" });
        const { http, HttpResponse } = await import("msw");
        const { server } = await import("../mocks/server");
        let seen: string | null = null;
        server.use(http.get("http://localhost:3000/venues", ({ request }) => {
            seen = request.headers.get("x-tenant-slug");
            return HttpResponse.json({ data: [] });
        }));
        await api.get("/venues");
        expect(seen).toBe("salao-jardim-das-flores");
    });
});

describe("tenantStorage", () => {
    beforeEach(() => localStorage.clear());

    it("round-trips and clears", () => {
        writeTenant({ slug: "abc-def", name: "ABC" });
        expect(readTenant()).toEqual({ slug: "abc-def", name: "ABC" });
        expect(tenantHeaders()).toEqual({ "X-Tenant-Slug": "abc-def" });
        clearTenant();
        expect(readTenant()).toBeNull();
        expect(tenantHeaders()).toEqual({});
    });

    it("tolerates corrupted storage", () => {
        localStorage.setItem("festario:tenant", "{oops");
        expect(readTenant()).toBeNull();
        localStorage.setItem("festario:tenant", "42");
        expect(readTenant()).toBeNull();
    });

    it("validates slugs like the API", () => {
        expect(isValidTenantSlug("salao-jardim-das-flores")).toBe(true);
        expect(isValidTenantSlug("ab")).toBe(false);
        expect(isValidTenantSlug("a--b")).toBe(false);
        expect(isValidTenantSlug("Maiusculo")).toBe(false);
    });
});

describe("403 de espaço", () => {
    const responseRejected = api.interceptors.response.handlers[0].rejected;
    const originalLocation = window.location;

    beforeEach(() => {
        localStorage.clear();
        toastError.mockClear();
        Object.defineProperty(window, "location", { value: { href: "/painel" }, writable: true, configurable: true });
    });

    afterEach(() => {
        Object.defineProperty(window, "location", { value: originalLocation, writable: true, configurable: true });
    });

    const forbidden = (code: string, url = "/admin/reservations") => ({
        response: { status: 403, data: { error: { code, message: "x" } } },
        config: { method: "get", url },
    });

    it("TENANT_ACCESS_DENIED warns, signs out and goes to /login", async () => {
        localStorage.setItem("festario:userData", SESSION);
        const error = forbidden("TENANT_ACCESS_DENIED");
        await expect(responseRejected(error)).rejects.toBe(error);
        expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/outro espaço/i), expect.objectContaining({ toastId: "tenant-access-denied" }));
        expect(localStorage.getItem("festario:userData")).toBeNull();
        expect(window.location.href).toBe("/login");
    });

    it("TENANT_ACCESS_DENIED on /platform only rejects (no sign out)", async () => {
        localStorage.setItem("festario:userData", SESSION);
        const error = forbidden("TENANT_ACCESS_DENIED", "/platform/tenants");
        await expect(responseRejected(error)).rejects.toBe(error);
        expect(toastError).not.toHaveBeenCalled();
        expect(localStorage.getItem("festario:userData")).not.toBeNull();
    });

    it("TENANT_INACTIVE warns once and keeps the session", async () => {
        localStorage.setItem("festario:userData", SESSION);
        const error = forbidden("TENANT_INACTIVE");
        await expect(responseRejected(error)).rejects.toBe(error);
        expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/desativado/i), expect.objectContaining({ toastId: "tenant-inactive" }));
        expect(localStorage.getItem("festario:userData")).not.toBeNull();
        expect(window.location.href).toBe("/painel");
    });

    it("other 403 codes are left to the screen", async () => {
        const error = forbidden("ACCESS_DENIED");
        await expect(responseRejected(error)).rejects.toBe(error);
        expect(toastError).not.toHaveBeenCalled();
    });

    it("getErrorMessage prefers the pt-BR message of known codes", () => {
        expect(getErrorMessage(forbidden("INVITE_EXPIRED"))).toMatch(/venceu/i);
        expect(getErrorMessage({ response: { data: { error: { code: "UNKNOWN", message: "Venue not found" } } } })).toBe("Salão não encontrado.");
    });
});
