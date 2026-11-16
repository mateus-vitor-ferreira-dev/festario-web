import styled from "styled-components";

import { media } from "../../styles/breakpoints";

export const PreviewNote = styled.p`
  padding: 12px 16px;
  border-left: 4px solid var(--gold);
  background: var(--gold-subtle);
  color: var(--text-secondary);

  a {
    color: var(--brand);
    font-weight: 700;
  }
`;

/** Portfólio à esquerda, o pedido de orçamento fixo à direita; no celular o pedido vem depois. */
export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 40px;
  align-items: start;

  ${media.lg} {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Categories = styled.p`
  color: var(--festive);
  font-weight: 700;

  [data-theme="dark"] & {
    color: var(--gold-text);
  }
`;

export const Name = styled.h1`
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  line-height: 1.1;
  color: var(--text-primary);

  ${media.md} {
    font-size: var(--text-3xl);
  }
`;

export const Facts = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-secondary);

  strong {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
`;

export const Recommended = styled.p`
  color: var(--text-secondary);

  a {
    color: var(--brand);
    font-weight: 700;
  }
`;

export const Description = styled.p`
  max-width: 68ch;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-line;
`;

export const Packages = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--border-default);

  li {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-default);
  }

  h3 {
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  p {
    margin-top: 4px;
    max-width: 60ch;
    color: var(--text-muted);
    line-height: 1.6;
  }

  ${media.sm} {
    li {
      flex-direction: column;
      gap: 8px;
    }
  }
`;

export const PackagePrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;

  strong {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--text-primary);
  }

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  ${media.sm} {
    align-items: flex-start;
  }
`;

export const Instagram = styled.a`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--brand);
  font-weight: 700;
`;

export const Aside = styled.aside`
  position: sticky;
  top: 96px;

  ${media.lg} {
    position: static;
  }
`;

export const QuoteBox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  border: 1px solid var(--border-default);
  border-top: 4px solid var(--festive);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);

  h2 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--text-primary);
  }

  > p {
    color: var(--text-muted);
    line-height: 1.6;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-secondary);
  }

  input, select, textarea {
    min-height: var(--control-h);
    padding: 10px 12px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: var(--bg-field);
    color: var(--text-primary);
    font: inherit;
  }

  textarea {
    resize: vertical;
    line-height: 1.5;
  }

  input:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 1px;
  }
`;

export const QuoteError = styled.p`
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--status-error-bg);
  color: var(--status-error-text);
  font-size: var(--text-sm);
`;

export const QuotePrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  &:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
`;
