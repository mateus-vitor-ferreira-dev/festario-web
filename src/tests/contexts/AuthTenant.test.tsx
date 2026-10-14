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
        expect(JSON.parse(localStorage.getItem("recanto:tenant")!)).toEqual({ slug: "salao-x", name: "Salão X" });
        act(() => result.current.setTenant(null));
        expect(result.current.tenant).toBeNull();
        expect(localStorage.getItem("recanto:tenant")).toBeNull();
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
});
