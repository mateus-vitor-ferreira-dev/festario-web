import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  /* Folga para o botão flutuante do chat (56px + 28px) não cobrir o fim do conteúdo */
  ${media.md} {
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const Header = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  color: var(--text-muted);
  line-height: 1.6;
  font-size: var(--text-base);
  max-width: 640px;
`;

export const InviteCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${media.md} {
    padding: 20px;
  }
`;

export const InviteTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const InviteRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  ${media.sm} {
    flex-direction: column;
  }
`;

export const EmailInput = styled.input`
  flex: 1;
  min-width: 200px;
  height: 44px;

  ${media.sm} {
    min-width: 0;
    width: 100%;
    flex: none;
  }
  padding: 0 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-base);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:disabled {
    background: var(--bg-muted);
    cursor: not-allowed;
  }
`;

export const InviteButton = styled.button`
  min-height: 44px;
  padding: 0 22px;
  background: var(--brand);
  color: var(--on-brand);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  ${media.sm} {
    width: 100%;
  }
`;

export const NoCampaignBanner = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: var(--text-sm);
  color: var(--status-pending-text-deep);
  line-height: 1.5;
`;

/* Lista única com divisórias finas, em vez de um card por indicação */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  margin-top: -16px;
`;

export const ListTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const ReferralCard = styled.article`
  padding: 16px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-default);

  &:last-child {
    border-bottom: none;
  }

  /* ≤md: e-mail em linha própria; data e status lado a lado logo abaixo */
  ${media.md} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 4px 12px;
    padding: 14px 16px;
  }
`;

export const ReferralInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  ${media.md} {
    display: contents;

    strong { grid-column: 1 / -1; }
  }

  strong {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "REWARDED":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "QUALIFIED":
        return `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;
      case "EXPIRED":
      case "CANCELLED":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      case "PENDING":
      default:
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
    }
  }}
`;

export const LoadingCard = styled.div`
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  &::before {
    content: '';
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spin} 0.8s linear infinite;
    margin-bottom: 4px;
  }

  h2 {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-secondary);
  }

  p {
    color: var(--text-muted);
    font-size: var(--text-sm);
    max-width: 300px;
    line-height: 1.6;
  }
`;

export const EmptyState = styled.div`
  margin-top: -16px;
  padding: 20px 0;
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);

  p {
    color: var(--text-muted);
    font-size: var(--text-base);
    line-height: 1.6;
  }
`;
