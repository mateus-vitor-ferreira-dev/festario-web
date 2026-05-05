import styled from "styled-components";

export const Container = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(to bottom, #236051, var(--brand-dark));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.10);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: box-shadow 0.15s ease, transform 0.1s ease, opacity 0.15s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.10);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
