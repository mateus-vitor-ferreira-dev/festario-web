import { Link } from "react-router-dom";
import styled from "styled-components";
import { media } from "../../styles/breakpoints";
import { FestarioLogo, FestarioSymbol } from "../Brand";

export const Container = styled.header`
  width: 100%;
  border-bottom: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--bg-page) 88%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.2s ease, border-color 0.2s ease;
`;

export const Content = styled.div`
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  min-height: 72px;
  padding: 0 max(24px, env(safe-area-inset-right)) 0 max(24px, env(safe-area-inset-left));

  ${media.sm} {
    padding: 0 16px;
    gap: 12px;
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

export const BrandWrapper = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  /* respiro do guia: ¼ da altura do símbolo; também garante o alvo de toque de 44px */
  padding: 9px 0;
  min-height: 44px;
  text-decoration: none;
  border-radius: var(--radius-sm);
`;

/* Salão em foco: separado da marca da plataforma por um filete na cor do salão. */
export const Salon = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 44px;
  padding-left: 14px;
  border-left: 2px solid var(--salon-accent);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  ${media.sm} {
    padding-left: 10px;
  }
`;

export const SalonName = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.2;
  max-width: 18ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* No celular o selo basta: o nome completo está no title e na página de espaços. */
  ${media.sm} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

/* logotipo inline (segue o tema). Altura mínima do guia: 24px */
export const Logo = styled(FestarioLogo)<{ $compact?: boolean }>`
  display: block;
  height: 36px;
  width: auto;

  ${media.sm} {
    height: 28px;
    /* Com o selo do salão ao lado, no celular fica só o símbolo da plataforma. */
    display: ${({ $compact }) => ($compact ? "none" : "block")};
  }
`;

export const Symbol = styled(FestarioSymbol)`
  display: none;
  height: 32px;
  width: auto;

  ${media.sm} {
    display: block;
  }
`;

export const Nav = styled.nav<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;

  ${media.lg} {
    display: ${({ $open }) => ($open ? "flex" : "none")};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 8px 16px 16px;
    background: var(--bg-page);
    border-bottom: 1px solid var(--border-default);
    box-shadow: var(--shadow-lg);
    max-height: calc(100dvh - 72px);
    overflow-y: auto;
  }
`;

export const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 8px 12px;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? "var(--brand)" : "var(--text-muted)")};
  background: ${({ $active }) => ($active ? "var(--brand-subtle)" : "transparent")};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-muted);
    color: var(--text-primary);
  }

  ${media.lg} {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0 12px;
    font-size: var(--text-base);
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border-radius: 10px;
  padding: 4px 8px 4px 4px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-muted);
  }

  ${media.sm} {
    padding: 4px;
  }
`;

export const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--on-brand);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  span {
    font-size: var(--text-2xs);
    color: var(--text-faint);
  }

  strong {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  /* abaixo de 1200px o avatar sozinho basta; libera espaço para a nav */
  @media (max-width: 1200px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  min-height: 44px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: var(--bg-muted);
  }
`;

export const VerificationBanner = styled.div`
  width: 100%;
  background: var(--status-pending-bg);
  border-bottom: 1px solid var(--status-pending-border);
  color: var(--status-pending-text);
  font-size: var(--text-sm);
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
`;

export const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--status-pending-text);
  font-weight: 700;
  font-size: var(--text-sm);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ThemeToggle = styled.button`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-muted);
    color: var(--text-primary);
  }

  svg {
    width: var(--icon-md);
    height: var(--icon-md);
  }
`;

export const MenuButton = styled.button`
  display: none;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: var(--icon-lg);
    height: var(--icon-lg);
  }

  ${media.lg} {
    display: inline-flex;
  }
`;
