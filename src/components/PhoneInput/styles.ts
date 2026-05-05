import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    position: relative;
`;

export const Label = styled.label`
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
`;

export const InputWrapper = styled.div<{ $error?: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid ${({ $error }) => ($error ? "var(--color-error)" : "var(--border-medium)")};
    background: var(--bg-surface);
    gap: 8px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: ${({ $error }) => ($error ? "var(--color-error)" : "var(--brand)")};
        box-shadow: 0 0 0 4px rgba(31, 79, 65, 0.12);
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
    color: var(--text-primary);
    font-size: 14px;
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
    font-size: 13px;
    color: var(--text-secondary);
`;

export const Chevron = styled.span<{ $open: boolean }>`
    font-size: 10px;
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
    font-size: 14px;
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
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 100;
    overflow: hidden;
`;

export const SearchInput = styled.input`
    width: 100%;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid var(--border-medium);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
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
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
    transition: background 0.15s;

    &:hover {
        background: var(--bg-hover, rgba(0,0,0,0.04));
    }

    ${({ $selected }) =>
        $selected &&
        `
        background: var(--bg-hover, rgba(0,0,0,0.06));
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
    font-size: 12px;
    color: var(--color-error);
`;
