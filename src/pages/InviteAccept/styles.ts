import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/** Resumo do convite: espaço + e-mail da conta que será criada. */
export const InviteSummary = styled.dl`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  overflow: hidden;

  & > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 2px 16px;
    padding: 10px 14px;
  }

  & > div + div {
    border-top: 1px solid var(--border-default);
  }

  dt {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  dd {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    overflow-wrap: anywhere;
    min-width: 0;
  }
`;

/** Requisitos da senha com o estado de cada um (mesmas regras do cadastro). */
export const Rules = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 12px;
  margin-top: -8px;
  list-style: none;
  padding: 0;

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`;

export const Rule = styled.li<{ $ok: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  color: ${({ $ok }) => ($ok ? "var(--status-paid-text)" : "var(--text-muted)")};

  svg {
    flex-shrink: 0;
    width: var(--icon-sm);
    height: var(--icon-sm);
  }
`;

export const Notice = styled.p<{ $tone?: "info" | "error" | "warning" }>`
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid;
  font-size: var(--text-sm);
  line-height: 1.5;

  ${({ $tone = "info" }) =>
    $tone === "error"
      ? "background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);"
      : $tone === "warning"
        ? "background: var(--status-pending-bg); color: var(--status-pending-text-deep); border-color: var(--status-pending-border);"
        : "background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);"}

  strong {
    font-weight: 700;
    overflow-wrap: anywhere;
  }
`;

/** Estado sem formulário (vencido, aceito, revogado, não encontrado). */
export const StateBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  p {
    font-size: var(--text-base);
    line-height: 1.55;
    color: var(--text-secondary);
  }

  strong {
    overflow-wrap: anywhere;
  }
`;

export const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--control-h);
  padding: 0 20px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-size: var(--text-base);
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: var(--brand-dark);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
`;

export const FooterText = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);

  a {
    color: var(--brand);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--brand-border);
    text-underline-offset: 3px;

    &:hover {
      text-decoration-color: currentColor;
    }

    ${media.md} {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
`;

export const Spinner = styled.div`
  width: 32px;
  height: 32px;
  margin: 24px auto;
  border-radius: 50%;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  animation: invite-spin 0.8s linear infinite;

  @keyframes invite-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2.4s;
  }
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
