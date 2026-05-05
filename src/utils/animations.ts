/**
 * @module utils/animations
 * @description Helpers GSAP para animações de entrada. Todos os efeitos partem de
 * `opacity: 0, y: 30` e terminam em `opacity: 1, y: 0` com easing `power2.out`.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FROM = { opacity: 0, y: 30 };
const TO = { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", clearProps: "all" };

/** Preset de fade-up para uso direto em `gsap.to()` / `gsap.fromTo()`. */
export const FADE_UP = { opacity: 0, y: 30, duration: 0.7, ease: "power2.out" };

/**
 * Anima um elemento com fade-in de baixo para cima.
 *
 * @param {gsap.TweenTarget} targets - Elemento(s) ou seletor CSS a animar
 * @param {gsap.TweenVars} [overrides={}] - Propriedades GSAP que sobrescrevem os defaults
 * @returns {gsap.core.Tween}
 */
export function animateFadeInUp(targets: gsap.TweenTarget, overrides: gsap.TweenVars = {}) {
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
    return gsap.fromTo(targets, FROM, { ...TO, stagger: 0.1, ...overrides });
}
