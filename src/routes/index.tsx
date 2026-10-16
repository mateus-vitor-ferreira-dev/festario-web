import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MainLayout } from "../components";
import ErrorBoundary from "../components/ErrorBoundary";
import PageLoader from "../components/PageLoader";
import ShowcaseLayout from "../components/ShowcaseLayout";
import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";

const Admin             = lazy(() => import("../pages/Admin"));
const InviteAccept      = lazy(() => import("../pages/InviteAccept"));
const Platform          = lazy(() => import("../pages/Platform"));
const TenantDetail      = lazy(() => import("../pages/Platform/TenantDetail"));
const Checkout          = lazy(() => import("../pages/Checkout"));
const ContactUs         = lazy(() => import("../pages/ContactUs"));
const ForgotPassword    = lazy(() => import("../pages/ForgotPassword"));
const Home              = lazy(() => import("../pages/Home"));
const Login             = lazy(() => import("../pages/Login"));
const NegotiationChat   = lazy(() => import("../pages/NegotiationChat"));
const Negotiations      = lazy(() => import("../pages/Negotiations"));
const NotFound          = lazy(() => import("../pages/NotFound"));
const Profile           = lazy(() => import("../pages/Profile"));
const Promotions        = lazy(() => import("../pages/Promotions"));
const Referrals         = lazy(() => import("../pages/Referrals"));
const ReservationIntent = lazy(() => import("../pages/ReservationIntent"));
const Reservations      = lazy(() => import("../pages/Reservations"));
const ResetPassword     = lazy(() => import("../pages/ResetPassword"));
const SalonPage         = lazy(() => import("../pages/SalonPage"));
const Salons            = lazy(() => import("../pages/Salons"));
const SignUp            = lazy(() => import("../pages/SignUp"));
const Venues            = lazy(() => import("../pages/Venues"));

function PageErrorFallback() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", minHeight: "60vh", gap: "12px", maxWidth: 480, margin: "0 auto", padding: "24px" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--text-primary)" }}>Esta página não carregou</h2>
            <p style={{ color: "var(--text-muted)" }}>Recarregue a página ou volte ao início. Se o problema continuar, fale com a gente em Contate-nos.</p>
            <button
                onClick={() => window.location.href = "/home"}
                style={{ marginTop: 8, minHeight: 44, padding: "0 20px", background: "var(--brand)", color: "var(--on-brand)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "var(--text-base)", cursor: "pointer" }}
            >
                Voltar ao início
            </button>
        </div>
    );
}

/** Links antigos de `/admin` (inclusive `?tab=`) continuam funcionando. */
function LegacyAdminRedirect() {
    const { search } = useLocation();
    return <Navigate to={{ pathname: "/painel", search }} replace />;
}

/**
 * Árvore de rotas da aplicação.
 *
 * Vitrine pública: `/saloes` (todos os salões) e `/s/:slug` (página de um salão, que leva à reserva).
 * Sem login, abrem com o cabeçalho de visitante (`ShowcaseLayout`); `/` leva para lá.
 *
 * Áreas por papel (ver `utils/roles`): `/painel` (OWNER e ADMIN — painel do espaço),
 * `/plataforma` (só ADMIN). `/convite/:token` é pública (aceite do convite do dono).
 *
 * Cada página é carregada sob demanda via React.lazy — o bundle inicial
 * contém apenas o shell (Auth, Layout, rotas) e cada chunk de página é
 * baixado apenas quando o usuário navega até ela.
 */
interface AppRoutesProps {
    introFinished: boolean;
}

export function AppRoutes({ introFinished }: AppRoutesProps) {
    return (
        <ErrorBoundary fallback={<PageErrorFallback />}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/saloes" replace />} />
                    <Route
                        path="/cadastro"
                        element={<SignUp introFinished={introFinished} />}
                    />
                    <Route
                        path="/login"
                        element={<Login introFinished={introFinished} />}
                    />
                    <Route path="/esqueci-senha" element={<ForgotPassword />} />
                    <Route path="/redefinir-senha" element={<ResetPassword />} />
                    <Route path="/convite/:token" element={<InviteAccept />} />

                    {/* Vitrine pública: quem não tem conta vê os salões; o login só é pedido ao reservar. */}
                    <Route element={<ShowcaseLayout />}>
                        <Route path="/saloes" element={<Salons />} />
                        <Route path="/s/:slug" element={<SalonPage />} />
                    </Route>

                    <Route element={<PrivateRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/home" element={<Home />} />
                            <Route path="/venues" element={<Venues />} />
                            <Route path="/reservations" element={<Reservations />} />
                            <Route
                                path="/reservation-intent/:venueId"
                                element={
                                    <ErrorBoundary fallback={<PageErrorFallback />}>
                                        <ReservationIntent />
                                    </ErrorBoundary>
                                }
                            />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/promocoes" element={<Promotions />} />
                            <Route path="/referrals" element={<Referrals />} />
                            <Route path="/contate-nos" element={<ContactUs />} />
                            <Route path="/negociacoes" element={<Negotiations />} />
                            <Route path="/negociacoes/:id" element={<NegotiationChat />} />
                            <Route
                                path="/checkout/:reservationId"
                                element={
                                    <ErrorBoundary fallback={<PageErrorFallback />}>
                                        <Checkout />
                                    </ErrorBoundary>
                                }
                            />
                            <Route path="/admin" element={<LegacyAdminRedirect />} />
                            <Route element={<RoleRoute roles={["OWNER", "ADMIN"]} />}>
                                <Route
                                    path="/painel"
                                    element={
                                        <ErrorBoundary fallback={<PageErrorFallback />}>
                                            <Admin />
                                        </ErrorBoundary>
                                    }
                                />
                            </Route>
                            <Route element={<RoleRoute roles={["ADMIN"]} />}>
                                <Route
                                    path="/plataforma"
                                    element={
                                        <ErrorBoundary fallback={<PageErrorFallback />}>
                                            <Platform />
                                        </ErrorBoundary>
                                    }
                                />
                                <Route
                                    path="/plataforma/espacos/:slug"
                                    element={
                                        <ErrorBoundary fallback={<PageErrorFallback />}>
                                            <TenantDetail />
                                        </ErrorBoundary>
                                    }
                                />
                            </Route>
                        </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}
