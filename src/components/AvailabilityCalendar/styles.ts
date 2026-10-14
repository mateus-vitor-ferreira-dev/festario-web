import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 12px 12px 16px;

    ${media.sm} {
        padding: 8px 8px 8px 12px;
    }
    border-bottom: 1px solid var(--border-default);
`;

export const MonthLabel = styled.span`
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;

    &::first-letter {
        text-transform: uppercase;
    }
`;

export const NavButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: var(--text-xl);
    line-height: 1;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
        background: var(--brand-subtle);
        color: var(--brand);
        border-color: var(--brand-border);
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
`;

export const NavGroup = styled.div`
    display: flex;
    gap: 6px;
    flex-shrink: 0;
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    padding: 8px 12px 12px;
    gap: 4px;

    /* 360px: sem padding lateral e gap mínimo → células ≥40px de largura */
    ${media.sm} {
        padding: 6px 0 8px;
        gap: 2px;
    }
`;

export const WeekdayLabel = styled.div`
    text-align: center;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
    padding: 6px 0 4px;
`;

export const Day = styled.button<{ $empty?: boolean; $past?: boolean; $blocked?: boolean; $occupied?: boolean; $selected?: boolean; $available?: boolean }>`
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    font-variant-numeric: lining-nums tabular-nums;
    line-height: 1;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    position: relative;

    ${({ $empty }) => $empty && `
        cursor: default;
        pointer-events: none;
    `}

    ${({ $past }) => $past && `
        color: var(--text-faint);
        cursor: not-allowed;
        opacity: 0.7;
    `}

    ${({ $blocked }) => $blocked && `
        background: var(--calendar-blocked-bg);
        color: var(--calendar-blocked-text);
        border-color: var(--calendar-blocked-border);
        cursor: not-allowed;
    `}

    ${({ $occupied }) => $occupied && `
        background: var(--calendar-occupied-bg);
        color: var(--calendar-occupied-text);
        border-color: var(--calendar-occupied-border);
        cursor: not-allowed;
    `}

    ${({ $selected }) => $selected && `
        background: var(--brand) !important;
        color: var(--on-brand) !important;
        border-color: var(--brand) !important;
        font-weight: 700;
    `}

    ${({ $available }) => $available && `
        background: var(--bg-muted);

        &:hover {
            background: var(--brand-subtle);
            color: var(--brand);
            border-color: var(--brand-border);
        }
    `}

    ${media.sm} {
        min-width: 0;
        font-size: var(--text-base);
    }
`;

export const LoadingOverlay = styled.div`
    padding: 32px 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: var(--text-sm);
`;

export const Legend = styled.div`
    display: flex;
    gap: 8px 20px;
    flex-wrap: wrap;
    padding: 12px 16px;

    ${media.sm} {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 12px;
        padding: 12px;
    }
    border-top: 1px solid var(--border-default);
`;

export const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
`;

export const LegendDot = styled.span<{ $variant?: string }>`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;

    ${({ $variant }) => {
        switch ($variant) {
            case "available": return "background: var(--bg-muted); border: 1px solid var(--border-medium);";
            case "selected": return "background: var(--brand); border: 1px solid var(--brand);";
            case "occupied": return "background: var(--calendar-occupied-bg); border: 1px solid var(--calendar-occupied-border);";
            case "blocked": return "background: var(--calendar-blocked-bg); border: 1px solid var(--calendar-blocked-border);";
            default: return "";
        }
    }}
`;
