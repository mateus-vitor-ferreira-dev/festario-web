import styled from "styled-components";

export const GoogleBtnWrapper = styled.div`
    width: 100%;
`;

/* Secundário: superfície + borda média, mesmo raio/altura do botão primário */
export const GoogleButton = styled.button`
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
        background: var(--bg-muted);
        border-color: var(--text-faint);
    }

    &:active {
        background: var(--bg-muted);
    }
`;
