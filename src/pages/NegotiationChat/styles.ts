import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  max-width: 760px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px 16px 0 0;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 8px;
  transition: color 0.15s;

  &:hover {
    color: var(--text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const TopInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TopSubject = styled.strong`
  font-size: 15px;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TopMeta = styled.span`
  font-size: 12px;
  color: var(--text-muted);
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
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

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px;
  background: var(--bg-page);
  border-left: 1px solid var(--border-default);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MessageRow = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  animation: ${fadeIn} 0.2s ease;
`;

export const Bubble = styled.div<{ $isOwn: boolean; $isSystem?: boolean }>`
  max-width: 68%;
  padding: 10px 14px;
  border-radius: ${({ $isOwn }) =>
    $isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  background: ${({ $isOwn, $isSystem }) =>
    $isSystem
      ? "var(--bg-surface)"
      : $isOwn
      ? "var(--brand)"
      : "var(--bg-surface)"};
  border: ${({ $isSystem }) =>
    $isSystem ? "1px dashed var(--border-medium)" : "none"};
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
`;

export const BubbleAuthor = styled.span<{ $isOwn: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $isOwn }) => ($isOwn ? "rgba(255,255,255,0.75)" : "var(--brand)")};
  display: block;
  margin-bottom: 4px;
`;

export const BubbleText = styled.p<{ $isOwn: boolean; $isSystem?: boolean }>`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ $isOwn, $isSystem }) =>
    $isSystem ? "var(--text-muted)" : $isOwn ? "#ffffff" : "var(--text-primary)"};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

export const BubbleTime = styled.span<{ $isOwn: boolean }>`
  font-size: 10px;
  color: ${({ $isOwn }) => ($isOwn ? "rgba(255,255,255,0.6)" : "var(--text-faint)")};
  display: block;
  text-align: right;
  margin-top: 4px;
`;

export const PixBlock = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PixLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const PixCode = styled.code`
  font-size: 11px;
  color: #ffffff;
  word-break: break-all;
  font-family: monospace;
  background: rgba(0,0,0,0.15);
  padding: 6px 8px;
  border-radius: 6px;
`;

export const CopyButton = styled.button`
  align-self: flex-end;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

export const InputBar = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 16px 16px;
`;

export const MessageInput = styled.textarea`
  flex: 1;
  min-height: 42px;
  max-height: 120px;
  padding: 10px 14px;
  border: 1px solid var(--border-medium);
  border-radius: 22px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
  overflow-y: auto;

  &:focus {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--bg-surface);
  }
`;

export const SendButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--brand);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: #ffffff;
  }
`;

export const ClosedBanner = styled.div`
  padding: 10px 18px;
  background: var(--bg-muted);
  border-left: 1px solid var(--border-default);
  border-right: 1px solid var(--border-default);
  border-bottom: none;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
`;

/* Admin panel */
export const AdminPanel = styled.div`
  margin-top: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const AdminPanelTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const AdminForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 140px;
`;

export const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
`;

export const FieldInput = styled.input`
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--brand);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AdminButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  height: 40px;
  padding: 0 20px;
  background: var(--brand);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerButton = styled.button`
  height: 40px;
  padding: 0 20px;
  background: var(--bg-page);
  color: var(--status-cancelled-text);
  border: 1px solid var(--status-cancelled-border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--status-cancelled-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  height: 40px;
  padding: 0 20px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--bg-page);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SelectedDateBadge = styled.span`
  margin-left: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-subtle);
  border: 1px solid var(--brand-border, #bbf7d0);
  border-radius: 6px;
  padding: 2px 8px;
`;

export const CalendarToggle = styled.button`
  height: 36px;
  padding: 0 16px;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px dashed var(--border-medium);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  align-self: flex-start;

  &:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CalendarWrapper = styled.div`
  margin-top: 8px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: 14px;
`;

/* Proposal card (rendered inside a message bubble) */
export const ProposalCard = styled.div`
  margin-top: 10px;
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 240px;
`;

export const ProposalTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ProposalDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProposalRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
`;

export const ProposalLabel = styled.span`
  color: var(--text-muted);
`;

export const ProposalValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
`;

export const ProposalActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

export const AcceptButton = styled.button`
  flex: 1;
  height: 36px;
  background: var(--brand);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DeclineButton = styled.button`
  flex: 1;
  height: 36px;
  background: transparent;
  color: var(--status-cancelled-text);
  border: 1px solid var(--status-cancelled-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--status-cancelled-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AdminWaiting = styled.div`
  padding: 14px 18px;
  background: var(--status-pending-bg, #fffbeb);
  border: 1px dashed var(--status-pending-border);
  border-radius: 12px;
  font-size: 13px;
  color: var(--status-pending-text);
  text-align: center;
`;
