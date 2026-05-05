import styled from "styled-components";

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: 12px;
    overflow: hidden;
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-default);
`;

export const MonthLabel = styled.span`
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: capitalize;
`;

export const NavButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border-default);
    border-radius: 8px;
    background: var(--bg-muted);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.15s, color 0.15s;

    &:hover:not(:disabled) {
        background: var(--brand);
        color: #fff;
        border-color: var(--brand);
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 8px 12px 12px;
    gap: 3px;
`;

export const WeekdayLabel = styled.div`
    text-align: center;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    padding: 6px 0 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

export const Day = styled.button<{ $empty?: boolean; $past?: boolean; $blocked?: boolean; $occupied?: boolean; $selected?: boolean; $available?: boolean }>`
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    position: relative;

    ${({ $empty }) => $empty && `
        background: transparent;
        cursor: default;
        pointer-events: none;
    `}

    ${({ $past }) => $past && `
        color: var(--text-faint);
        background: transparent;
        cursor: not-allowed;
    `}

    ${({ $blocked }) => $blocked && `
        background: var(--calendar-blocked-bg);
        color: var(--calendar-blocked-text);
        cursor: not-allowed;
        border: 1px solid var(--calendar-blocked-border);
    `}

    ${({ $occupied }) => $occupied && `
        background: var(--calendar-occupied-bg);
        color: var(--calendar-occupied-text);
        cursor: not-allowed;
        border: 1px solid var(--calendar-occupied-border);
    `}

    ${({ $selected }) => $selected && `
        background: var(--brand) !important;
        color: #fff !important;
        cursor: pointer;
        font-weight: 700;
        border: none !important;
    `}

    ${({ $available }) => $available && `
        background: var(--bg-muted);
        color: var(--text-primary);

        &:hover {
            background: var(--brand-subtle);
            color: var(--brand);
            border: 1px solid var(--brand-border);
        }
    `}
`;

export const LoadingOverlay = styled.div`
    padding: 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
`;

export const Legend = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border-top: 1px solid var(--border-default);
    background: var(--bg-muted);
`;

export const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--text-muted);
`;

export const LegendDot = styled.span<{ $variant?: string }>`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;

    ${({ $variant }) => {
        switch ($variant) {
            case "available": return "background: var(--bg-muted); border: 1px solid var(--border-medium);";
            case "selected": return "background: var(--brand);";
            case "occupied": return "background: var(--calendar-occupied-bg); border: 1px solid var(--calendar-occupied-border);";
            case "blocked": return "background: var(--calendar-blocked-bg); border: 1px solid var(--calendar-blocked-border);";
            default: return "";
        }
    }}
`;
