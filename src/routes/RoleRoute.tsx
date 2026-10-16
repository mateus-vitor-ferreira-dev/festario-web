/**
 * @module routes/RoleRoute
 * @description Guard de rota por papel. Substitui o antigo `AdminRoute`.
 *
 * - USER em `/painel` ou `/plataforma` → `/home`;
 * - OWNER em `/plataforma` → `/painel`;
 * - sem sessão → `/login` (normalmente o `PrivateRoute` já cuidou disso).
 */
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { homePathFor } from "../utils/roles";
import type { UserRole } from "../types";

interface RoleRouteProps {
    roles: readonly UserRole[];
}

function DeniedRedirect({ to }: { to: string }) {
    useEffect(() => {
        toast.info("Essa área é de outro perfil de acesso. Levamos você para a sua.", { toastId: "role-denied" });
    }, []);
    return <Navigate to={to} replace />;
}

/**
 * Rota protegida — libera só os papéis em `roles`. Deve ficar dentro do `PrivateRoute`.
 *
 * @component
 * @example <Route element={<RoleRoute roles={["OWNER", "ADMIN"]} />}>…</Route>
 */
export function RoleRoute({ roles }: RoleRouteProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const role = user?.role;
    if (!role || !roles.includes(role)) {
        return <DeniedRedirect to={homePathFor(role)} />;
    }

    return <Outlet />;
}
