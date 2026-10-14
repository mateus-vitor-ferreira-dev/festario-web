import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";
import logo from "../../assets/logo-recanto.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { resendVerification } from "../../services/auth";
import { animateFadeInUp } from "../../utils/animations";
import { getHttpStatus } from "../../utils/errors";
import { BRAND_NAME } from "../../config/brand";
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
 * Lê o perfil do usuário do `localStorage` (`recanto:userData`) para exibir
 * iniciais no avatar e o link de Admin (visível apenas para `role === "ADMIN"`).
 * Inclui botão de toggle de tema claro/escuro e botão de logout. Abaixo de
 * 1024px a mesma `<nav>` vira um painel aberto pelo botão de menu (fecha com
 * Esc ou ao trocar de rota).
 * Anima a entrada com GSAP (`animateFadeInUp` de cima para baixo).
 *
 * @component
 */
export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, logout: authLogout } = useAuth();
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
                <S.BrandWrapper to="/home">
                    <S.Logo src={logo} alt={`Logo ${BRAND_NAME}`} />
                    <S.BrandText>{BRAND_NAME}</S.BrandText>
                </S.BrandWrapper>

                <S.Nav id="main-nav" aria-label="Principal" $open={menuOpen}>
                    <S.NavLink $active={location.pathname === "/home"} as={Link} to="/home">
                        Início
                    </S.NavLink>

                    <S.NavLink $active={location.pathname === "/venues"} as={Link} to="/venues">
                        Espaços
                    </S.NavLink>

                    <S.NavLink
                        $active={location.pathname === "/reservations"}
                        as={Link}
                        to="/reservations"
                    >
                        Reservas
                    </S.NavLink>

                    <S.NavLink
                        $active={location.pathname === "/promocoes"}
                        as={Link}
                        to="/promocoes"
                    >
                        Promoções
                    </S.NavLink>

                    <S.NavLink
                        $active={location.pathname.startsWith("/negociacoes")}
                        as={Link}
                        to="/negociacoes"
                    >
                        Negociações
                    </S.NavLink>

                    <S.NavLink
                        $active={location.pathname.startsWith("/contate-nos")}
                        as={Link}
                        to="/contate-nos"
                    >
                        Contate-nos
                    </S.NavLink>

                    {userRole === "ADMIN" && (
                        <S.NavLink $active={location.pathname === "/admin"} as={Link} to="/admin">
                            Admin
                        </S.NavLink>
                    )}
                </S.Nav>

                <S.Actions>
                    <S.ThemeToggle
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
                        aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
                    >
                        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    </S.ThemeToggle>

                    <S.ProfileLink to="/profile" title={`Editar perfil de ${userName}`}>
                        <S.Avatar>{getInitials(userName)}</S.Avatar>
                        <S.UserInfo>
                            <span>Olá,</span>
                            <strong>{userName.split(" ")[0]}</strong>
                        </S.UserInfo>
                    </S.ProfileLink>

                    <S.LogoutButton onClick={handleLogout}>Sair</S.LogoutButton>

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
