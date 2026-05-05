import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Fab = styled.button`
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--brand);
  color: white;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(31, 79, 65, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
    transform: scale(1.07);
  }
`;

export const Window = styled.div`
  position: fixed;
  bottom: 92px;
  right: 28px;
  width: 340px;
  height: 480px;
  background: var(--bg-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: 400px) {
    width: calc(100vw - 32px);
    right: 16px;
  }
`;

export const Header = styled.div`
  background: var(--brand);
  color: white;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "💬";
    font-size: 16px;
  }
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 4px;
  }
`;

export const Bubble = styled.div<{ $role: string }>`
  max-width: 82%;
  padding: 10px 13px;
  border-radius: ${({ $role }) =>
    $role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
  background: ${({ $role }) => ($role === "user" ? "var(--brand)" : "var(--bg-muted)")};
  color: ${({ $role }) => ($role === "user" ? "#fff" : "var(--text-primary)")};
  font-size: 13.5px;
  line-height: 1.5;
  align-self: ${({ $role }) => ($role === "user" ? "flex-end" : "flex-start")};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const InputRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--bg-muted);
`;

export const Input = styled.input`
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  font-size: 13.5px;
  color: var(--text-primary);
  background: var(--bg-page);
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    background: var(--bg-surface);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const SendBtn = styled.button`
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: var(--brand);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
