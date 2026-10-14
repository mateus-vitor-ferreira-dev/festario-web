import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  min-height: 60dvh;
  padding: 32px 0;
`;

export const Card = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 48px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  ${media.sm} {
    padding: 32px 24px;
  }
`;

export const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

export const XIcon = styled.div`
  width: 28px;
  height: 28px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 3px;
    background: var(--text-muted);
    border-radius: 2px;
    top: 50%;
    left: 50%;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 380px;
`;

export const Hint = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 380px;
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-default);
`;

export const PrimaryButton = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-dark);
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--brand);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;
