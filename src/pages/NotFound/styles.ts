import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 32px;
  background: var(--bg-page);

  ${media.sm} {
    padding: 16px;
  }
`;

/* Estado único: centralizado faz sentido aqui */
export const Card = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  ${media.sm} {
    padding: 36px 20px;
  }
`;

export const Code = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1;
  color: var(--text-faint);
  font-variant-numeric: lining-nums tabular-nums;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-primary);

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 380px;
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
`;

export const PrimaryButton = styled.button`
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
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-dark);
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--brand);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
  }
`;
