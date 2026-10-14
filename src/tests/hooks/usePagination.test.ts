import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { usePagination } from "../../hooks/usePagination";
import type { PaginatedResult } from "../../types";

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

const toastError = vi.mocked(toast.error);

function makeResponse<T>(data: T[], page = 1, limit = 10): PaginatedResult<T> {
    return { data, meta: { page, limit, total: data.length } };
}

afterEach(() => vi.clearAllMocks());

// ─── initial load ─────────────────────────────────────────────────────────────

describe("usePagination — initial load", () => {
    it("loads page 1 with default limit on mount", async () => {
        const fetchFn = vi.fn(async () => makeResponse(["a", "b"]));
        const { result } = renderHook(() => usePagination(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["a", "b"]);
        expect(result.current.page).toBe(1);
        expect(fetchFn).toHaveBeenCalledWith(
            expect.any(AbortSignal),
            { page: 1, limit: 10 }
        );
    });

    it("respects custom limit option", async () => {
        const fetchFn = vi.fn(async () => makeResponse([]));
        renderHook(() => usePagination(fetchFn, { limit: 5 }));
        await waitFor(() =>
            expect(fetchFn).toHaveBeenCalledWith(expect.any(AbortSignal), { page: 1, limit: 5 })
        );
    });

    it("populates meta after successful load", async () => {
        const fetchFn = vi.fn(async () => makeResponse(["x"], 1, 10));
        const { result } = renderHook(() => usePagination(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.meta).toMatchObject({ page: 1, total: 1 });
    });
});

// ─── pagination ───────────────────────────────────────────────────────────────

describe("usePagination — page changes", () => {
    it("re-fetches when setPage is called", async () => {
        const fetchFn = vi.fn()
            .mockResolvedValueOnce(makeResponse(["p1"], 1))
            .mockResolvedValueOnce(makeResponse(["p2"], 2));

        const { result } = renderHook(() => usePagination(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["p1"]);

        act(() => result.current.setPage(2));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["p2"]);
        expect(result.current.page).toBe(2);
    });

    it("aborts the previous request when page changes", async () => {
        const signals: (AbortSignal | undefined)[] = [];
        const fetchFn = vi.fn(async (signal?: AbortSignal) => {
            signals.push(signal);
            await new Promise((r) => setTimeout(r, 30));
            return makeResponse([]);
        });

        const { result } = renderHook(() => usePagination(fetchFn));
        act(() => result.current.setPage(2));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(signals[0]?.aborted).toBe(true);
    });
});

// ─── error handling ───────────────────────────────────────────────────────────

describe("usePagination — error handling", () => {
    it("shows toast on fetch error", async () => {
        const fetchFn = vi.fn(async () => { throw new Error("fail"); });
        const { result } = renderHook(() =>
            usePagination(fetchFn, { errorMessage: "Erro ao carregar." })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(toastError).toHaveBeenCalled();
    });

    it("swallows AbortError silently", async () => {
        let capturedSignal: AbortSignal | undefined;
        const fetchFn = vi.fn(async (signal?: AbortSignal) => {
            capturedSignal = signal;
            await new Promise<never>((_, reject) =>
                signal?.addEventListener("abort", () =>
                    reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
                )
            );
            return makeResponse([]);
        });

        const { unmount } = renderHook(() => usePagination(fetchFn));
        unmount();
        await new Promise((r) => setTimeout(r, 20));

        expect(capturedSignal?.aborted).toBe(true);
        expect(toastError).not.toHaveBeenCalled();
    });

    it("keeps existing data visible when refresh fails", async () => {
        let call = 0;
        const fetchFn = vi.fn(async () => {
            call++;
            if (call === 1) return makeResponse(["existing"]);
            throw new Error("refresh failed");
        });

        const { result } = renderHook(() => usePagination(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["existing"]);

        await act(() => result.current.refresh());
        expect(result.current.data).toEqual(["existing"]);
    });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe("usePagination — refresh", () => {
    it("re-fetches current page and updates data", async () => {
        let call = 0;
        const fetchFn = vi.fn(async () => {
            call++;
            return makeResponse([`call-${call}`]);
        });

        const { result } = renderHook(() => usePagination(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["call-1"]);

        await act(() => result.current.refresh());
        expect(result.current.data).toEqual(["call-2"]);
    });
});
