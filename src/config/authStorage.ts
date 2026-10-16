import type { AuthSession, UserRole } from "../types";

export const STORAGE_KEY = "festario:userData";

// Formato legado: campos do usuário na raiz do objeto (antes da normalização)
interface LegacySession {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified?: boolean;
    token: string;
    refreshToken?: string | null;
}

function isAuthSession(data: unknown): data is AuthSession {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    return typeof d.token === "string" && typeof d.user === "object" && d.user !== null;
}

function isLegacySession(data: unknown): data is LegacySession {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    return typeof d.token === "string" && typeof d.id === "string" && typeof d.email === "string";
}

export function readSession(): AuthSession | null {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (isAuthSession(raw)) return raw;
        if (isLegacySession(raw)) {
            const migrated: AuthSession = {
                user: {
                    id: raw.id,
                    name: raw.name,
                    email: raw.email,
                    role: raw.role,
                    emailVerified: raw.emailVerified ?? true,
                },
                token: raw.token,
                refreshToken: raw.refreshToken ?? null,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }
        return null;
    } catch {
        return null;
    }
}

export function writeSession(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function updateSessionTokens(accessToken: string, refreshToken: string | null): void {
    const session = readSession();
    if (!session) return;
    writeSession({ ...session, token: accessToken, refreshToken });
}
