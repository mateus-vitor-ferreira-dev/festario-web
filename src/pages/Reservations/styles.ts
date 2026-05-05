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

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Card = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  strong {
    display: block;
    font-size: 18px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  span {
    font-size: 14px;
    color: var(--text-muted);
  }
`;

export const CardBody = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }

  div {
    background: var(--bg-page);
    border: 1px solid var(--border-default);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  span {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  strong {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PayButton = styled.button`
  background: var(--brand);
  color: #ffffff;
  border: none;
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
`;

export const CancelButton = styled.button`
  background: var(--status-error-bg);
  color: var(--status-error-text);
  border: 1px solid var(--status-error-border);
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--status-error-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Status = styled.span<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid;

  ${({ status }) => {
    switch (status) {
      case "PAID":
        return `
          background: var(--status-paid-bg);
          color: var(--status-paid-text);
          border-color: var(--status-paid-border);
        `;
      case "CANCELLED":
      case "EXPIRED":
        return `
          background: var(--bg-muted);
          color: var(--text-muted);
          border-color: var(--border-default);
        `;
      case "PENDING":
      default:
        return `
          background: var(--status-pending-bg);
          color: var(--status-pending-text);
          border-color: var(--status-pending-border);
        `;
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

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
`;

export const ModalBox = styled.div`
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 32px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: auto;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const ModalBody = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
`;

/* ── Refund policy section ── */

export const PolicySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PolicyTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
`;

export const PolicyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const PolicyTier = styled.li<{ $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ $highlighted }) =>
    $highlighted ? "var(--status-pending-bg)" : "var(--bg-page)"};
  border: 1px solid ${({ $highlighted }) =>
    $highlighted ? "var(--status-pending-border)" : "var(--border-default)"};
  transition: background 0.15s ease;

  span {
    font-size: 13px;
    color: var(--text-secondary);
    flex: 1;
  }

  strong {
    font-size: 13px;
    font-weight: 700;
    color: ${({ $highlighted }) =>
      $highlighted ? "var(--status-pending-text)" : "var(--text-primary)"};
    white-space: nowrap;
  }
`;

/* ── Refund estimate card ── */

export const RefundCard = styled.div<{ $neutral?: boolean }>`
  background: ${({ $neutral }) => ($neutral ? "var(--bg-page)" : "var(--bg-page)")};
  border: 1px solid ${({ $neutral }) =>
    $neutral ? "var(--border-default)" : "var(--border-medium)"};
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const RefundCardTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-default);
`;

export const RefundRow = styled.div<{ $accent?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    font-size: 14px;
    color: var(--text-muted);
  }

  strong {
    font-size: 14px;
    font-weight: 700;
    color: ${({ $accent }) => ($accent ? "var(--brand)" : "var(--text-primary)")};
  }
`;

/* ── Modal actions ── */

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
`;

export const ModalCancelBtn = styled.button`
  height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-page);
  }
`;

export const ModalConfirmBtn = styled.button`
  height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: #c0392b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 56px 32px;
  border: 1px solid var(--border-default);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  &::before {
    content: '';
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--bg-muted);
    border: 2px dashed var(--border-medium);
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

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-bottom: 8px;
`;

export const PageInfo = styled.span`
  font-size: 14px;
  color: var(--text-muted);
  min-width: 100px;
  text-align: center;
`;

export const PageButton = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid var(--border-medium);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background: var(--bg-muted);
    border-color: var(--brand);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
