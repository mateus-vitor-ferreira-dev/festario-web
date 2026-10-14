import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* Flutua sobre a página: única peça do grupo com sombra */
export const Fab = styled.button`
  position: fixed;
  bottom: max(28px, env(safe-area-inset-bottom));
  right: max(28px, env(safe-area-inset-right));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--brand);
  color: var(--on-brand);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-dark);
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 3px;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  ${media.md} {
    bottom: max(16px, env(safe-area-inset-bottom));
    right: max(16px, env(safe-area-inset-right));
  }
`;

export const Window = styled.div`
  position: fixed;
  bottom: 96px;
  right: 28px;
  width: 360px;
  height: 500px;
  max-height: calc(100vh - 120px);
  max-height: calc(100dvh - 120px);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;

  ${media.md} {
    bottom: calc(max(16px, env(safe-area-inset-bottom)) + 68px);
    right: max(16px, env(safe-area-inset-right));
    max-height: calc(100vh - 104px);
    max-height: calc(100dvh - 104px);
  }

  /* Celular: folha de tela cheia, cobre o FAB e expõe o próprio botão fechar */
  ${media.sm} {
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border: none;
    border-radius: 0;
    z-index: 1001;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 8px 10px 18px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;

  ${media.sm} {
    padding-top: max(10px, env(safe-area-inset-top));
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
`;

export const HeaderTitle = styled.span`
  min-width: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
`;

export const CloseBtn = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-muted);
    color: var(--text-primary);
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

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  background: var(--bg-page);
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
  max-width: 84%;
  padding: 10px 14px;
  border-radius: ${({ $role }) =>
    $role === "user"
      ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
      : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)"};
  background: ${({ $role }) => ($role === "user" ? "var(--brand)" : "var(--bg-surface)")};
  border: 1px solid ${({ $role }) => ($role === "user" ? "transparent" : "var(--border-default)")};
  color: ${({ $role }) => ($role === "user" ? "var(--on-brand)" : "var(--text-primary)")};
  font-size: var(--text-base);
  line-height: 1.5;
  align-self: ${({ $role }) => ($role === "user" ? "flex-end" : "flex-start")};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const InputRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border-default);
  background: var(--bg-surface);
  flex-shrink: 0;

  ${media.sm} {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
`;

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-surface);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const SendBtn = styled.button`
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
