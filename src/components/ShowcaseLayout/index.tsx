import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";

import { Footer } from "..";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { media } from "../../styles/breakpoints";
import { withReturn } from "../../utils/returnPath";
import * as H from "../Header/styles";
import MainLayout from "../MainLayout";
import * as M from "../MainLayout/styles";

/**
 * Casca da vitrine (`/saloes` e `/s/:slug`), que é pública: logado, é o app de sempre; sem login, um
 * cabeçalho só com a marca e os caminhos para entrar ou criar conta, que voltam para esta mesma página.
 *
 * @component
 */
export default function ShowcaseLayout() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <MainLayout /> : <PublicLayout />;
}

function PublicLayout() {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const here = location.pathname + location.search;
    const themeLabel = theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";

    return (
        <M.Container>
            <H.Container>
                <H.Content>
                    <H.BrandWrapper to="/saloes" title="Salões do Festário">
                        <H.Logo />
                    </H.BrandWrapper>
                    <Actions>
                        <H.ThemeToggle type="button" onClick={toggleTheme} title={themeLabel} aria-label={themeLabel}>
                            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                        </H.ThemeToggle>
                        <SignIn to={withReturn("/login", here)}>Entrar</SignIn>
                        <SignUp to={withReturn("/cadastro", here)}>Criar conta</SignUp>
                    </Actions>
                </H.Content>
            </H.Container>
            <M.Main>
                <Outlet />
            </M.Main>
            <Footer />
        </M.Container>
    );
}

function SunIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const linkBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

const SignIn = styled(Link)`
  ${linkBase}
  color: var(--brand);

  &:hover {
    background: var(--brand-subtle);
  }

  ${media.sm} {
    padding: 0 10px;
  }
`;

const SignUp = styled(Link)`
  ${linkBase}
  background: var(--brand);
  color: var(--on-brand);

  &:hover {
    background: var(--brand-dark);
  }

  ${media.sm} {
    padding: 0 12px;
  }
`;
