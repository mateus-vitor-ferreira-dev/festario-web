/**
 * @module routes/PrivateRoute
 * @description Guard de rota que exige autenticação.
 * Redireciona para `/login` se o usuário não estiver autenticado.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Rota protegida — exige que o usuário esteja autenticado.
 * Usa AuthContext como fonte de verdade, evitando acesso direto ao localStorage.
 *
 * @component
 */
export function PrivateRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}