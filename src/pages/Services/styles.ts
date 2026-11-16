import { Link } from "react-router-dom";
import styled from "styled-components";

import { media } from "../../styles/breakpoints";

export const Empty = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 60ch;
  padding: 16px 0 32px;

  h2 {
    font-size: var(--text-2xl);
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
    line-height: 1.6;
  }
`;

export const OfferLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: var(--brand-dark);
  }

  &:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
`;

export const OfferBand = styled.aside`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 20px 24px;
  border: 1px dashed var(--brand-border);
  border-radius: var(--radius-lg);

  p {
    color: var(--text-secondary);
    max-width: 52ch;
  }

  ${media.md} {
    flex-direction: column;
    align-items: flex-start;
  }
`;
