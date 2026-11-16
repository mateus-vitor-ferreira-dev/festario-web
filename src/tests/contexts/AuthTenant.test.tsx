import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext + espaço", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));
    });

    it("login with a tenant stores it; setTenant(null) clears it", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => result.current.login({ user: { id: "o", name: "Dona", email: "d@d.com", role: "OWNER" }, token: "t" }, { slug: "salao-x", name: "Salão X" }));
        expect(result.current.tenant).toEqual({ slug: "salao-x", name: "Salão X" });
        expect(JSON.parse(localStorage.getItem("festario:tenant")!)).toEqual({ slug: "salao-x", name: "Salão X" });
        act(() => result.current.setTenant(null));
        expect(result.current.tenant).toBeNull();
        expect(localStorage.getItem("festario:tenant")).toBeNull();
    });

    it("OWNER logout keeps the tenant for the next login; ADMIN logout drops it", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => result.current.login({ user: { id: "o", name: "Dona", email: "d@d.com", role: "OWNER" }, token: "t", refreshToken: "r" }, { slug: "salao-x" }));
        act(() => result.current.logout());
        expect(result.current.tenant?.slug).toBe("salao-x");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), expect.objectContaining({
            headers: expect.objectContaining({ "X-Tenant-Slug": "salao-x" }),
        }));

        act(() => result.current.login({ user: { id: "a", name: "Admin", email: "a@a.com", role: "ADMIN" }, token: "t" }));
        expect(result.current.tenant?.slug).toBe("salao-x");
        act(() => result.current.logout());
        expect(result.current.tenant).toBeNull();
    });

    it("USER logout drops the tenant and revokes the refresh token with the salon header", () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => result.current.login({ user: { id: "c", name: "Cliente", email: "c@c.com", role: "USER" }, token: "t", refreshToken: "r-user" }, { slug: "salao-x" }));
        act(() => result.current.logout());
        expect(result.current.tenant).toBeNull();
        expect(localStorage.getItem("festario:tenant")).toBeNull();
        expect(localStorage.getItem("festario:userData")).toBeNull();
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ refreshToken: "r-user" }),
            headers: expect.objectContaining({ "X-Tenant-Slug": "salao-x" }),
        }));
    });

    it("logout without a refresh token does not call the API", () => {
        vi.mocked(fetch).mockClear();
        const { result } = renderHook(() => useAuth(), { wrapper });
        act(() => result.current.login({ user: { id: "c", name: "Cliente", email: "c@c.com", role: "USER" }, token: "t" }));
        act(() => result.current.logout());
        expect(fetch).not.toHaveBeenCalled();
    });
});
