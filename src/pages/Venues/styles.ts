import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const Header = styled.section`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 34px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const Description = styled.p`
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.6;
  max-width: 680px;
`;

export const Counter = styled.span`
  background: var(--status-paid-bg);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
`;

export const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const Price = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--brand);
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;

  span {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
  }
`;

export const PlansTag = styled.div`
  background: var(--status-paid-bg);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const CardDescription = styled.p`
  color: var(--text-medium);
  line-height: 1.6;
  font-size: 15px;
`;

export const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    background: var(--bg-page);
    border: 1px solid var(--border-default);
    border-radius: 10px;
    font-size: 13px;
    color: var(--text-medium);

    strong {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-faint);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button`
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:enabled {
    background: var(--bg-page);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ActionLink = styled.a`
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-page);
  }
`;

export const PrimaryButton = styled.button`
  border: none;
  background: var(--brand);
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  flex: 1;

  &:hover {
    opacity: 0.92;
  }
`;

export const LoadingCard = styled.div`
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 56px 32px;
  border: 1px solid var(--border-default);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  &::before {
    content: '';
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spin} 0.8s linear infinite;
  }

  h2 {
    font-size: 18px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 300px;
    line-height: 1.6;
  }
`;

export const EmptyState = styled.div`
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 56px 32px;
  border: 1px solid var(--border-default);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  &::before {
    content: '';
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--bg-muted);
    border: 2px dashed var(--border-medium);
  }

  h2 {
    font-size: 18px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    font-size: 14px;
    max-width: 300px;
    line-height: 1.6;
  }
`;
