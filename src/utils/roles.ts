/**
 * @module utils/roles
 * @description Regras de papel usadas pelas rotas, pelo header e pela Home.
 *
 * - `USER`: cliente — reservas, negociações, promoções.
 * - `OWNER`: dono do espaço — também o painel do próprio espaço (`/painel`).
 * - `ADMIN`: equipe da plataforma — a plataforma (`/plataforma`) e o painel de qualquer espaço.
 */
import type { UserRole } from "../types";

export const PANEL_PATH = "/painel";
export const PLATFORM_PATH = "/plataforma";

/** Quem administra um espaço (painel, negociações como equipe, feriados em leitura). */
export const MANAGER_ROLES: readonly UserRole[] = ["OWNER", "ADMIN"];

export const ROLE_LABELS: Record<UserRole, string> = {
    USER: "Cliente",
    OWNER: "Dono do espaço",
    ADMIN: "Equipe da plataforma",
};

export function isManagerRole(role: string | null | undefined): boolean {
    return role === "OWNER" || role === "ADMIN";
}

export function isPlatformAdmin(role: string | null | undefined): boolean {
    return role === "ADMIN";
}

/** Para onde levar cada papel depois de entrar (e quando cai numa área que não é dele). */
export function homePathFor(role: string | null | undefined): string {
    if (role === "ADMIN") return PLATFORM_PATH;
    if (role === "OWNER") return PANEL_PATH;
    return "/home";
}
