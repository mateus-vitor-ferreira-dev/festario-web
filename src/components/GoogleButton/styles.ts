import styled from "styled-components";

export const GoogleBtnWrapper = styled.div`
    width: 100%;
`;

export const GoogleButton = styled.button`
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 500;
    font-family: "Google Sans", Roboto, Arial, sans-serif;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;

    &:hover {
        background: var(--bg-muted);
        box-shadow: var(--shadow-sm);
        border-color: var(--border-medium);
    }

    &:active {
        background: var(--bg-muted);
    }
`;
