/**
 * @module routes/AdminRoute
 * @description Guard de rota que exige `role === "ADMIN"`.
 * Redireciona para `/home` quando o usuário não tem permissão de administrador.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Rota protegida — exige `role === "ADMIN"`.
 * Deve ser aninhada dentro de `PrivateRoute` para garantir que o usuário
 * também esteja autenticado.
 *
 * @component
 */
export function AdminRoute() {
    const { user } = useAuth();

    if (user?.role !== "ADMIN") {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}
