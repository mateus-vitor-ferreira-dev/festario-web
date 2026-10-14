/**
 * @module styles/breakpoints
 * @description Breakpoints únicos da aplicação. Use sempre estes valores nos
 * media queries em vez de números soltos.
 *
 * - `sm`  ≤ 480px  — celulares
 * - `md`  ≤ 768px  — celulares grandes / tablets em retrato
 * - `lg`  ≤ 1024px — tablets em paisagem / notebooks pequenos
 */
export const breakpoints = {
    sm: 480,
    md: 768,
    lg: 1024,
} as const;

export const media = {
    sm: `@media (max-width: ${breakpoints.sm}px)`,
    md: `@media (max-width: ${breakpoints.md}px)`,
    lg: `@media (max-width: ${breakpoints.lg}px)`,
} as const;
