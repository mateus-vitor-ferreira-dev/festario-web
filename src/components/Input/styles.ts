import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
`;

export const Label = styled.label`
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
`;

export const Input = styled.input<{ $error?: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid ${({ $error }) => ($error ? "var(--color-error)" : "var(--border-medium)")};
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: 0.2s;

    &::placeholder {
        color: var(--text-faint);
    }

    &:focus {
        border-color: ${({ $error }) => ($error ? "var(--color-error)" : "var(--brand)")};
        box-shadow: 0 0 0 4px rgba(31, 79, 65, 0.12);
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
    height: 48px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid ${({ $error }) => ($error ? "var(--color-error)" : "var(--border-medium)")};
    background: var(--bg-surface);
    gap: 10px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: ${({ $error }) => ($error ? "var(--color-error)" : "var(--brand)")};
        box-shadow: 0 0 0 4px rgba(31, 79, 65, 0.12);
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
    font-size: 12px;
    color: var(--color-error);
`;
