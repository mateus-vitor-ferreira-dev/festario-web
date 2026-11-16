import styled, { css } from "styled-components";

import { media } from "../../styles/breakpoints";
import type { QuoteStatus } from "../../types";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
`;

export const Intro = styled.header`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  line-height: 1.15;
  color: var(--text-primary);
`;

export const Lead = styled.p`
  max-width: 64ch;
  color: var(--text-secondary);
  line-height: 1.6;
`;

/** Três passos de verdade (cadastrar, mostrar, publicar): a numeração é a ordem. */
export const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: step;

  li {
    counter-increment: step;
    padding: 14px 16px;
    border-left: 3px solid var(--festive);
    background: var(--bg-muted);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  li::before {
    content: counter(step);
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1;
    color: var(--festive);
    margin-bottom: 6px;
  }

  strong {
    color: var(--text-primary);
  }

  ${media.md} {
    grid-template-columns: 1fr;
  }
`;

export const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
`;

export const TopLinks = styled.p`
  margin-top: 6px;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--brand);
    font-weight: 700;
  }
`;

const tones = {
    ok: css`border-color: var(--status-paid-border); background: var(--status-paid-bg); strong { color: var(--status-paid-text); }`,
    draft: css`border-color: var(--gold-border); background: var(--gold-subtle); strong { color: var(--text-primary); }`,
    error: css`border-color: var(--status-error-border); background: var(--status-error-bg); strong { color: var(--status-error-text); }`,
};

export const StatusBar = styled.div<{ $tone: keyof typeof tones }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid;
  border-radius: var(--radius-lg);
  ${({ $tone }) => tones[$tone]}

  p {
    margin-top: 2px;
    color: var(--text-secondary);
  }

  ${media.sm} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const FormError = styled.p`
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--status-error-bg);
  color: var(--status-error-text);
`;

export const Legend = styled.p`
  margin-bottom: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
`;

export const CategoryChecks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-pill);
    cursor: pointer;
    color: var(--text-secondary);
  }

  label:has(input:checked) {
    border-color: var(--brand);
    background: var(--brand-subtle);
    color: var(--text-primary);
    font-weight: 700;
  }

  input {
    accent-color: var(--brand);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-field);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.5;
  resize: vertical;

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 1px;
  }
`;

export const PackageList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--border-default);

  > li {
    padding: 14px 0;
    border-bottom: 1px solid var(--border-default);
  }
`;

export const PackageRow = styled.div<{ $inactive?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  opacity: ${({ $inactive }) => ($inactive ? 0.6 : 1)};

  p {
    margin-top: 4px;
    color: var(--text-muted);
    max-width: 60ch;
  }

  ${media.md} {
    flex-direction: column;
  }
`;

export const PackageSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;

  span {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  ${media.md} {
    align-items: flex-start;
  }
`;

export const PackageFormBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-muted);
`;

export const BusyList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-default);
  }

  div {
    display: flex;
    flex-direction: column;
  }

  strong {
    color: var(--text-primary);
  }

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;

/* ─── Orçamentos ─── */

export const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid ${({ $active }) => ($active ? "var(--brand)" : "var(--border-medium)")};
  border-radius: var(--radius-pill);
  background: ${({ $active }) => ($active ? "var(--brand)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--on-brand)" : "var(--text-secondary)")};
  font: inherit;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
`;

export const Count = styled.span`
  min-width: 22px;
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background: var(--festive);
  color: #ffffff;
  font-size: var(--text-xs);
  text-align: center;
`;

export const QuoteList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const STATUS_COLORS: Record<QuoteStatus, string> = {
    OPEN: "var(--festive)",
    ANSWERED: "var(--brand)",
    ACCEPTED: "var(--gold)",
    HIRED: "var(--status-paid-text)",
    DECLINED: "var(--border-medium)",
    CANCELED: "var(--border-medium)",
    REJECTED: "var(--border-medium)",
};

export const QuoteCard = styled.li<{ $status: QuoteStatus }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border: 1px solid var(--border-default);
  border-left: 4px solid ${({ $status }) => STATUS_COLORS[$status]};
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
`;

export const QuoteHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  ${media.sm} {
    flex-direction: column;
  }
`;

export const QuoteDate = styled.p`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);

  &::first-letter {
    text-transform: uppercase;
  }
`;

export const QuoteWho = styled.p`
  color: var(--text-secondary);
`;

export const StatusTag = styled.span<{ $status: QuoteStatus }>`
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid ${({ $status }) => STATUS_COLORS[$status]};
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 700;
`;

export const Referral = styled.p`
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--gold-subtle);
  color: var(--gold-text);
  font-size: var(--text-sm);
  font-weight: 700;
`;

export const QuoteMessage = styled.p`
  max-width: 70ch;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-line;
`;

export const QuoteMeta = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);

  a {
    color: var(--brand);
    font-weight: 700;
  }
`;

export const Answer = styled.div`
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--brand-subtle);

  strong {
    color: var(--text-primary);
  }

  p {
    margin-top: 4px;
    color: var(--text-secondary);
    white-space: pre-line;
  }
`;

export const InlineForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
`;

export const ContactRow = styled.ul`
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
  }
`;
