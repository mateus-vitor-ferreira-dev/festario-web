import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.footer`
  width: 100%;
  border-top: 1px solid var(--border-default);
  margin-top: auto;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* 96px à direita: o botão flutuante do chat fica nesse canto */
  padding: 24px 96px 24px 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--text-muted);
  font-size: var(--text-xs);

  ${media.md} {
    padding: 20px 16px calc(104px + env(safe-area-inset-bottom));
    flex-direction: column;
    gap: 4px;
  }
`;
