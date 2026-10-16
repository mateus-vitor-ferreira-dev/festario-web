/**
 * @module routes/PrivateRoute
 * @description Guard de rota que exige autenticação.
 * Redireciona para `/login` se o usuário não estiver autenticado, com `?voltar=` para retomar a página.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { withReturn } from "../utils/returnPath";

/**
 * Rota protegida — exige que o usuário esteja autenticado.
 * Usa AuthContext como fonte de verdade, evitando acesso direto ao localStorage.
 *
 * @component
 */
export function PrivateRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={withReturn("/login", location.pathname + location.search)} replace />;
    }

    return <Outlet />;
}