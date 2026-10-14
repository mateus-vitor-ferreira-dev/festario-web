import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { useApiData } from "../../hooks/useApiData";

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

const toastError = vi.mocked(toast.error);

afterEach(() => vi.clearAllMocks());

// ─── success ─────────────────────────────────────────────────────────────────

describe("useApiData — success", () => {
    it("starts with initialData while loading", () => {
        const fetchFn = vi.fn(() => new Promise<string[]>(() => {}));
        const { result } = renderHook(() =>
            useApiData(fetchFn, { initialData: ["seed"] })
        );
        expect(result.current.data).toEqual(["seed"]);
        expect(result.current.isLoading).toBe(true);
    });

    it("sets data and clears isLoading after fetch", async () => {
        const fetchFn = vi.fn(async () => ["item-1", "item-2"]);
        const { result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["item-1", "item-2"]);
    });

    it("passes AbortSignal to fetchFn", async () => {
        const fetchFn = vi.fn(async (_signal?: AbortSignal) => []);
        renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(expect.any(AbortSignal)));
    });

    it("falls back to initialData when fetch returns null", async () => {
        const fetchFn = vi.fn(async () => null as unknown as string[]);
        const { result } = renderHook(() =>
            useApiData(fetchFn, { initialData: ["fallback"] })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["fallback"]);
    });
});

// ─── abort ────────────────────────────────────────────────────────────────────

describe("useApiData — abort", () => {
    it("aborts the signal when unmounted", async () => {
        let capturedSignal: AbortSignal | undefined;
        const fetchFn = vi.fn(async (signal?: AbortSignal) => {
            capturedSignal = signal;
            return [];
        });
        const { unmount, result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        unmount();
        expect(capturedSignal?.aborted).toBe(true);
    });

    it("does not show toast when fetch throws an AbortError", async () => {
        const fetchFn = vi.fn(async (signal?: AbortSignal) => {
            await new Promise<never>((_, reject) =>
                signal?.addEventListener("abort", () =>
                    reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
                )
            );
            return [];
        });
        const { unmount } = renderHook(() => useApiData(fetchFn));
        unmount();
        await new Promise((r) => setTimeout(r, 20));
        expect(toastError).not.toHaveBeenCalled();
    });
});

// ─── error handling ───────────────────────────────────────────────────────────

describe("useApiData — error handling", () => {
    it("shows 'Sem conexão' when there is no response property on the error", async () => {
        const fetchFn = vi.fn(async () => { throw new Error("Network Error"); });
        const { result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(toastError).toHaveBeenCalledWith(
            expect.stringMatching(/sem conex/i)
        );
    });

    it("shows 'Erro interno' for errors with response.status >= 500", async () => {
        const fetchFn = vi.fn(async () => {
            const err = Object.assign(new Error("Server Error"), { response: { status: 500 } });
            throw err;
        });
        const { result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(toastError).toHaveBeenCalledWith(
            expect.stringMatching(/erro interno/i)
        );
    });

    it("shows custom errorMessage for 4xx errors", async () => {
        const fetchFn = vi.fn(async () => {
            const err = Object.assign(new Error("Not Found"), {
                response: { status: 404, data: { message: "Recurso não encontrado." } },
                message: "Not Found",
            });
            throw err;
        });
        const { result } = renderHook(() =>
            useApiData(fetchFn, { errorMessage: "Erro ao carregar." })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(toastError).toHaveBeenCalled();
    });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe("useApiData — refresh", () => {
    it("re-fetches and updates data when refresh() is called", async () => {
        let call = 0;
        const fetchFn = vi.fn(async () => {
            call++;
            return [`call-${call}`];
        });

        const { result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(["call-1"]);

        await act(() => result.current.refresh());
        expect(result.current.data).toEqual(["call-2"]);
    });

    it("sets isLoading to true during refresh", async () => {
        let resolve: (v: string[]) => void;
        let call = 0;
        const fetchFn = vi.fn(async () => {
            call++;
            if (call === 1) return ["initial"];
            return await new Promise<string[]>((res) => { resolve = res; });
        });

        const { result } = renderHook(() => useApiData(fetchFn));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => { result.current.refresh(); });
        expect(result.current.isLoading).toBe(true);
        await act(async () => resolve(["updated"]));
        expect(result.current.isLoading).toBe(false);
    });
});
