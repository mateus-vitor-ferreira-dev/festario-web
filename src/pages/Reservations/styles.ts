import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Page shell ─── */

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;

  /* espaço para o botão de chat flutuante não cobrir a última ação */
  ${media.md} {
    gap: 20px;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const Header = styled.section`
  display: flex;
  flex-direction: column;
  gap: 6px;
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

/* ─── Reservation cards ─── */

export const List = styled.div<{ $busy?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;

  &:empty {
    display: none;
  }
`;

export const Card = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  ${media.sm} {
    padding: 16px;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  & > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  strong {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  & > div > span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

/* Linha quieta de fatos, divididos por hairlines */
export const CardBody = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);

  /* card sem ações: a linha de fatos fecha o card, sem divisória sobrando */
  &:last-child {
    border-bottom: none;
  }

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 16px 12px 0;
    min-width: 0;

    & + div {
      padding-left: 16px;
      border-left: 1px solid var(--border-default);
    }

    ${media.md} {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      padding: 10px 0;

      & + div {
        padding-left: 0;
        border-left: none;
        border-top: 1px solid var(--border-default);
      }
    }
  }

  span {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
  }

  strong {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  /* mobile: botões com larguras iguais */
  ${media.md} {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 8px;

    & > * {
      width: 100%;
    }
  }

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* ─── Buttons ─── */

export const PayButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand);
  color: var(--on-brand);
  border: none;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-base);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-dark);
  }
`;

export const CancelButton = styled.button`
  background: transparent;
  color: var(--status-error-text);
  border: 1px solid var(--status-error-border);
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-base);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--status-error-bg);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Status = styled.span<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 700;
  white-space: nowrap;
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

/* ─── Loading / empty ─── */

const statePanel = `
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h2 {
    font-size: var(--text-xl);
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    font-size: var(--text-base);
    max-width: 420px;
    line-height: 1.6;
  }
`;

export const LoadingCard = styled.div`
  ${statePanel}
  gap: 12px;

  &::before {
    content: '';
    width: 36px;
    height: 36px;
    margin-bottom: 4px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spin} 0.8s linear infinite;
  }
`;

export const EmptyState = styled.div`
  ${statePanel}
  gap: 8px;

  & > a,
  & > button {
    margin-top: 12px;
  }
`;

/* ─── Cancel modal ─── */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  /* acima do ChatWidget (1000/1001) para o chat não cobrir as ações do modal */
  z-index: 1100;
  padding: 16px;
  overflow-y: auto;

  /* ≤sm: folha inferior de largura total */
  ${media.sm} {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalBox = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px;
  max-width: 520px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: auto;

  ${media.sm} {
    margin: 0;
    max-width: none;
    max-height: 100vh;
    max-height: 100dvh;
    overflow-y: auto;
    padding: 20px 16px calc(16px + env(safe-area-inset-bottom));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: none;
  }
`;

export const ModalTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
`;

export const ModalBody = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
`;

/* ── Refund policy section ── */

export const PolicySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PolicyTitle = styled.h3`
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
`;

export const PolicyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-default);
`;

export const PolicyTier = styled.li<{ $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-default);
  background: ${({ $highlighted }) =>
    $highlighted ? "var(--status-pending-bg)" : "transparent"};
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? "inset 0 0 0 1px var(--status-pending-border)" : "none"};
  border-radius: ${({ $highlighted }) => ($highlighted ? "var(--radius-sm)" : "0")};

  span {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    flex: 1;
  }

  strong {
    font-size: var(--text-sm);
    font-weight: 700;
    color: ${({ $highlighted }) =>
      $highlighted ? "var(--status-pending-text-deep)" : "var(--text-primary)"};
    white-space: nowrap;
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

/* ── Refund estimate card ── */

export const RefundCard = styled.div<{ $neutral?: boolean }>`
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RefundCardTitle = styled.h3`
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-default);
`;

export const RefundRow = styled.div<{ $accent?: boolean }>`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  strong {
    font-size: ${({ $accent }) => ($accent ? "var(--text-lg)" : "var(--text-sm)")};
    font-family: ${({ $accent }) => ($accent ? "var(--font-display)" : "inherit")};
    font-weight: ${({ $accent }) => ($accent ? 600 : 700)};
    color: var(--text-primary);
    text-align: right;
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

/* ── Modal actions ── */

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;

  ${media.sm} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

export const ModalCancelBtn = styled.button`
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: transparent;
  color: var(--brand);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;

export const ModalConfirmBtn = styled.button`
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--status-error-text);
  background: var(--status-error-text);
  color: var(--bg-surface);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ─── Filtro e contagem ─── */

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;
  scroll-margin-top: 96px;

  &:focus {
    outline: none;
  }
`;

export const FilterSlot = styled.div`
  width: min(100%, 280px);

  ${media.sm} {
    width: 100%;
  }
`;

export const ResultCount = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;
`;
