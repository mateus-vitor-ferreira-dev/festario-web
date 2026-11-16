/**
 * @module contexts/AuthContext
 * @description Contexto de autenticação global. Provê dados do usuário, token
 * e helpers para login, logout e atualização de perfil sem acesso direto ao
 * armazenamento da sessão nas páginas consumidoras.
 */
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { readSession, writeSession, clearSession, subscribeSession, SESSION_HINT_KEY, hasSessionHint } from "../config/authStorage";
import { clearTenant, readTenant, writeTenant } from "../config/tenantStorage";
import { revokeStoredRefreshToken } from "../services/revokeSession";
import { canRestoreSession, refreshSession } from "../services/session";
import { setUserContext } from "../config/sentry";
import type { AuthContextValue, AuthSession, TenantRef, User, UserRole } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeSession(data: unknown): AuthSession {
    if (!data || typeof data !== "object") throw new Error("Invalid session data");
    const d = data as Record<string, unknown>;
    // Fora das prévias a resposta não traz o refresh token: ele veio no cookie HttpOnly.
    const refreshToken = typeof d.refreshToken === "string" ? d.refreshToken : null;
    if (typeof d.user === "object" && d.user !== null) {
        return { user: d.user as User, token: d.token as string, refreshToken };
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
        refreshToken,
    };
}

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provedor de autenticação — deve envolver toda a aplicação (abaixo de `ThemeProvider`).
 * A sessão não fica guardada no navegador: na montagem, se houve login antes, pede um access token
 * novo ao `/auth/refresh` (o cookie HttpOnly leva o refresh token) e, enquanto isso,
 * `isRestoring` segura as rotas protegidas.
 *
 * @component
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<AuthSession | null>(readSession);
    const [isRestoring, setIsRestoring] = useState<boolean>(canRestoreSession);
    const [tenant, setTenantState] = useState<TenantRef | null>(readTenant);

    const user = session?.user ?? null;
    const token = session?.token ?? null;
    const isAuthenticated = !!session;

    // O interceptor do axios renova o token fora do React: o contexto acompanha o módulo da sessão.
    useEffect(() => subscribeSession(setSession), []);

    // Sair numa aba apaga o marcador de login (e o cookie, na API): as outras abas saem junto em vez de
    // seguir com um access token em memória até ele vencer.
    useEffect(() => {
        function onStorage(event: StorageEvent) {
            const hintGone = event.key === SESSION_HINT_KEY ? event.newValue === null : event.key === null && !hasSessionHint();
            if (hintGone && readSession()) clearSession();
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (!isRestoring) return;
        let active = true;
        refreshSession().finally(() => {
            if (active) setIsRestoring(false);
        });
        return () => {
            active = false;
        };
    // intencional: só na montagem; o refreshSession divide a chamada se o StrictMode montar duas vezes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    }

    function updateUser(updated: Partial<User>) {
        const stored = readSession();
        if (!stored) return;
        writeSession({ ...stored, user: { ...stored.user, ...updated } });
    }

    const value: AuthContextValue = { user, token, isAuthenticated, isRestoring, tenant, login, setTenant, logout, updateUser };

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
