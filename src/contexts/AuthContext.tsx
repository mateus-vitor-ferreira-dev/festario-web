/**
 * @module contexts/AuthContext
 * @description Contexto de autenticação global. Provê dados do usuário, token
 * e helpers para login, logout e atualização de perfil sem acesso direto ao
 * localStorage nas páginas consumidoras.
 */
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { setUserContext } from "../config/sentry";
import type { AuthContextValue, AuthSession, User } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "recanto:userData";

function readStorage(): AuthSession | null {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
        return null;
    }
}

function normalizeUser(session: AuthSession | null): User | null {
    if (!session) return null;
    const raw = session as unknown as Record<string, Record<string, string> & { emailVerified?: boolean }>;
    return {
        id: session.user?.id ?? raw.id as unknown as string,
        name: session.user?.name ?? raw.name as unknown as string,
        email: session.user?.email ?? raw.email as unknown as string,
        role: (session.user?.role ?? raw.role) as User["role"],
        emailVerified: session.user?.emailVerified ?? true,
    };
}

function normalizeSession(data: unknown): AuthSession {
    const d = data as Record<string, unknown>;
    return {
        user: (d.user ?? d) as User,
        token: d.token as string,
        refreshToken: (d.refreshToken ?? null) as string | null,
    };
}

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provedor de autenticação — deve envolver toda a aplicação (abaixo de `ThemeProvider`).
 * Inicializa o estado a partir do `localStorage` na montagem.
 *
 * @component
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<AuthSession | null>(readStorage);

    const user = normalizeUser(session);
    const token = session?.token ?? null;
    const isAuthenticated = !!session;

    useEffect(() => {
        setUserContext(user);
    }, [user?.id]);

    function login(data: unknown) {
        const normalized = normalizeSession(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        setSession(normalized);
    }

    function logout() {
        const stored = readStorage();
        if (stored?.refreshToken) {
            // Fire-and-forget: revoke on backend; local logout happens regardless
            fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: stored.refreshToken }),
            }).catch(() => {});
        }
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
    }

    function updateUser(updated: Partial<User>) {
        const stored = readStorage();
        if (!stored) return;
        stored.user = { ...(stored.user ?? stored as unknown as User), ...updated };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        setSession({ ...stored });
    }

    const value: AuthContextValue = { user, token, isAuthenticated, login, logout, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook de acesso ao contexto de autenticação.
 * @returns {AuthContextValue}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
