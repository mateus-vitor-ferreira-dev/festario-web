import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../services/api";

describe("api interceptor", () => {
    const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;
    const responseRejected = api.interceptors.response.handlers[0].rejected;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("attaches Authorization header when token exists", async () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ token: "abc123" })
        );

        const config = { headers: {} };
        const result = await requestFulfilled(config);

        expect(result.headers.Authorization).toBe("Bearer abc123");
    });

    it("does not attach Authorization header when token does not exist", async () => {
        const config = { headers: {} };
        const result = await requestFulfilled(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it("does not attach Authorization header when stored JSON is empty", async () => {
        localStorage.setItem("recanto:userData", "{}");

        const config = { headers: {} };
        const result = await requestFulfilled(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it("rejects immediately on 429", async () => {
        const error = {
            response: { status: 429 },
            config: { method: "get", url: "/venues" },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects aborted requests", async () => {
        const error = {
            name: "CanceledError",
            response: { status: 500 },
            config: {
                method: "get",
                url: "/venues",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects AbortError requests", async () => {
        const error = {
            name: "AbortError",
            response: { status: 500 },
            config: {
                method: "get",
                url: "/venues",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects auth endpoint errors without retry", async () => {
        const error = {
            response: { status: 500 },
            config: {
                method: "get",
                url: "/auth/login",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects non-GET 5xx errors without retry", async () => {
        const error = {
            response: { status: 500 },
            config: {
                method: "post",
                url: "/reservations",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects 4xx GET errors without retry", async () => {
        const error = {
            response: { status: 400 },
            config: {
                method: "get",
                url: "/venues",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects when status is undefined", async () => {
        const error = {
            config: {
                method: "get",
                url: "/venues",
            },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });

    it("rejects when config is missing", async () => {
        const error = {
            response: { status: 500 },
        };

        await expect(responseRejected(error)).rejects.toBe(error);
    });
});