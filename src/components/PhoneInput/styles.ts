import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    position: relative;
`;

export const Label = styled.label`
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
`;

export const InputWrapper = styled.div<{ $error?: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--control-h);
    padding: 0 14px;
    border-radius: var(--radius-md);
    border: 1px solid ${({ $error }) => ($error ? "var(--color-error)" : "var(--border-medium)")};
    background: var(--bg-surface);
    gap: 8px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: ${({ $error }) => ($error ? "var(--color-error)" : "var(--brand)")};
        box-shadow: var(--focus-ring);
    }
`;

export const CountryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    min-height: 44px;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 500;
    user-select: none;

    &:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
    }
`;

export const Flag = styled.span`
    font-size: 20px;
    line-height: 1;
`;

export const DialCode = styled.span`
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
`;

export const Chevron = styled.span<{ $open: boolean }>`
    font-size: var(--text-2xs);
    color: var(--text-faint);
    transition: transform 0.15s;
    transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const Divider = styled.span`
    width: 1px;
    height: 20px;
    background-color: var(--border-medium);
    flex-shrink: 0;
`;

export const PhoneNumberInput = styled.input`
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    font-size: var(--text-base);
    background: transparent;
    color: var(--text-primary);
    padding: 0;
    min-width: 0;

    &::placeholder {
        color: var(--text-faint);
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px var(--bg-surface) inset;
        -webkit-text-fill-color: var(--text-primary);
        caret-color: var(--text-primary);
    }
`;

export const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    background: var(--bg-surface);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    overflow: hidden;
    max-width: 100%;
    min-width: 0;
`;

export const SearchInput = styled.input`
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid var(--border-medium);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--text-base);
    outline: none;

    &::placeholder {
        color: var(--text-faint);
    }
`;

export const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 6px 0;
    max-height: 220px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--border-medium);
        border-radius: 4px;
    }
`;

export const ListItem = styled.li<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    min-height: 44px;
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--text-primary);
    transition: background 0.15s;

    &:hover {
        background: var(--bg-muted);
    }

    ${({ $selected }) =>
        $selected &&
        `
        background: var(--brand-subtle);
        color: var(--brand);
        font-weight: 600;
    `}
`;

export const CountryName = styled.span`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const Error = styled.span`
    font-size: var(--text-xs);
    color: var(--color-error);
`;
