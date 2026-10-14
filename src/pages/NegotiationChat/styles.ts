import styled, { css, keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Shell: um único painel (cabeçalho, conversa, campo) ─── */

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* header (64) + padding superior do Main (40) + respiro inferior (24) */
  height: calc(100vh - 128px);
  height: calc(100dvh - 128px);
  min-height: 420px;
  max-width: 760px;
  min-width: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;

  ${media.md} {
    /* header (64) + padding superior do Main (24) + respiro (16) */
    height: calc(100vh - 104px);
    height: calc(100dvh - 104px);
    min-height: 360px;
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px 14px 12px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;

  ${media.sm} {
    gap: 8px;
    padding: 10px 12px 10px 6px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-muted);
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const TopInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TopSubject = styled.strong`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TopMeta = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
      case "PENDING_APPROVAL":
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
      case "ACCEPTED":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      default:
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
    }
  }}
`;

/* ─── Conversa ─── */

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: var(--bg-page);
  min-height: 0;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${media.sm} {
    padding: 16px 12px;
  }
`;

export const MessageRow = styled.div<{ $isOwn: boolean; $isSystem?: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn, $isSystem }) =>
    $isSystem ? "center" : $isOwn ? "flex-end" : "flex-start"};
  animation: ${fadeIn} 0.2s ease;
`;

/*
 * Três vozes:
 *  - usuário (próprio): bolha mata à direita;
 *  - Recanto / outro participante: bolha clara com borda à esquerda, com nome;
 *  - sistema: nota centralizada, sem bolha, em tom de rodapé.
 */
export const Bubble = styled.div<{ $isOwn: boolean; $isSystem?: boolean; $isProposal?: boolean }>`
  max-width: min(72%, 560px);
  padding: 10px 14px;

  ${({ $isOwn, $isSystem, $isProposal }) => {
    if ($isProposal) {
      return css`
        width: min(100%, 440px);
        max-width: 100%;
        padding: 0;
        background: transparent;
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: center;
      `;
    }
    if ($isSystem) {
      return css`
        max-width: min(88%, 520px);
        padding: 10px 16px;
        background: var(--bg-muted);
        border-radius: var(--radius-md);
        text-align: center;
      `;
    }
    if ($isOwn) {
      return css`
        background: var(--brand);
        border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
      `;
    }
    return css`
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
    `;
  }}

  min-width: 0;

  ${media.sm} {
    max-width: ${({ $isProposal }) => ($isProposal ? "100%" : "86%")};
  }
`;

export const BubbleAuthor = styled.span<{ $isOwn: boolean }>`
  font-size: var(--text-xs);
  font-weight: 700;
  color: ${({ $isOwn }) => ($isOwn ? "var(--on-brand)" : "var(--brand)")};
  display: block;
  margin-bottom: 2px;
`;

export const BubbleText = styled.p<{ $isOwn: boolean; $isSystem?: boolean }>`
  font-size: ${({ $isSystem }) => ($isSystem ? "var(--text-sm)" : "var(--text-base)")};
  line-height: 1.5;
  color: ${({ $isOwn, $isSystem }) =>
    $isSystem ? "var(--text-muted)" : $isOwn ? "var(--on-brand)" : "var(--text-primary)"};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

export const BubbleTime = styled.span<{ $isOwn: boolean; $isSystem?: boolean }>`
  font-size: 12px;
  color: ${({ $isOwn }) => ($isOwn ? "var(--on-brand)" : "var(--text-faint)")};
  opacity: ${({ $isOwn }) => ($isOwn ? 0.75 : 1)};
  display: block;
  text-align: ${({ $isSystem }) => ($isSystem ? "center" : "right")};
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
`;

/* ─── PIX (aparece em mensagens de sistema) ─── */

export const PixBlock = styled.div`
  margin-top: 10px;
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  text-align: left;
`;

export const PixLabel = styled.span`
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
`;

export const PixCode = styled.code`
  font-size: var(--text-xs);
  color: var(--text-primary);
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-all;
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: var(--bg-muted);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
`;

export const CopyButton = styled.button`
  align-self: flex-end;
  min-height: 36px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--brand);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;

/* ─── Campo de mensagem ─── */

export const InputBar = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  flex-shrink: 0;

  ${media.md} {
    padding: 10px 12px;
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    /* abre espaço para o botão flutuante do assistente (56px + 16px da borda,
       menos os 16px de margem do Main) para ele não cobrir o "Enviar" */
    padding-right: calc(64px + env(safe-area-inset-right));
  }
`;

export const MessageInput = styled.textarea`
  flex: 1;
  min-width: 0;
  min-height: 44px;
  max-height: 120px;
  padding: 11px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: inherit;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow-y: auto;

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--bg-muted);
  }
`;

export const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--brand);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: var(--on-brand);
  }
`;

export const ClosedBanner = styled.div`
  padding: 14px 20px;
  background: var(--bg-muted);
  border-top: 1px solid var(--border-default);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

/* ─── Painel do administrador ─── */

export const AdminPanel = styled.div`
  margin-top: 24px;
  max-width: 760px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${media.sm} {
    padding: 20px 16px;
  }
`;

export const AdminPanelTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
`;

export const AdminForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
`;

export const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
`;

export const FieldInput = styled.input`
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:is(textarea) {
    height: auto;
    min-height: 72px;
    padding: 10px 12px;
    line-height: 1.5;
    resize: vertical;
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AdminButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  background: var(--brand);
  color: var(--on-brand);
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }
`;

export const DangerButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: var(--status-error-text);
  border: 1px solid var(--status-error-border);

  &:hover:not(:disabled) {
    background: var(--status-error-bg);
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: var(--brand);
  border: 1px solid var(--brand-border);

  &:hover:not(:disabled) {
    background: var(--brand-subtle);
  }
`;

export const SelectedDateBadge = styled.span`
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-subtle);
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
`;

export const CalendarToggle = styled.button`
  min-height: 40px;
  padding: 0 16px;
  background: transparent;
  color: var(--brand);
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background: var(--brand-subtle);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CalendarWrapper = styled.div`
  margin-top: 8px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

/* ─── Proposta: cartão de decisão ─── */

export const ProposalCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  min-width: 0;

  ${media.sm} {
    padding: 16px;
  }
`;

export const ProposalTitle = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
`;

export const ProposalPrice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-default);
`;

export const ProposalPriceValue = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-primary);
  font-variant-numeric: lining-nums tabular-nums;
`;

export const ProposalDetail = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ProposalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 8px 0;
  font-size: var(--text-sm);

  & + & {
    border-top: 1px solid var(--border-default);
  }

  /* Obs. longas: rótulo em cima, valor embaixo */
  ${media.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
`;

export const ProposalLabel = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  flex-shrink: 0;
`;

export const ProposalValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  overflow-wrap: anywhere;

  ${media.sm} {
    text-align: left;
  }
`;

export const ProposalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const AcceptButton = styled.button`
  ${buttonBase}
  flex: 1;
  background: var(--brand);
  color: var(--on-brand);
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }
`;

export const DeclineButton = styled.button`
  ${buttonBase}
  flex: 1;
  background: transparent;
  color: var(--status-error-text);
  border: 1px solid var(--status-error-border);

  &:hover:not(:disabled) {
    background: var(--status-error-bg);
  }
`;

export const AdminWaiting = styled.div`
  padding: 12px 16px;
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--status-pending-text-deep);
`;
