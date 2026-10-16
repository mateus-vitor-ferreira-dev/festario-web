import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`;

export const Label = styled.label`
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
`;

export const Input = styled.input<{ $error?: boolean }>`
    width: 100%;
    height: var(--control-h);
    padding: 0 14px;
    border-radius: var(--radius-md);
    border: 1px solid ${({ $error }) => ($error ? "var(--color-error)" : "var(--border-medium)")};
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--text-base);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &::placeholder {
        color: var(--text-faint);
    }

    &:hover:not(:focus) {
        border-color: var(--text-faint);
    }

    &:focus {
        border-color: ${({ $error }) => ($error ? "var(--color-error)" : "var(--brand)")};
        box-shadow: var(--focus-ring);
        background: var(--bg-surface);
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px var(--bg-surface) inset;
        -webkit-text-fill-color: var(--text-primary);
        caret-color: var(--text-primary);
    }
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

export const Prefix = styled.span`
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    user-select: none;
`;

export const Divider = styled.span`
    width: 1px;
    height: 20px;
    background-color: var(--border-medium);
    flex-shrink: 0;
`;

export const InnerInput = styled.input`
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

export const ToggleButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-faint);
    flex-shrink: 0;
    transition: color 0.2s;

    &:hover {
        color: var(--text-secondary);
    }
`;

export const Error = styled.span`
    font-size: var(--text-xs);
    color: var(--color-error);
`;
