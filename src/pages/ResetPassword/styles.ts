import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

export const ErrorBox = styled.div`
  background: var(--status-error-bg);
  border: 1px solid var(--status-error-border);
  border-radius: var(--radius-md);
  padding: 16px;
  color: var(--status-error-text);
  font-size: var(--text-base);
  line-height: 1.6;
`;
