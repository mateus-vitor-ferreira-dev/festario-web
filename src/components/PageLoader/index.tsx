import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-page);
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export default function PageLoader() {
  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  );
}
