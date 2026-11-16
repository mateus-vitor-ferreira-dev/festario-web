/**
 * @module contexts/AuthContext
 * @description Contexto de autenticação global. Provê dados do usuário, token
 * e helpers para login, logout e atualização de perfil sem acesso direto ao
 * localStorage nas páginas consumidoras.
 */
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { readSession, writeSession, clearSession } from "../config/authStorage";
import { clearTenant, readTenant, writeTenant } from "../config/tenantStorage";
import { revokeStoredRefreshToken } from "../services/revokeSession";
import { setUserContext } from "../config/sentry";
import type { AuthContextValue, AuthSession, TenantRef, User, UserRole } from "../types";

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
    const [tenant, setTenantState] = useState<TenantRef | null>(readTenant);

    const user = session?.user ?? null;
    const token = session?.token ?? null;
    const isAuthenticated = !!session;

    useEffect(() => {
        setUserContext(user);
    // intencional: reidentifica no Sentry só quando o usuário muda, não a cada novo objeto de sessão
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    function setTenant(next: TenantRef | null) {
        if (next) writeTenant(next);
        else clearTenant();
        setTenantState(next ? { slug: next.slug, name: next.name ?? null } : null);
    }

    function login(data: unknown, nextTenant?: TenantRef | null) {
        const normalized = normalizeSession(data);
        if (nextTenant !== undefined) setTenant(nextTenant);
        writeSession(normalized);
        setSession(normalized);
    }

    function logout() {
        const stored = readSession();
        // Revoga antes de trocar o espaço: o logout precisa ir com o X-Tenant-Slug da sessão.
        revokeStoredRefreshToken();
        // Só o dono precisa do espaço guardado depois de sair: o login dele num salão que não é o
        // padrão depende do X-Tenant-Slug (veio do convite ou de /login?espaco=). Para o cliente e
        // para o ADMIN o espaço era só o que estavam vendo; deixá-lo para trás faria o próximo
        // login no mesmo navegador cair num salão escolhido por outra pessoa ou por um link.
        if (stored?.user?.role !== "OWNER") setTenant(null);
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

    const value: AuthContextValue = { user, token, isAuthenticated, tenant, login, setTenant, logout, updateUser };

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
