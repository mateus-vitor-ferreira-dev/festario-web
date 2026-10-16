import styled, { css } from "styled-components";
import { media } from "../../styles/breakpoints";

/**
 * Base única de TODOS os controles de filtro (select, data, texto, número):
 * mesma altura (--control-h), borda, raio, fonte e respiro — é o que mantém a
 * barra alinhada. O DatePickerInput usa o Input do design system, que segue
 * exatamente estes valores.
 */
export const controlBase = css`
  width: 100%;
  min-width: 0;
  height: var(--control-h);
  padding: 0 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.2;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: var(--text-faint);
  }

  &:hover:not(:focus):not(:disabled) {
    border-color: var(--text-faint);
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }
`;

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

export const Toggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  align-self: flex-start;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;

  svg {
    width: var(--icon-md);
    height: var(--icon-md);
  }

  &[aria-expanded="true"] {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  ${media.md} {
    display: inline-flex;
  }
`;

export const Panel = styled.div<{ $open: boolean }>`
  min-width: 0;

  ${media.md} {
    display: ${({ $open }) => ($open ? "block" : "none")};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
  gap: 12px 16px;
  align-items: end;

  ${media.md} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Field = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  ${({ $wide }) => $wide && css`grid-column: span 2;`}

  ${media.md} {
    ${({ $wide }) => $wide && css`grid-column: 1 / -1;`}
  }
`;

export const Label = styled.label`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
`;

export const Legend = styled.legend`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0;
  margin-bottom: 6px;
`;

export const Fieldset = styled.fieldset<{ $wide?: boolean }>`
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
  ${({ $wide }) => $wide && css`grid-column: span 2;`}

  ${media.md} {
    ${({ $wide }) => $wide && css`grid-column: 1 / -1;`}
  }
`;

export const Select = styled.select`
  ${controlBase}
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
  cursor: pointer;
  text-overflow: ellipsis;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235c6b63' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: var(--icon-md) var(--icon-md);

  option {
    background: var(--bg-surface);
    color: var(--text-primary);
  }
`;

export const Input = styled.input`
  ${controlBase}

  &[type="search"]::-webkit-search-cancel-button {
    cursor: pointer;
  }
`;

/** Campo com prefixo textual ("de R$") colado à esquerda — mesma caixa dos demais. */
export const AffixBox = styled.div`
  ${controlBase}
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 0 14px;

  &:focus-within {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }

  label {
    flex-shrink: 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
    white-space: nowrap;
    cursor: text;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 14px 0 0;
    border: 0;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-variant-numeric: lining-nums tabular-nums;
    outline: none;

    &::placeholder {
      color: var(--text-faint);
    }
  }
`;

export const RangeRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

/* ─── Chips de filtros ativos ─── */

export const ChipBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ChipList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  min-width: 0;
`;

export const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 36px;
  padding: 0 10px 0 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--brand-border);
  background: var(--brand-subtle);
  color: var(--brand);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  span {
    overflow-wrap: anywhere;
  }

  svg {
    width: var(--icon-sm);
    height: var(--icon-sm);
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--brand);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  ${media.md} {
    min-height: 44px;
  }
`;

export const ClearButton = styled.button`
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: var(--brand);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  ${media.md} {
    min-height: 44px;
  }
`;

/* ─── Sem resultados para os filtros ─── */

export const NoResults = styled.div`
  background: var(--bg-surface);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  h3 {
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  p {
    font-size: var(--text-base);
    color: var(--text-muted);
  }

  button {
    margin-top: 8px;
    min-height: 44px;
    padding: 0 18px;
    border-radius: var(--radius-md);
    border: 1px solid var(--brand-border);
    background: transparent;
    color: var(--brand);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: var(--brand-subtle);
      border-color: var(--brand);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }

  ${media.sm} {
    padding: 24px 20px;
  }
`;

/** Linha de checkbox com a mesma altura dos campos, para alinhar pela base da grade. */
export const CheckRow = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: var(--control-h);
  padding: 0 14px;
  border: 1px solid ${({ $checked }) => ($checked ? "var(--brand-border)" : "var(--border-default)")};
  border-radius: var(--radius-md);
  background: ${({ $checked }) => ($checked ? "var(--brand-subtle)" : "var(--bg-surface)")};
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  user-select: none;

  input {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--brand);
    cursor: pointer;
  }

  &:focus-within {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
`;
