import { Link } from "react-router-dom";
import styled from "styled-components";

export const Empty = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 60ch;

  h2 {
    font-size: var(--text-2xl);
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    line-height: 1.6;
  }
`;

export const CTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-weight: 700;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
`;

export const Provider = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  > div:nth-child(2) {
    flex: 1;
    min-width: 0;
  }
`;

export const Thumb = styled.div`
  width: 64px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
`;

export const ProviderName = styled.h2`
  font-family: var(--font-display);
  font-size: var(--text-xl);

  a {
    color: var(--text-primary);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
