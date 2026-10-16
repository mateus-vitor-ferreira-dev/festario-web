import styled from "styled-components";

import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  --salon-accent: var(--card-salon, var(--brand));

  [data-theme="dark"] & {
    --salon-accent: var(--card-salon-dark, var(--brand-mid));
  }

  display: flex;
  flex-direction: column;
  gap: 24px;

  /* espaço para o botão de chat flutuante não cobrir o último "Reservar" */
  ${media.md} {
    gap: 20px;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const BackLink = styled.a`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--brand);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;

  &::before {
    content: "‹";
    margin-right: 6px;
    font-size: 1.3em;
    line-height: 1;
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
`;

export const Status = styled.p`
  padding: 40px 0;
  color: var(--text-muted);
`;

export const Notice = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 60ch;
  padding: 8px 0 24px;

  h1 {
    font-size: var(--text-2xl);
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    line-height: 1.6;
  }
`;

/* ─── Apresentação ─── */

/** A faixa de cima leva a cor do salão: é o primeiro sinal de que a pessoa entrou num salão específico. */
export const Hero = styled.header`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  border-top: 6px solid var(--salon-accent);
  background: var(--bg-surface);

  ${media.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 16px;
  }
`;

export const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const Name = styled.h1`
  font-size: var(--text-3xl);
  line-height: 1.1;
  color: var(--text-primary);
  overflow-wrap: anywhere;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Place = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  color: var(--text-muted);
  font-size: var(--text-base);
`;

export const Distance = styled.span`
  color: var(--text-primary);
  font-weight: 700;
  font-variant-numeric: lining-nums;
`;

export const Facts = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 3px 12px;
    border-radius: var(--radius-pill);
    background: var(--bg-muted);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-variant-numeric: lining-nums;
  }

  strong {
    color: var(--text-primary);
  }
`;

export const Contacts = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 0;
  padding: 0;
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--brand);
    font-weight: 700;
    font-size: var(--text-sm);
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }

  a:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
`;

export const ManagerNote = styled.p`
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--status-info-border);
  background: var(--status-info-bg);
  color: var(--status-info-text);
  font-size: var(--text-sm);
  line-height: 1.5;
`;

/* ─── Espaços ─── */

export const SectionTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
`;

export const Venues = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Venue = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const VenueCoverSlot = styled.div`
  min-width: 0;

  > div {
    height: 100%;
    min-height: 220px;
  }

  ${media.md} {
    > div {
      height: auto;
      min-height: 0;
    }
  }
`;

export const VenueBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 24px;
  min-width: 0;

  ${media.sm} {
    padding: 16px;
  }
`;

export const VenueName = styled.h3`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  line-height: 1.2;
  color: var(--text-primary);
`;

export const VenuePlace = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

export const VenueDescription = styled.p`
  max-width: 65ch;
  color: var(--text-secondary);
  line-height: 1.6;
`;

export const VenueActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 8px;

  ${media.sm} {
    > * {
      flex: 1 1 100%;
    }
  }
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border-radius: var(--radius-md);
  font: inherit;
  font-size: var(--text-base);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  border: 1px solid var(--brand);
  background: var(--brand);
  color: var(--on-brand);

  &:hover {
    background: var(--brand-dark);
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase}
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-primary);

  &:hover {
    border-color: var(--brand-border);
  }
`;
