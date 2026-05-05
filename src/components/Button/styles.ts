import styled from "styled-components";

export const Container = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--brand);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;
