import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
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

export const SuccessBox = styled.div`
  background: var(--success-bg, #f0fdf4);
  border: 1px solid var(--success-border, #bbf7d0);
  border-radius: 8px;
  padding: 16px;
  color: var(--success-text, #166534);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
`;
