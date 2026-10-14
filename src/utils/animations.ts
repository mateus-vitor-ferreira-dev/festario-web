/**
 * @module utils/animations
 * @description Helpers GSAP para animações de entrada. Os efeitos partem de
 * `opacity: 0, y: 12` e terminam em `opacity: 1, y: 0` com easing `power3.out`.
 * Com `prefers-reduced-motion: reduce`, os elementos aparecem direto, sem tween.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FROM = { opacity: 0, y: 12 };
const TO = { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", clearProps: "all" };

/** Preset de fade-up para uso direto em `gsap.to()` / `gsap.fromTo()`. */
export const FADE_UP = { opacity: 0, y: 12, duration: 0.55, ease: "power3.out" };

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Anima um elemento com fade-in de baixo para cima.
 *
 * @param {gsap.TweenTarget} targets - Elemento(s) ou seletor CSS a animar
 * @param {gsap.TweenVars} [overrides={}] - Propriedades GSAP que sobrescrevem os defaults
 * @returns {gsap.core.Tween}
 */
export function animateFadeInUp(targets: gsap.TweenTarget, overrides: gsap.TweenVars = {}) {
    if (prefersReducedMotion()) return gsap.set(targets, { clearProps: "all" });
    return gsap.fromTo(targets, FROM, { ...TO, ...overrides });
}

/**
 * Anima uma lista de elementos com fade-in escalonado (stagger de 100 ms entre eles).
 *
 * @param {gsap.TweenTarget} targets - Elementos ou seletor CSS
 * @param {gsap.TweenVars} [overrides={}] - Propriedades GSAP que sobrescrevem os defaults
 * @returns {gsap.core.Tween}
 */
export function animateStagger(targets: gsap.TweenTarget, overrides: gsap.TweenVars = {}) {
    if (prefersReducedMotion()) return gsap.set(targets, { clearProps: "all" });
    return gsap.fromTo(targets, FROM, { ...TO, stagger: 0.06, ...overrides });
}
