import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spinAnim = keyframes`
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
  flex-direction: column;
  gap: 8px;
`;

export const PageTitle = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const PageDescription = styled.p`
  color: var(--text-muted);
  font-size: var(--text-base);
  line-height: 1.6;
  max-width: 640px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 24px;
  align-items: start;

  /* ≤lg: resumo primeiro, pagamento logo abaixo, numa coluna de leitura */
  ${media.lg} {
    grid-template-columns: minmax(0, 1fr);
    max-width: 720px;
  }
`;

/* ─── Resumo do pedido ─── */

export const SummaryCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  ${media.md} {
    padding: 24px 20px;
  }
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const VenueName = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const StatusBadge = styled.span<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
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
  background: var(--border-default);
`;

/* Linhas rótulo / valor com divisórias finas */
export const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  margin: -8px 0;
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default);

  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  flex-shrink: 0;
`;

export const DetailValue = styled.strong`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
  margin-left: auto;
  min-width: 0;
  font-variant-numeric: lining-nums tabular-nums;
`;

export const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
`;

export const TotalLabel = styled.span`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-secondary);
`;

export const TotalValue = styled.strong`
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1;
  color: var(--text-primary);
  text-align: right;
  margin-left: auto;
  font-variant-numeric: lining-nums tabular-nums;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

/* ─── Pagamento ─── */

export const PaymentCard = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* >lg: coluna de pagamento acompanha a rolagem (72px do header + folga) */
  @media (min-width: 1025px) {
    position: sticky;
    top: 96px;
  }

  ${media.md} {
    padding: 24px 20px;
  }
`;

export const PaymentTitle = styled.h3`
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const CancelLink = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: var(--brand);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--brand-border);
  text-underline-offset: 3px;
  min-height: 44px;
  padding: 0 8px;

  &:hover {
    text-decoration-color: currentColor;
  }
`;

/* ─── Pagamento combinado com o salão ─── */

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

export const SectionTitle = styled.h2`
  font-size: var(--text-lg);
  color: var(--text-primary);
  line-height: 1.25;
`;

export const Muted = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.55;
`;

/* O que a pessoa precisa saber primeiro: título e uma frase, com a cor do estado. */
export const Headline = styled.div<{ $tone: "pending" | "paid" | "neutral" }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 14px;
  border-left: 4px solid ${({ $tone }) => ($tone === "paid" ? "var(--brand)" : $tone === "pending" ? "var(--gold)" : "var(--border-medium)")};

  p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.5;
  }
`;

export const AmountList = styled.dl`
  display: grid;
  gap: 10px;
  margin: 0;

  div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  dt {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  dd {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const Deadline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  color: var(--status-pending-text-deep);
  font-size: var(--text-sm);
  line-height: 1.45;

  strong {
    font-size: var(--text-base);
  }
`;

export const HowToPay = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--border-default);
`;

/* Texto livre do salão (chave PIX, banco...): quebra de linha preservada e fácil de selecionar. */
export const Instructions = styled.p`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.55;
  user-select: text;
`;

export const ContactActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const action = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  text-decoration: none;
  text-align: center;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

export const PrimaryAction = styled.a`
  ${action}
  background: var(--brand);
  color: var(--on-brand);

  &:hover {
    background: var(--brand-dark);
  }
`;

export const SecondaryAction = styled.a`
  ${action}
  min-height: 44px;
  background: transparent;
  color: var(--brand);
  border: 1px solid var(--brand-border);
  font-weight: 600;
  overflow-wrap: anywhere;

  &:hover {
    background: var(--brand-subtle);
  }
`;

export const EntryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

export const EntryItem = styled.li<{ $refund?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default);

  &:last-child {
    border-bottom: none;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  strong {
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    overflow-wrap: anywhere;
  }
`;

export const EntryAmount = styled.span<{ $refund?: boolean }>`
  flex-shrink: 0;
  font-weight: 700;
  font-variant-numeric: lining-nums tabular-nums;
  color: ${({ $refund }) => ($refund ? "var(--status-cancelled-text)" : "var(--text-primary)")} !important;
`;
