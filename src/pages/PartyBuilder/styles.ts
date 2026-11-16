import styled from "styled-components";

export const Category = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
`;

export const CategoryHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-default);

  h2 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--text-primary);
  }

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--brand);
    font-weight: 700;
  }
`;
