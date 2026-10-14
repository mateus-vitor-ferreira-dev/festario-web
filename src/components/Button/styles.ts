import styled from "styled-components";

export const Container = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  [data-theme="dark"] &:hover:not(:disabled) {
    background: var(--brand-mid);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
