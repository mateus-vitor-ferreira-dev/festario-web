import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-default);
  }

  span {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-faint);
    white-space: nowrap;
  }
`;

export const FooterText = styled.p`
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;

  a {
    color: var(--brand);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;
