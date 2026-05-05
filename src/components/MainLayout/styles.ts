import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
`;

export const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 640px) {
    padding: 24px 16px;
  }
`;
