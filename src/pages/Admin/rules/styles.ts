import styled, { css } from "styled-components";

import { media } from "../../../styles/breakpoints";

/* ── Área "Regras do salão": menu de seções + conteúdo ─────────────────────── */

export const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;

  ${media.lg} {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
`;

export const SectionNav = styled.nav`
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  ${media.lg} {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 -4px;
    padding: 0 4px 4px;
  }
`;

export const SectionLink = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;

  small {
    font-size: var(--text-xs);
    font-weight: 400;
    color: var(--text-muted);
  }

  &:hover {
    background: var(--brand-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  ${({ $active }) => $active && css`
    background: var(--brand-subtle);
    border-color: var(--brand-border);
    color: var(--brand);
  `}

  ${media.lg} {
    small {
      display: none;
    }
  }
`;

export const Intro = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  max-width: 68ch;
  line-height: 1.5;
`;

/* ── Primeiro acesso: passo a passo (é uma sequência de fato) ────────────── */

export const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 24px;
  display: grid;
  gap: 16px;
  counter-reset: step;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);

  h3 {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
`;

export const Step = styled.li<{ $done?: boolean }>`
  counter-increment: step;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  align-items: start;

  &::before {
    content: counter(step);
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--text-lg);
    background: ${({ $done }) => ($done ? "var(--brand)" : "var(--brand-subtle)")};
    color: ${({ $done }) => ($done ? "var(--on-brand)" : "var(--brand)")};
  }

  strong {
    display: block;
    color: var(--text-primary);
    font-size: var(--text-base);
  }

  p {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-top: 2px;
  }

  button {
    margin-top: 8px;
  }
`;

/* ── Lista de pacotes ───────────────────────────────────────────────────── */

export const PackageList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PackageCard = styled.li<{ $inactive?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 18px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  ${({ $inactive }) => $inactive && css`
    background: var(--bg-muted);
    border-style: dashed;
  `}

  ${media.lg} {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
`;

export const PackageHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  h3 {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1.2;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
`;

export const Price = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--brand);
  font-variant-numeric: lining-nums tabular-nums;
`;

export const Meta = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  overflow-wrap: anywhere;
`;

export const WhenCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

export const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;

  ${media.lg} {
    justify-content: flex-start;
  }
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--bg-muted);
  color: var(--text-secondary);
`;

/* ── Editor ────────────────────────────────────────────────────────────── */

export const EditorLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: start;

  ${media.lg} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Aside = styled.aside`
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);

  h3 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  ${media.lg} {
    position: static;
  }
`;

export const DayPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const DayToggle = styled.button<{ $on: boolean }>`
  min-width: 44px;
  min-height: 44px;
  padding: 0 10px;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${({ $on }) => ($on ? "var(--brand)" : "var(--border-medium)")};
  background: ${({ $on }) => ($on ? "var(--brand)" : "transparent")};
  color: ${({ $on }) => ($on ? "var(--on-brand)" : "var(--text-secondary)")};

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

/* Linha de item no pacote: nome + escolha Indisponível / Incluso / Adicional */
export const ItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default);

  &:last-child {
    border-bottom: none;
  }

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ItemName = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: var(--text-primary);
    font-size: var(--text-base);
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

export const Segmented = styled.div`
  display: inline-flex;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: fit-content;

  ${media.sm} {
    width: 100%;
    & > button {
      flex: 1;
    }
  }
`;

export const SegmentButton = styled.button<{ $on: boolean }>`
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-right: 1px solid var(--border-medium);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  background: ${({ $on }) => ($on ? "var(--brand)" : "transparent")};
  color: ${({ $on }) => ($on ? "var(--on-brand)" : "var(--text-secondary)")};

  &:last-child {
    border-right: none;
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: -2px;
  }
`;

export const InlineFields = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
`;

export const NumberField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);

  input,
  select {
    height: 44px;
    width: 140px;
    box-sizing: border-box;
  }
`;

export const Errors = styled.ul`
  margin: 0;
  padding: 12px 16px 12px 32px;
  border: 1px solid var(--status-error-border);
  background: var(--status-error-bg);
  color: var(--status-error-text);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
`;

export const PreviewLines = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  margin: 0;
  font-size: var(--text-sm);

  dt {
    color: var(--text-secondary);
  }

  dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--text-primary);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 96px;
  padding: 10px 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  line-height: 1.5;
  resize: vertical;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 1px;
  }
`;

export const Sentences = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
`;

export const PreviewName = styled.p`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  overflow-wrap: anywhere;
`;

/** Modelos de pacote no primeiro passo: botões grandes com o que cada um traz. */
export const Templates = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  > span {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    min-height: 64px;
    margin: 0;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--bg-field);
    color: var(--text-primary);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  button:hover {
    border-color: var(--brand);
  }

  button:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  strong {
    font-size: var(--text-sm);
  }

  small {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.4;
  }
`;
