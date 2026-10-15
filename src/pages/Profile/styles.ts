import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 320px;

  p {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;

export const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  animation: ${spinAnim} 0.8s linear infinite;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PageTitle = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const PageSubtitle = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

/* ─── Identity sidebar ─── */

export const IdentityCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;

  /* ≤md: cartão compacto em linha — avatar à esquerda, dados à direita */
  ${media.md} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 16px;
    row-gap: 2px;
    align-items: center;
    padding: 20px;

    & > :first-child {
      grid-row: span 3;
      margin-bottom: 0;
    }

    & > :not(:first-child) {
      grid-column: 2;
      justify-self: start;
    }
  }
`;

export const AvatarLarge = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--brand-subtle);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

export const IdentityName = styled.strong`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
`;

export const IdentityEmail = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  overflow-wrap: anywhere;
`;

export const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--brand-subtle);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  margin-top: 8px;
`;

/* ─── Verification banner ─── */

export const VerificationBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-radius: var(--radius-lg);
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);

  ${media.md} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const VerificationText = styled.p`
  font-size: var(--text-base);
  color: var(--status-pending-text-deep);
  line-height: 1.5;

  strong {
    font-weight: 700;
  }
`;

export const ResendButton = styled.button`
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--status-pending-border);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--bg-page);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

/* ─── Edit form ─── */

export const FormCard = styled.form`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${media.md} {
    padding: 24px 20px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }

  & > * {
    min-width: 0;
  }
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-default);

  /* ≤sm: ações em largura total, primária em cima */
  ${media.sm} {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

export const CancelButton = styled.button`
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--brand);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;

export const SaveButton = styled.button`
  min-height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

/* Texto de apoio dos cards (finalidade do endereço, a região encontrada). */
export const Hint = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 68ch;

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;
