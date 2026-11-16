import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { media } from "../../styles/breakpoints";

/* ─── Bandeirinhas ─── */

/**
 * Cada categoria é uma bandeirinha de festa junina pendurada no mesmo cordão: a imagem do logo do
 * Festário vira o filtro. As cores seguem a ordem anil, milho, pitanga, que se repete.
 */
/* ─── Carrossel de bandeirinhas ─── */

/** Largura de cada bandeira: igual para todas, para o meio do cordão cair sempre no meio de uma. */
const FLAG_WIDTH = 120;
const FLAG_WIDTH_SM = 104;

export const Carousel = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 4px;

  /* o cordão, de ponta a ponta */
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

export const CarouselTrack = styled.ul`
  position: relative;
  display: flex;
  gap: 6px;
  margin: 0;
  /* sobra de meia tela dos dois lados: a primeira e a última também chegam ao meio */
  padding: 10px calc(50% - ${FLAG_WIDTH / 2}px) 18px;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  /* as das pontas somem aos poucos, para o olho ir ao meio */
  mask-image: linear-gradient(to right, transparent, #000 14%, #000 86%, transparent);

  &::-webkit-scrollbar {
    display: none;
  }

  & > li {
    flex: none;
    scroll-snap-align: center;
  }

  ${media.sm} {
    padding-inline: calc(50% - ${FLAG_WIDTH_SM / 2}px);
    mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
  }
`;

export const CarouselArrow = styled.button<{ $side: "left" | "right" }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-top: 6px;
  border: 1px solid var(--border-default);
  border-radius: 50%;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s ease, opacity 0.15s ease;

  & > span {
    margin-top: -3px;
  }

  &:hover:not(:disabled) {
    border-color: var(--brand-border);
  }

  &:focus-visible {
    outline: 3px solid var(--brand);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  ${media.sm} {
    width: 36px;
    height: 36px;
    font-size: 22px;
  }
`;

const FLAG_COLORS = [
    css`--flag-bg: var(--brand); --flag-ink: var(--on-brand);`,
    css`--flag-bg: var(--gold); --flag-ink: #27357e;`,
    css`--flag-bg: var(--festive); --flag-ink: #ffffff;`,
];

/** Destaque pela distância até o meio: a do meio desce no cordão e cresce, as de longe encolhem e apagam. */
const BY_DISTANCE = [
    { y: 10, scale: 1.12, opacity: 1 },
    { y: 0, scale: 0.94, opacity: 0.85 },
    { y: 0, scale: 0.86, opacity: 0.6 },
];

export const Flag = styled.button<{ $index: number; $distance: number }>`
  ${({ $index }) => FLAG_COLORS[$index % FLAG_COLORS.length]}
  position: relative;
  z-index: ${({ $distance }) => ($distance === 0 ? 1 : 0)};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: ${FLAG_WIDTH}px;
  min-height: 72px;
  padding: 12px 10px 22px;
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
  ${({ $distance }) => {
      const d = BY_DISTANCE[Math.min($distance, BY_DISTANCE.length - 1)];
      return css`
        transform: translateY(${d.y}px) scale(${d.scale});
        opacity: ${d.opacity};
      `;
  }}
  transition: transform 0.22s var(--ease-out), opacity 0.22s ease;

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
    width: ${FLAG_WIDTH_SM}px;
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
