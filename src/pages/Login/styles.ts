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
