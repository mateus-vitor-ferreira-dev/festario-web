import styled, { css } from "styled-components";
import { media } from "../../styles/breakpoints";

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding-top: 4px;

  ${media.md} {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

export const Summary = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;

  ${media.md} {
    text-align: center;
  }
`;

export const Nav = styled.nav`
  margin-left: auto;

  ${media.md} {
    margin-left: 0;
  }
`;

export const List = styled.ul`
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;

  ${media.md} {
    justify-content: space-between;
  }
`;

const control = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    border-color: var(--brand);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    width: var(--icon-sm);
    height: var(--icon-sm);
    flex-shrink: 0;
  }
`;

export const StepButton = styled.button`
  ${control}
  gap: 4px;
  padding: 0 14px;
`;

export const PageButton = styled.button<{ $current?: boolean }>`
  ${control}
  min-width: 44px;
  padding: 0 10px;

  ${({ $current }) => $current && css`
    background: var(--brand);
    border-color: var(--brand);
    color: var(--on-brand);
    cursor: default;

    &:hover:not(:disabled) {
      color: var(--on-brand);
    }
  `}
`;

export const NumberItem = styled.li`
  ${media.md} {
    display: none;
  }
`;

export const Ellipsis = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  color: var(--text-muted);
`;

export const CompactItem = styled.li<{ $always?: boolean }>`
  display: ${({ $always }) => ($always ? "block" : "none")};
  padding: 0 8px;

  ${media.md} {
    display: block;
  }
`;

export const Compact = styled.span`
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-variant-numeric: lining-nums tabular-nums;
  white-space: nowrap;
`;
