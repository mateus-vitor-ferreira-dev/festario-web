import styled, { keyframes } from "styled-components";

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: ${fadeIn} 0.3s ease;
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 280px;
  text-align: center;

  p {
    color: var(--text-muted);
    font-size: 15px;
  }
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  animation: ${spinAnim} 0.8s linear infinite;
`;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const PageDescription = styled.p`
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 24px;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Reservation Summary Card ─── */

export const SummaryCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const VenueName = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const StatusBadge = styled.span<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case "PAID":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "CANCELLED":
        return `background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);`;
      case "PENDING":
      default:
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
    }
  }}
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--bg-muted);
`;

export const DetailList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailItem = styled.div`
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const DetailValue = styled.strong`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

export const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TotalLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
`;

export const TotalValue = styled.strong`
  font-size: 30px;
  font-weight: 800;
  color: var(--brand);
`;

/* ─── Payment Card ─── */

export const PaymentCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const PaymentTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const PaymentDescription = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: -8px;
`;

export const SecurityBadges = styled.ul`
  list-style: none;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 14px;
`;

export const SecurityItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-medium);
  font-weight: 500;
`;

export const SecurityDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
`;

export const AmountSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--brand-subtle);
  border: 1px solid var(--brand-border);
  border-radius: 14px;

  span {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  strong {
    font-size: 22px;
    font-weight: 800;
    color: var(--brand);
  }
`;

export const PayButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: var(--brand);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const InfoBox = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--status-pending-text-deep);
  line-height: 1.5;
`;

export const CancelLink = styled.button`
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;

  &:hover {
    color: var(--text-secondary);
  }
`;

export const StripeBadge = styled.p`
  text-align: center;
  font-size: 12px;
  color: var(--text-faint);
  border-top: 1px solid var(--bg-muted);
  padding-top: 16px;
  margin-top: -4px;

  strong {
    color: var(--text-muted);
  }
`;

/* ─── Method Selector ─── */

export const MethodSelector = styled.div`
  display: flex;
  gap: 10px;
`;

export const MethodButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ $active }) =>
    $active
      ? `
    background: var(--brand);
    color: #ffffff;
    border: 2px solid var(--brand);
  `
      : `
    background: transparent;
    color: var(--text-secondary);
    border: 2px solid var(--border-default);

    &:hover {
      border-color: var(--brand);
      color: var(--brand);
    }
  `}
`;

/* ─── PIX QR Code ─── */

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export const PixContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

export const PixQrImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
`;

export const PixCopyPasteBox = styled.div`
  width: 100%;
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PixCopyPasteLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const PixCopyPasteValue = styled.span`
  font-size: 11px;
  font-family: monospace;
  color: var(--text-secondary);
  word-break: break-all;
  line-height: 1.5;
`;

export const CopyButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--brand);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }
`;

export const PixStatus = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--brand);
    flex-shrink: 0;
    animation: ${pulseAnim} 1.5s ease-in-out infinite;
  }
`;

export const PixExpiry = styled.p`
  font-size: 12px;
  color: var(--text-faint);
`;
