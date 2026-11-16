import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { media } from "../../styles/breakpoints";

/* ─── Bandeirinhas ─── */

/**
 * Cada categoria é uma bandeirinha de festa junina pendurada no mesmo cordão: a imagem do logo do
 * Festário vira o filtro. As cores seguem a ordem anil, milho, pitanga, que se repete.
 */
export const Bunting = styled.div`
  position: relative;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -4px;
  padding: 0 4px 6px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const BuntingList = styled.ul`
  position: relative;
  display: flex;
  gap: 6px;
  width: max-content;
  min-width: 100%;
  margin: 0;
  padding: 10px 0 0;
  list-style: none;

  /* o cordão */
  &::before {
    content: "";
    position: absolute;
    top: 6px;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 2px;
    background: var(--border-medium);
  }
`;

const FLAG_COLORS = [
    css`--flag-bg: var(--brand); --flag-ink: var(--on-brand);`,
    css`--flag-bg: var(--gold); --flag-ink: #27357e;`,
    css`--flag-bg: var(--festive); --flag-ink: #ffffff;`,
];

export const Flag = styled.button<{ $index: number; $active: boolean }>`
  ${({ $index }) => FLAG_COLORS[$index % FLAG_COLORS.length]}
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 92px;
  min-height: 68px;
  padding: 12px 12px 22px;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  color: var(--flag-ink);
  background: var(--flag-bg);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%);
  transform-origin: top center;
  transform: translateY(${({ $active }) => ($active ? "6px" : "0")});
  opacity: ${({ $active }) => ($active ? 1 : 0.82)};
  transition: transform 0.18s var(--ease-out), opacity 0.18s ease;

  &:hover {
    opacity: 1;
  }

  /* o clip-path corta o contorno: o foco vira um sublinhado dentro da bandeira */
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 -3px 0 0 var(--flag-ink), inset 0 3px 0 0 var(--flag-ink);
    opacity: 1;
  }

  &[aria-pressed="true"]::after {
    content: "";
    position: absolute;
    top: 6px;
    left: 50%;
    width: 6px;
    height: 6px;
    margin-left: -3px;
    border-radius: 50%;
    background: var(--flag-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  ${media.sm} {
    min-width: 84px;
    font-size: var(--text-xs);
  }
`;

/* ─── Card do prestador ─── */

export const CardLink = styled(Link)`
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
`;

export const CardCover = styled.div`
  position: relative;
`;

export const Badge = styled.span<{ $tone?: "brand" | "gold" }>`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 700;
  ${({ $tone }) => ($tone === "gold"
        ? css`background: var(--gold); color: #27357e;`
        : css`background: var(--bg-surface); color: var(--text-primary);`)}
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px 18px;
`;

export const CardCategories = styled.p`
  color: var(--festive);
  font-size: var(--text-sm);
  font-weight: 700;

  [data-theme="dark"] & {
    color: var(--gold-text);
  }
`;

export const CardName = styled.h3`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  line-height: 1.2;
  color: var(--text-primary);
`;

export const CardMeta = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

export const CardPrice = styled.p`
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: var(--text-sm);

  strong {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
`;

export const CardNote = styled.p`
  padding: 8px 10px;
  border-left: 3px solid var(--gold);
  background: var(--gold-subtle);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
`;
