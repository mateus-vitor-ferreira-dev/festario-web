import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";
import { lastLoginConfig } from "./mocks/react-oauth-google";

window.google = {
    accounts: {
        id: {
            initialize: vi.fn(({ callback }) => {
                lastLoginConfig.onSuccess = callback;
                lastLoginConfig.onError = () => callback({ credential: null });
            }),
            renderButton: vi.fn(),
        },
    },
};

vi.mock("gsap", () => {
    const noop = () => ({ kill: () => {} });
    const gsap = {
        fromTo: (_targets, _from, to) => {
            const els =
                typeof _targets === "string"
                    ? document.querySelectorAll(_targets)
                    : Array.isArray(_targets)
                      ? _targets
                      : [_targets];
            els?.forEach?.((el) => {
                if (el?.style) {
                    el.style.opacity = String(to.opacity ?? 1);
                    el.style.transform = "";
                }
            });
            return { kill: () => {} };
        },
        to: noop,
        from: noop,
        set: noop,
        timeline: () => ({ fromTo: noop, to: noop, from: noop, kill: () => {} }),
        registerPlugin: () => {},
        globalTimeline: { clear: () => {} },
        ticker: { add: () => {}, remove: () => {} },
    };
    return { default: gsap, ...gsap };
});

vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { create: () => {}, refresh: () => {} } }));

vi.mock("@gsap/react", () => ({
    useGSAP: (cb) => { try { cb(); } catch { /* ignore GSAP errors in jsdom */ } },
}));

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = () => {};

// jsdom does not implement navigator.clipboard — define as writable so tests can spy on it
Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue("") },
    configurable: true,
    writable: true,
});

// jsdom does not implement matchMedia (required by GSAP/ScrollTrigger)
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
