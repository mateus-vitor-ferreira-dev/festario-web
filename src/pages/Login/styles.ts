import { Link } from "react-router-dom";
import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-default);
  }

  span {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
    white-space: nowrap;
  }
`;

export const ForgotLink = styled(Link)`
  align-self: flex-end;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--brand);
  text-decoration: underline;
  text-decoration-color: var(--brand-border);
  text-underline-offset: 3px;
  margin-top: -8px;

  &:hover {
    text-decoration-color: currentColor;
  }

  ${media.md} {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-top: -16px;
  }
`;

export const FooterText = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-top: 4px;

  a {
    color: var(--brand);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--brand-border);
    text-underline-offset: 3px;

    &:hover {
      text-decoration-color: currentColor;
    }

    /* alvo de toque ≥44px */
    ${media.md} {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
`;

/** Aviso do espaço em que o login vai entrar (`/login?espaco=<slug>`). */
export const TenantNotice = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 12px;
  padding: 10px 14px;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  background: var(--brand-subtle);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.4;

  strong {
    color: var(--text-primary);
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  button {
    min-height: 44px;
    padding: 0;
    border: none;
    background: none;
    color: var(--brand);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--brand-border);
    text-underline-offset: 3px;
    cursor: pointer;

    &:hover {
      text-decoration-color: currentColor;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-radius: var(--radius-sm);
    }
  }
`;
