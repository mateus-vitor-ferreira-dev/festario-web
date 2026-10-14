import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.section`
  scroll-margin-top: 96px;

  &:focus {
    outline: none;
  }

  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-primary);

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  color: var(--text-muted);
  line-height: 1.5;
  font-size: var(--text-base);
`;

export const NewButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  background: var(--brand);
  color: var(--on-brand);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${media.sm} {
    width: 100%;
  }
`;

/* Lista única em painel, linhas separadas por hairline */
export const List = styled.div<{ $busy?: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;
`;

export const NegotiationCard = styled.div`
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  cursor: pointer;
  transition: background 0.15s ease;

  & + & {
    border-top: 1px solid var(--border-default);
  }

  &:hover {
    background: var(--bg-muted);
  }

  ${media.sm} {
    padding: 16px;
    align-items: flex-start;
  }
`;

export const NegotiationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const NegotiationSubject = styled.strong`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const NegotiationMeta = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;

export const LastMessage = styled.p`
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(100%, 520px);
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
  flex-shrink: 0;

  ${({ $status }) => {
    switch ($status) {
      case "OPEN":
        return `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;
      case "ACCEPTED":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "REJECTED":
      case "CLOSED":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      default:
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
    }
  }}
`;

export const EmptyState = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 40px 24px;

  ${media.sm} {
    padding: 28px 16px;
  }

  p {
    color: var(--text-muted);
    font-size: var(--text-base);
    line-height: 1.6;
    max-width: 520px;
  }
`;

export const LoadingCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 48px;
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;
