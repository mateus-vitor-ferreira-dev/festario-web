/**
 * @module contexts/AuthContext
 * @description Contexto de autenticação global. Provê dados do usuário, token
 * e helpers para login, logout e atualização de perfil sem acesso direto ao
 * localStorage nas páginas consumidoras.
 */
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { env } from "../config/env";
import { readSession, writeSession, clearSession } from "../config/authStorage";
import { setUserContext } from "../config/sentry";
import type { AuthContextValue, AuthSession, User, UserRole } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeSession(data: unknown): AuthSession {
    if (!data || typeof data !== "object") throw new Error("Invalid session data");
    const d = data as Record<string, unknown>;
    if (typeof d.user === "object" && d.user !== null) {
        return {
            user: d.user as User,
            token: d.token as string,
            refreshToken: (d.refreshToken ?? null) as string | null,
        };
    }
    // Resposta da API em formato plano (legado)
    return {
        user: {
            id: d.id as string,
            name: d.name as string,
            email: d.email as string,
            role: d.role as UserRole,
            emailVerified: (d.emailVerified as boolean | undefined) ?? true,
        },
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
    const [session, setSession] = useState<AuthSession | null>(readSession);

    const user = session?.user ?? null;
    const token = session?.token ?? null;
    const isAuthenticated = !!session;

    useEffect(() => {
        setUserContext(user);
    // intencional: reidentifica no Sentry só quando o usuário muda, não a cada novo objeto de sessão
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    function login(data: unknown) {
        const normalized = normalizeSession(data);
        writeSession(normalized);
        setSession(normalized);
    }

    function logout() {
        const stored = readSession();
        if (stored?.refreshToken) {
            // Fire-and-forget: revoke on backend; local logout happens regardless
            fetch(`${env.apiUrl}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: stored.refreshToken }),
            }).catch(() => {});
        }
        clearSession();
        setSession(null);
    }

    function updateUser(updated: Partial<User>) {
        const stored = readSession();
        if (!stored) return;
        const updated_ = { ...stored, user: { ...stored.user, ...updated } };
        writeSession(updated_);
        setSession(updated_);
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
