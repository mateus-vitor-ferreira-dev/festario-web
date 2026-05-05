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
    gap: 10px;
    background: #fff;
    color: #3c4043;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    font-family: "Google Sans", Roboto, Arial, sans-serif;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;

    &:hover {
        background: #f8faff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        border-color: #c6c6c6;
    }

    &:active {
        background: #f0f0f0;
    }
`;
