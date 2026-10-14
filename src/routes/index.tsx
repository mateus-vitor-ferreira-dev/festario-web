import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../components";
import ErrorBoundary from "../components/ErrorBoundary";
import PageLoader from "../components/PageLoader";
import { AdminRoute } from "./AdminRoute";
import { PrivateRoute } from "./PrivateRoute";

const Admin             = lazy(() => import("../pages/Admin"));
const Checkout          = lazy(() => import("../pages/Checkout"));
const ContactUs         = lazy(() => import("../pages/ContactUs"));
const ForgotPassword    = lazy(() => import("../pages/ForgotPassword"));
const Home              = lazy(() => import("../pages/Home"));
const Login             = lazy(() => import("../pages/Login"));
const NegotiationChat   = lazy(() => import("../pages/NegotiationChat"));
const Negotiations      = lazy(() => import("../pages/Negotiations"));
const NotFound          = lazy(() => import("../pages/NotFound"));
const PaymentCancel     = lazy(() => import("../pages/PaymentCancel"));
const PaymentSuccess    = lazy(() => import("../pages/PaymentSuccess"));
const Profile           = lazy(() => import("../pages/Profile"));
const Promotions        = lazy(() => import("../pages/Promotions"));
const Referrals         = lazy(() => import("../pages/Referrals"));
const ReservationIntent = lazy(() => import("../pages/ReservationIntent"));
const Reservations      = lazy(() => import("../pages/Reservations"));
const ResetPassword     = lazy(() => import("../pages/ResetPassword"));
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

/**
 * Árvore de rotas da aplicação.
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
                    <Route path="/" element={<Navigate to="/cadastro" replace />} />
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
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/payment/cancel" element={<PaymentCancel />} />
                            <Route element={<AdminRoute />}>
                                <Route
                                    path="/admin"
                                    element={
                                        <ErrorBoundary fallback={<PageErrorFallback />}>
                                            <Admin />
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
