import styled from "styled-components";
import { media } from "../../styles/breakpoints";

export const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 24px;
  max-width: 1100px;
  align-items: start;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
    max-width: 640px;
    gap: 16px;
  }
`;

export const Header = styled.section`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-primary);

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  color: var(--text-muted);
  line-height: 1.5;
  font-size: var(--text-base);
  max-width: 620px;
`;

export const Card = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  ${media.sm} {
    padding: 20px 16px;
  }
`;

export const CardTitle = styled.h2`
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
`;

/* Linha de canal: lista com hairlines, sem caixas aninhadas */
export const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 8px;
  margin: -6px -8px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
  width: calc(100% + 16px);
  min-height: 56px;

  &:hover {
    background: var(--bg-muted);
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

export const ContactIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--brand-subtle);
  border: 1px solid var(--brand-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    fill: var(--brand);
  }
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const ContactLabel = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
`;

export const ContactValue = styled.span`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  overflow-wrap: anywhere;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FormLabel = styled.label`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
`;

export const FormInput = styled.input`
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover:not(:focus) {
    border-color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-faint);
  }
`;

export const FormTextarea = styled.textarea`
  padding: 12px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.5;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 132px;

  &:hover:not(:focus) {
    border-color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-faint);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
  background: var(--brand);
  color: var(--on-brand);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  margin-top: 4px;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
