import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
`;

export const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px max(24px, env(safe-area-inset-right)) 56px max(24px, env(safe-area-inset-left));
  /* evita que filhos com conteúdo largo (tabelas, calendários) estourem a viewport */
  min-width: 0;

  ${media.md} {
    padding: 24px 16px 32px;
  }
`;
