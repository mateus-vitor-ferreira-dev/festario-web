import styled from "styled-components";
import { media } from "../../styles/breakpoints";

/* ─── Page shell ─── */

export const Container = styled.div``;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  /* respiro para o botão de chat flutuante não cobrir o CTA final */
  ${media.lg} {
    gap: 24px;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;

  & > div:first-child {
    min-width: 0;
  }

  ${media.md} {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

export const PageTitle = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 6px;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const PageDescription = styled.p`
  color: var(--text-muted);
  max-width: 600px;
  line-height: 1.6;
  font-size: var(--text-base);
`;

/* Valor estimado — bloco quieto, número em display */
export const EstimatedCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  min-width: 220px;
  flex-shrink: 0;

  span {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
  }

  strong {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    line-height: 1.1;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
    margin: 4px 0 2px;
  }

  small {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  /* no mobile vira uma linha compacta: rótulo · plano ··· valor */
  ${media.md} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "label value"
      "plan  value";
    align-items: center;
    column-gap: 12px;
    min-width: 0;
    padding: 10px 16px;
    border-radius: var(--radius-md);

    span { grid-area: label; }
    small { grid-area: plan; }

    strong {
      grid-area: value;
      font-size: var(--text-xl);
      margin: 0;
      white-space: nowrap;
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  ${media.lg} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  /* resumo + confirmar acompanham a rolagem no desktop (header = 72px) */
  position: sticky;
  top: 96px;

  ${media.lg} {
    position: static;
  }
`;

/* ─── Panels ─── */

export const Card = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
  min-width: 0;

  ${media.sm} {
    padding: 16px;
  }
`;

export const CardTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: 4px;
`;

export const CardDescription = styled.p`
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.55;
  margin-bottom: 20px;
`;

/* Fatos do espaço com divisórias finas */
export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
  margin-bottom: 20px;

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const InfoBox = styled.div`
  padding: 12px 16px 12px 0;
  min-width: 0;

  & + & {
    padding-left: 16px;
    border-left: 1px solid var(--border-default);
  }

  ${media.sm} {
    padding: 10px 0;

    & + & {
      padding-left: 0;
      border-left: none;
      border-top: 1px solid var(--border-default);
    }
  }

  span {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    margin-bottom: 2px;
  }

  strong {
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: 500;
    overflow-wrap: anywhere;
  }
`;

export const RouteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  background: transparent;
  color: var(--brand);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--text-base);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--brand-subtle);
    border-color: var(--brand-border);
  }
`;

export const FormRow = styled.div`
  display: flex;
  gap: 16px;

  & > * {
    flex: 1;
    min-width: 0;
  }

  ${media.md} {
    flex-direction: column;
  }
`;

/* ─── Kids monitor ─── */

export const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  padding: 14px 16px;
  border-radius: var(--radius-md);

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  strong {
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: 700;
  }

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;

/* ─── Plan selector — lista de opções, o selecionado ganha marca ─── */

export const PlanGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PlanCard = styled.div<{ $selected?: boolean; $disabled?: boolean }>`
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  grid-template-areas:
    "radio label price"
    "radio days  price"
    ".     details details";
  column-gap: 14px;
  row-gap: 2px;
  align-items: center;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  border: 1px solid ${({ $selected, $disabled }) =>
    $disabled ? "var(--border-default)" : $selected ? "var(--brand)" : "var(--border-default)"};
  box-shadow: ${({ $selected, $disabled }) =>
    $selected && !$disabled ? "inset 0 0 0 1px var(--brand)" : "none"};
  background: ${({ $selected, $disabled }) =>
    $disabled ? "var(--bg-muted)" : $selected ? "var(--brand-subtle)" : "var(--bg-surface)"};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? "0.55" : "1")};
  transition: border-color 0.15s ease, background 0.15s ease;

  /* indicador tipo rádio */
  &::before {
    content: "";
    grid-area: radio;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    box-sizing: border-box;
    border: ${({ $selected, $disabled }) =>
      $selected && !$disabled ? "6px solid var(--brand)" : "1.5px solid var(--border-medium)"};
    background: var(--bg-surface);
    transition: border 0.15s ease;
  }

  &:hover {
    border-color: ${({ $selected, $disabled }) =>
      $disabled ? "var(--border-default)" : $selected ? "var(--brand)" : "var(--brand-border)"};
  }

  &:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  ${media.sm} {
    padding: 12px 14px;
    column-gap: 12px;
  }
`;

export const PlanLabel = styled.div`
  grid-area: label;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
`;

export const PlanDays = styled.div`
  grid-area: days;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.4;
`;

export const PlanPrice = styled.div`
  grid-area: price;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: lining-nums tabular-nums;
  white-space: nowrap;
  text-align: right;

  ${media.sm} {
    font-size: var(--text-lg);
  }
`;

/** O que o pacote traz: semana, horário e o que vem incluso. */
export const PlanDetails = styled.div`
  grid-area: details;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  min-width: 0;

  p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.45;
  }
`;

export const PlanUnavailable = styled.span`
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
`;

export const Hint = styled.p`
  margin-top: 8px;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.45;
`;

export const AddonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* Adicional: nome e preço à esquerda, a escolha (marcar ou horas) à direita. */
export const AddonRow = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  min-height: 56px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-page);
  cursor: pointer;

  & > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  strong {
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: 700;
  }

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  input[type="checkbox"] {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    accent-color: var(--brand);
  }

  &:has(input:focus-visible) {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;

export const Stepper = styled.div`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);

  button {
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    color: var(--brand);
    font-size: var(--text-xl);
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--radius-md);

    &:disabled {
      color: var(--text-muted);
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--brand);
      outline-offset: -2px;
    }
  }

  output {
    min-width: 44px;
    text-align: center;
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const QuoteError = styled.p`
  padding: 12px 14px;
  border: 1px solid var(--status-error-border);
  border-radius: var(--radius-md);
  background: var(--status-error-bg);
  color: var(--status-error-text);
  font-size: var(--text-sm);
  line-height: 1.45;
`;

export const PolicyBox = styled.div`
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-default);

  h3 {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 4px;
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.45;
  }
`;

/* ─── Summary ─── */

export const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

export const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  strong {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: 700;
    text-align: right;
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const QuoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--border-default);
  margin: 16px 0;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);

  span {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-secondary);
  }

  strong {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    line-height: 1.1;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
    white-space: nowrap;
  }
`;

export const QuoteLoading = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding: 8px 0;
`;

/* ─── Confirm + contract ─── */

export const ActionCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;

  ${media.sm} {
    padding: 16px;
  }
`;

export const ConfirmButton = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--brand);
  color: var(--on-brand);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-dark);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ContractCard = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContractTitle = styled.h3`
  font-size: var(--text-lg);
  color: var(--text-primary);
`;

export const ContractDescription = styled.p`
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--text-muted);
`;

export const ContractDownloadWrapper = styled.div`
  font-size: var(--text-sm);
  color: var(--text-muted);

  & > a,
  & > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 44px;
    padding: 0 16px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid var(--border-medium);
    color: var(--brand);
    font-size: var(--text-sm);
    font-weight: 700;
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease;

    cursor: pointer;
    font-family: inherit;

    &:hover:not(:disabled) {
      background: var(--brand-subtle);
      border-color: var(--brand-border);
    }

    &:focus-visible {
      outline: 2px solid var(--brand);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: progress;
      opacity: 0.7;
    }
  }
`;

export const ContractCheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;

  input {
    margin-top: 3px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--brand);
    flex-shrink: 0;
  }

  label {
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--text-secondary);
    cursor: pointer;
  }
`;

/* ─── Notes ─── */

export const NotesField = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-base);
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  &::placeholder {
    color: var(--text-faint);
  }
`;
