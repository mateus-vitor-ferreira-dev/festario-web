import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  /* espaço para o botão de chat flutuante não cobrir o último card */
  ${media.md} {
    gap: 20px;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  line-height: 1.1;
  color: var(--text-primary);

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Lead = styled.p`
  max-width: 60ch;
  color: var(--text-muted);
  font-size: var(--text-base);
  line-height: 1.6;
`;

/* ─── Origem da distância ─── */

export const OriginBar = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-lg);
  background: var(--brand-subtle);

  ${media.sm} {
    padding: 14px 16px;
  }
`;

export const OriginSummary = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px 14px;
`;

export const OriginIcon = styled.span<{ $active: boolean }>`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  background: ${({ $active }) => ($active ? "var(--brand)" : "var(--bg-surface)")};
  color: ${({ $active }) => ($active ? "var(--on-brand)" : "var(--brand)")};
  border: 1px solid var(--brand-border);

  svg {
    width: var(--icon-md);
    height: var(--icon-md);
  }
`;

export const OriginTitle = styled.h2`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  line-height: 1.25;
  color: var(--text-primary);
`;

export const OriginHint = styled.p`
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
`;

const linkButton = css`
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: var(--brand);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
`;

export const OriginToggle = styled.button`
  ${linkButton}
`;

export const OriginLink = styled.button`
  ${linkButton}
`;

export const OriginOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  padding-left: 54px;

  ${media.md} {
    padding-left: 0;
  }
`;

export const OriginButton = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid var(--brand);
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

export const CepForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
  }

  input {
    width: 9.5em;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--text-base);
    font-variant-numeric: tabular-nums;

    &:focus-visible {
      outline: 2px solid var(--brand);
      outline-offset: 1px;
    }
  }

  ${media.sm} {
    width: 100%;

    input {
      flex: 1;
      width: auto;
      min-width: 0;
    }
  }
`;

export const OriginError = styled.p`
  padding-left: 54px;
  font-size: var(--text-sm);
  color: var(--status-error-text);
  line-height: 1.5;

  ${media.md} {
    padding-left: 0;
  }
`;

/* ─── Lista ─── */

export const FiltersSlot = styled.div`
  scroll-margin-top: 96px;

  &:focus {
    outline: none;
  }
`;

export const Status = styled.p`
  padding: 40px 0;
  color: var(--text-muted);
  font-size: var(--text-base);
`;

/** É o título da lista (h2), para os cards (h3) ficarem na ordem certa de títulos. */
export const Count = styled.h2`
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;
`;

export const Grid = styled.ul<{ $busy?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;

  ${media.sm} {
    gap: 16px;
  }
`;

export const CardItem = styled.li`
  min-width: 0;
`;

export const CardLink = styled(Link)`
  --salon-accent: var(--card-salon, var(--brand));

  [data-theme="dark"] & {
    --salon-accent: var(--card-salon-dark, var(--brand-mid));
  }

  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--brand-border);
  }

  &:focus-visible {
    outline: 3px solid var(--brand);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const CardCover = styled.div`
  position: relative;
`;

/** A distância fica sobre a capa: é o que decide entre dois salões parecidos. */
export const DistanceBadge = styled.span`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 700;
  font-variant-numeric: lining-nums tabular-nums;
  box-shadow: var(--shadow-sm);
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 18px;
  flex: 1;
`;

export const CardHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const CardName = styled.h3`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  line-height: 1.2;
  color: var(--text-primary);
  overflow-wrap: anywhere;
`;

export const CardPlace = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.4;
`;

export const CardFacts = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 2px 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-variant-numeric: lining-nums;

  dt {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  dd {
    margin: 0;
  }

  strong {
    color: var(--text-primary);
    font-weight: 700;
  }
`;

export const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: auto 0 0;
  padding: 4px 0 0;
  list-style: none;

  li {
    padding: 2px 10px;
    border-radius: var(--radius-pill);
    background: var(--bg-muted);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
  }
`;
