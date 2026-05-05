import styled from "styled-components";

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
  font-size: 14px;
`;

export const NewButton = styled.button`
  align-self: flex-start;
  height: 40px;
  padding: 0 20px;
  background: var(--brand);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
`;

export const NewForm = styled.form`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const NewFormTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 12px 14px;
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-faint);
  }

  &:disabled {
    background: var(--bg-surface);
    cursor: not-allowed;
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const SubmitButton = styled.button`
  height: 40px;
  padding: 0 22px;
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
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  height: 40px;
  padding: 0 22px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: var(--text-muted);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NegotiationCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--brand);
  }
`;

export const NegotiationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const NegotiationSubject = styled.strong`
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NegotiationMeta = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

export const LastMessage = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
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
  background: var(--bg-page);
  border: 1px dashed var(--border-medium);
  border-radius: 16px;
  padding: 48px 32px;
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

export const LoadingCard = styled.div`
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 48px;
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    color: var(--text-muted);
    font-size: 14px;
  }
`;
