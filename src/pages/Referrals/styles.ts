import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const Description = styled.p`
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 15px;
`;

export const InviteCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InviteTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const InviteRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const EmailInput = styled.input`
  flex: 1;
  min-width: 200px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:disabled {
    background: var(--bg-page);
    cursor: not-allowed;
  }
`;

export const InviteButton = styled.button`
  height: 44px;
  padding: 0 22px;
  background: var(--brand);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const NoCampaignBanner = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 14px;
  color: var(--status-pending-text-deep);
  line-height: 1.5;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ListTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const ReferralCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ReferralInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 15px;
    color: var(--text-primary);
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
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
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 56px 32px;
  border: 1px solid var(--border-default);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  &::before {
    content: '';
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spin} 0.8s linear infinite;
  }

  h2 {
    font-size: 18px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 300px;
    line-height: 1.6;
  }
`;

export const EmptyState = styled.div`
  background: var(--bg-page);
  border: 1px dashed var(--border-medium);
  border-radius: 16px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;

  p {
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.6;
  }
`;
