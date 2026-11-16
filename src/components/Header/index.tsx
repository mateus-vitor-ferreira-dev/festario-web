import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../../contexts/AuthContext";
import { useSalonBrand } from "../../contexts/SalonBrandContext";
import SalonMark from "../SalonMark";
import { useTheme } from "../../contexts/ThemeContext";
import { resendVerification } from "../../services/auth";
import { animateFadeInUp } from "../../utils/animations";
import { getHttpStatus } from "../../utils/errors";
import { MY_BUSINESS_PATH, PLATFORM_PATH, SALONS_PATH, SERVICES_PATH } from "../../utils/roles";
import AccountMenu from "./AccountMenu";
import { accountItems, primaryItems } from "./navItems";
import * as S from "./styles";

function getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase();
}

function SunIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MenuIcon({ open }: { open: boolean }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
                <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                </>
            ) : (
                <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                </>
            )}
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

/**
 * Barra de navegação principal da aplicação.
 *
 * Duas camadas, para a barra não virar uma fileira de links (`navItems.ts`):
 * - navegação principal, na barra: os destinos de todo dia (cliente: Salões, Serviços, Reservas e
 *   Orçamentos; dono e equipe: Painel, Plataforma e as vitrines);
 * - menu da conta, no avatar: perfil, Meu negócio, Promoções, Negociações, Contate-nos e o Sair,
 *   separado no fim. O logo leva ao início.
 * Abaixo de 1024px a mesma `<nav>` vira um painel aberto pelo botão de menu, com a conta numa seção
 * própria (fecha com Esc ou ao trocar de rota).
 * Anima a entrada com GSAP (`animateFadeInUp` de cima para baixo).
 *
 * @component
 */
export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, logout: authLogout } = useAuth();
    const { salon } = useSalonBrand();
    // Na área da plataforma, nas vitrines e no marketplace não há um salão em foco: só a marca do Festário.
    const noSalonInFocus = location.pathname.startsWith(PLATFORM_PATH) || location.pathname === SALONS_PATH
        || location.pathname.startsWith(SERVICES_PATH) || location.pathname === MY_BUSINESS_PATH || location.pathname === "/orcamentos";
    const showSalon = Boolean(salon) && !noSalonInFocus;
    const containerRef = useRef(null);
    const [resending, setResending] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setMenuOpen(false);
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [menuOpen]);

    useGSAP(() => {
        animateFadeInUp(containerRef.current, { y: -20, duration: 0.5 });
    }, { scope: containerRef, dependencies: [] });

    const userName = user?.name || "Usuário";
    const userRole = user?.role;
    const primary = primaryItems(userRole);
    const account = accountItems(userRole);
    const emailVerified = user?.emailVerified ?? true;

    async function handleResendVerification() {
        try {
            setResending(true);
            await resendVerification();
            toast.success("E-mail de verificação reenviado. Verifique sua caixa de entrada.");
        } catch (err) {
            if (getHttpStatus(err) === 400) {
                toast.info("Seu e-mail já está verificado.");
            } else {
                toast.error("Erro ao reenviar. Tente novamente.");
            }
        } finally {
            setResending(false);
        }
    }

    function handleLogout() {
        authLogout();
        navigate("/login");
    }

    return (
        <S.Container ref={containerRef}>
            {!emailVerified && (
                <S.VerificationBanner>
                    Verifique seu e-mail para ativar sua conta.
                    <S.ResendButton onClick={handleResendVerification} disabled={resending}>
                        {resending ? "Enviando..." : "Reenviar e-mail"}
                    </S.ResendButton>
                </S.VerificationBanner>
            )}
            <S.Content>
                <S.BrandWrapper to="/home" title="Ir para o início">
                    <S.Logo $compact={showSalon} />
                    {showSalon && <S.Symbol title="Festário" />}
                </S.BrandWrapper>

                {showSalon && salon && (
                    <S.Salon to={`/s/${salon.slug}`} title={`Página de ${salon.name}`}>
                        <SalonMark name={salon.name} logoVariants={salon.logoVariants} logoUrl={salon.logoUrl} size="sm" decorative />
                        <S.SalonName>{salon.name}</S.SalonName>
                    </S.Salon>
                )}

                <S.Nav id="main-nav" aria-label="Principal" $open={menuOpen}>
                    <S.NavGroup aria-label="Navegação principal">
                        {primary.map((item) => {
                            const active = item.match(location.pathname);
                            return (
                                <li key={item.to}>
                                    <S.NavLink $active={active} aria-current={active ? "page" : undefined} as={Link} to={item.to}>
                                        {item.label}
                                    </S.NavLink>
                                </li>
                            );
                        })}
                    </S.NavGroup>

                    {/* No celular, a conta vem no mesmo painel, separada por um título; o Sair fica por último. */}
                    <S.MobileAccount>
                        <S.MobileAccountTitle>
                            <S.Avatar aria-hidden="true">{getInitials(userName)}</S.Avatar>
                            {userName}
                        </S.MobileAccountTitle>
                        <S.NavGroup aria-label="Minha conta">
                            {account.map((item) => {
                                const active = item.match(location.pathname);
                                return (
                                    <li key={item.to}>
                                        <S.NavLink $active={active} aria-current={active ? "page" : undefined} as={Link} to={item.to}>
                                            {item.label}
                                        </S.NavLink>
                                    </li>
                                );
                            })}
                        </S.NavGroup>
                        <S.MobileLogout type="button" onClick={handleLogout}>Sair</S.MobileLogout>
                    </S.MobileAccount>
                </S.Nav>

                <S.Actions>
                    <S.ThemeToggle
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
                        aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
                    >
                        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    </S.ThemeToggle>

                    <S.DesktopOnly>
                        <AccountMenu name={userName} initials={getInitials(userName)} items={account} onLogout={handleLogout} />
                    </S.DesktopOnly>

                    <S.MenuButton
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="main-nav"
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <MenuIcon open={menuOpen} />
                    </S.MenuButton>
                </S.Actions>
            </S.Content>
        </S.Container>
    );
}
