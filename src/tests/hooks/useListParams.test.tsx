import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useListParams } from "../../hooks/useListParams";

const KEYS = ["status", "q", "sort"] as const;

function setup(initial = "/admin?tab=reservations") {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
    );
    return renderHook(() => {
        const list = useListParams(KEYS, { defaults: { sort: "startDate:desc" }, nonFilterKeys: ["sort"] });
        const location = useLocation();
        return { ...list, search: location.search };
    }, { wrapper });
}

describe("useListParams", () => {
    it("restores filters and page from the URL", () => {
        const { result } = setup("/admin?tab=reservations&status=PAID&page=3");
        expect(result.current.values).toEqual({ status: "PAID", q: "", sort: "startDate:desc" });
        expect(result.current.page).toBe(3);
        expect(result.current.activeKeys).toEqual(["status"]);
    });

    it("ignores an invalid page", () => {
        const { result } = setup("/x?page=abc");
        expect(result.current.page).toBe(1);
    });

    it("writes filters, resets the page and keeps foreign params", () => {
        const { result } = setup("/admin?tab=reservations&page=4");
        act(() => result.current.setFilter("q", "  lucas "));
        expect(result.current.search).toBe("?tab=reservations&q=lucas");
        expect(result.current.page).toBe(1);

        act(() => result.current.setFilters({ status: "PAID", sort: "startDate:desc" }));
        // valor igual ao padrão não vai para a URL e não conta como filtro
        expect(result.current.search).toBe("?tab=reservations&q=lucas&status=PAID");
        expect(result.current.activeKeys).toEqual(["status", "q"]);
    });

    it("sets and clears the page", () => {
        const { result } = setup("/x?status=PAID");
        act(() => result.current.setPage(2));
        expect(result.current.search).toBe("?status=PAID&page=2");
        act(() => result.current.setPage(1));
        expect(result.current.search).toBe("?status=PAID");
    });

    it("clears filters but keeps sort and other params", () => {
        const { result } = setup("/admin?tab=reservations&status=PAID&q=ana&sort=totalPrice:asc&page=2");
        act(() => result.current.clearFilters());
        expect(result.current.search).toBe("?tab=reservations&sort=totalPrice%3Aasc");
        expect(result.current.activeKeys).toEqual([]);
    });
});
