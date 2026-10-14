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

  /* >lg: coluna de pagamento acompanha a rolagem (64px do header + folga) */
  @media (min-width: 1025px) {
    position: sticky;
    top: 88px;
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

export const PaymentDescription = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: -8px;
`;

/* Método escolhido — mostrado como opção selecionada */
export const MethodOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid var(--brand);
  border-radius: var(--radius-md);
  background: var(--brand-subtle);
`;

export const MethodRadio = styled.span`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border-radius: 50%;
  border: 1.5px solid var(--brand);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--brand);
  }
`;

export const MethodText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--text-primary);
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.5;
  }
`;

export const SecurityBadges = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SecurityItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

export const SecurityDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
`;

export const AmountSummary = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-default);

  span {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-secondary);
  }

  strong {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const PayButton = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
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
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const InfoBox = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: var(--text-sm);
  color: var(--status-pending-text-deep);
  line-height: 1.5;
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

/* ─── Seletor de método (cartão / PIX) ─── */

export const MethodSelector = styled.div`
  display: flex;
  gap: 8px;
`;

export const MethodButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-height: 44px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  ${({ $active }) =>
    $active
      ? `
    background: var(--brand-subtle);
    color: var(--brand);
    border: 1.5px solid var(--brand);
  `
      : `
    background: transparent;
    color: var(--text-secondary);
    border: 1.5px solid var(--border-medium);

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
`;

export const PixQrImage = styled.img`
  width: 200px;
  height: 200px;
  padding: 8px;
  background: #ffffff; /* QR precisa de fundo claro para leitura, inclusive no tema escuro */
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
`;

export const PixCopyPasteBox = styled.div`
  width: 100%;
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PixCopyPasteLabel = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
`;

export const PixCopyPasteValue = styled.span`
  font-size: var(--text-xs);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
  line-height: 1.5;
`;

export const CopyButton = styled.button`
  align-self: flex-start;
  min-height: 44px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-sm);
  color: var(--brand);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;

export const PixStatus = styled.p`
  font-size: var(--text-sm);
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
  font-size: var(--text-xs);
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
`;
