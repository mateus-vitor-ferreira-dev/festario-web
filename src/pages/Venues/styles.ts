import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Page shell ─── */

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  /* espaço para o botão de chat flutuante não cobrir o último "Reservar" */
  ${media.md} {
    gap: 24px;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
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
  gap: 6px;
  min-width: 0;
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
  color: var(--text-muted);
  font-size: var(--text-base);
  line-height: 1.6;
  max-width: 640px;
`;

export const Counter = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;
  white-space: nowrap;
`;

/* ─── Venue cards ─── */

export const FiltersSlot = styled.div`
  scroll-margin-top: 96px;

  &:focus {
    outline: none;
  }
`;

export const Grid = styled.section<{ $busy?: boolean }>`
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;

  &:empty {
    display: none;
  }

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  gap: 24px;

  ${media.sm} {
    gap: 16px;
  }
`;

export const Card = styled.article`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;

  ${media.sm} {
    padding: 16px;
    gap: 20px;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const CardTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  min-width: 0;
  overflow-wrap: anywhere;
`;

/* Preço: rótulo discreto + valor em display */
export const PlansTag = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1.1;

  span {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  strong {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const CardDescription = styled.p`
  color: var(--text-medium);
  line-height: 1.6;
  font-size: var(--text-base);
`;

/* Fatos principais: capacidade e localização, divididos por hairlines */
export const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);

  li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 16px 12px 0;
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary);
    min-width: 0;
    overflow-wrap: anywhere;

    & + li {
      padding-left: 16px;
      border-left: 1px solid var(--border-default);
    }

    strong {
      order: -1;
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-muted);
    }
  }
`;

/* Comodidades — linha discreta */
export const Amenities = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
`;

export const Amenity = styled.li<{ $available?: boolean }>`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--text-sm);
  color: ${({ $available }) => ($available ? "var(--text-secondary)" : "var(--text-faint)")};

  &::before {
    content: "";
    align-self: center;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({ $available }) => ($available ? "var(--brand)" : "transparent")};
    border: 1px solid ${({ $available }) => ($available ? "var(--brand)" : "var(--border-medium)")};
  }

  strong {
    font-weight: 500;
    color: var(--text-secondary);
  }
`;

/* ─── Actions ─── */

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const secondaryButton = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid var(--border-medium);
  background: transparent;
  color: var(--brand);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
`;

export const ActionButton = styled.button`
  ${secondaryButton}

  &:hover:enabled {
    background: var(--brand-subtle);
    border-color: var(--brand-border);
  }

  &:disabled {
    color: var(--text-faint);
    border-color: var(--border-default);
    cursor: not-allowed;
  }
`;

export const ActionLink = styled.a`
  ${secondaryButton}

  &:hover {
    background: var(--brand-subtle);
    border-color: var(--brand-border);
  }
`;

export const PrimaryButton = styled.button`
  min-height: 44px;
  padding: 0 20px;
  border: none;
  background: var(--brand);
  color: var(--on-brand);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  flex: 1;

  &:hover {
    background: var(--brand-dark);
  }
`;

/* ─── Loading / empty ─── */

const statePanel = `
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h2 {
    font-size: var(--text-xl);
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    font-size: var(--text-base);
    max-width: 420px;
    line-height: 1.6;
  }
`;

export const LoadingCard = styled.div`
  ${statePanel}
  gap: 12px;

  &::before {
    content: '';
    width: 36px;
    height: 36px;
    margin-bottom: 4px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spin} 0.8s linear infinite;
  }
`;

export const EmptyState = styled.div`
  ${statePanel}
  gap: 8px;
`;

export const EmptyLink = styled.a`
  margin-top: 12px;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 3px;
`;
