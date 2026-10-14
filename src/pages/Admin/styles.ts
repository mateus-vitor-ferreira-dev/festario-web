import styled, { css, keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { media } from "../../styles/breakpoints";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Page ─── */

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PageHeader = styled.section`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  line-height: 1.15;
  color: var(--text-primary);

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  color: var(--text-muted);
  font-size: var(--text-base);
  line-height: 1.5;
`;

/* ─── Tabs — sublinhadas, rolagem horizontal ─── */

const fadeMask = (start?: boolean, end?: boolean) => {
  if (!start && !end) return "none";
  const from = start ? "transparent 0, black 40px" : "black 0";
  const to = end ? "black calc(100% - 40px), transparent 100%" : "black 100%";
  return `linear-gradient(to right, ${from}, ${to})`;
};

/** $fadeStart/$fadeEnd: há abas escondidas à esquerda/direita (indicador de rolagem). */
export const TabBar = styled.div<{ $fadeStart?: boolean; $fadeEnd?: boolean }>`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-default);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  mask-image: ${({ $fadeStart, $fadeEnd }) => fadeMask($fadeStart, $fadeEnd)};
  -webkit-mask-image: ${({ $fadeStart, $fadeEnd }) => fadeMask($fadeStart, $fadeEnd)};

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Tab = styled.button<{ $active?: boolean }>`
  flex-shrink: 0;
  scroll-snap-align: start;
  height: 44px;
  padding: 0 12px;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? "var(--brand)" : "transparent")};
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--text-muted)")};
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--text-primary);
    background: ${({ $active }) => ($active ? "transparent" : "var(--bg-muted)")};
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
`;

/* ─── KPIs — grade quieta com divisórias ─── */

const quietGrid = css`
  display: grid;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;

  /* Divisórias: cada célula desenha a linha à direita e abaixo;
     as que caem na borda externa ficam cortadas pelo overflow. */
  & > * {
    box-shadow: 1px 0 0 0 var(--border-default), 0 1px 0 0 var(--border-default);
  }
`;

export const SummaryGrid = styled.div`
  ${quietGrid}
  grid-template-columns: repeat(5, minmax(0, 1fr));

  /* 5 KPIs sem célula vazia: 3 + 2 no tablet, 1 (total) + 2 + 2 no celular */
  ${media.md} {
    grid-template-columns: repeat(6, minmax(0, 1fr));

    & > :nth-child(-n + 3) { grid-column: span 2; }
    & > :nth-child(n + 4) { grid-column: span 3; }
  }

  ${media.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > :nth-child(n) { grid-column: span 1; }
    & > :first-child { grid-column: 1 / -1; }
  }
`;

export const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  min-width: 0;
`;

export const SummaryLabel = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
`;

export const SummaryValue = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.15;
  color: var(--text-primary);
  font-variant-numeric: lining-nums tabular-nums;
  overflow-wrap: anywhere;

  ${media.sm} {
    font-size: var(--text-xl);
  }
`;

export const SummarySubtitle = styled.span`
  font-size: var(--text-xs);
  color: var(--text-faint);
`;

export const RevenueBreakdown = styled.div`
  ${quietGrid}
  grid-template-columns: repeat(3, minmax(0, 1fr));

  /* Receita total na linha inteira; cartão e PIX lado a lado */
  ${media.md} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > :first-child { grid-column: 1 / -1; }
  }

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`;

/* ─── Section ─── */

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  /* Ação única do cabeçalho ocupa a largura toda no celular */
  ${media.sm} {
    & > button {
      flex: 1 1 100%;
    }
  }
`;

/** Grupo de ações do cabeçalho de seção: no celular empilha, primária primeiro. */
export const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  ${media.sm} {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;

    & > button {
      width: 100%;
      white-space: normal;
    }
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--text-xl);
  line-height: 1.2;
  color: var(--text-primary);
`;

/** Grupo de ações/controles lado a lado (cabeçalho de seção, linhas de tabela). */
export const InlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

/* ─── Controles (mesmos tokens do componente Input) ─── */

const fieldBase = css`
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
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

  &:disabled {
    background: var(--bg-muted);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  ${media.md} {
    height: 44px;
  }
`;

/* Filtros: mesma altura do componente Input/DatePickerInput (48px) */
export const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  & > select,
  & > input {
    height: 48px;
  }

  & > button {
    min-height: 48px;
  }

  ${media.sm} {
    & > select {
      flex: 1 1 100%;
    }
  }
`;

/** Envolve DatePickerInput (que ocupa 100% da largura) dentro de FiltersRow. */
export const FilterField = styled.div`
  width: 200px;

  ${media.md} {
    flex: 1 1 150px;
    width: auto;
    min-width: 0;
  }
`;

export const Select = styled.select`
  ${fieldBase}
  cursor: pointer;
`;

export const DateInput = styled.input`
  ${fieldBase}
`;

export const SearchInput = styled.input`
  ${fieldBase}
  min-width: 260px;

  ${media.md} {
    min-width: 0;
    flex: 1 1 100%;
  }
`;

export const TextInput = styled.input`
  ${fieldBase}
  height: 44px;
  width: 100%;
  box-sizing: border-box;
`;

/* ─── Table ─── */

export const TableWrapper = styled.div`
  position: relative; /* contém o texto acessível oculto dentro da rolagem */
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const numericCell = css`
  text-align: right;
  font-variant-numeric: lining-nums tabular-nums;
`;

/* No tablet/celular a 1ª coluna fica fixa enquanto a tabela rola de lado */
const stickyFirstColumn = css`
  ${media.md} {
    &:first-child {
      position: sticky;
      left: 0;
      z-index: 1;
      background: var(--bg-surface);
      box-shadow: inset -1px 0 0 var(--border-default);
    }
  }
`;

export const Th = styled.th<{ $num?: boolean }>`
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;

  ${({ $num }) => $num && numericCell}
  ${stickyFirstColumn}
`;

export const Td = styled.td<{ $num?: boolean }>`
  padding: 10px 16px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
  vertical-align: middle;

  strong {
    font-weight: 600;
    color: var(--text-primary);
  }

  ${({ $num }) => $num && numericCell}
  ${stickyFirstColumn}
`;

export const Tr = styled.tr`
  &:last-child ${Td} {
    border-bottom: none;
  }

  &:hover ${Td} {
    background: var(--bg-page);
  }
`;

/* ─── Status chips ─── */

const chipBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.5;
  border: 1px solid;
  white-space: nowrap;
`;

const chipPaid = `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
const chipNeutral = `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
const chipPending = `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
const chipError = `background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);`;
const chipInfo = `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;

export const StatusBadge = styled.span<{ $status?: string }>`
  ${chipBase}

  ${({ $status }) => {
    switch ($status) {
      case "PAID":
        return chipPaid;
      case "CANCELLED":
      case "EXPIRED":
        return chipNeutral;
      case "PENDING":
      default:
        return chipPending;
    }
  }}
`;

export const NegStatusBadge = styled.span<{ $status?: string }>`
  ${chipBase}

  ${({ $status }) => {
    switch ($status) {
      case "ACCEPTED":
        return chipPaid;
      case "REJECTED":
        return chipError;
      case "CLOSED":
        return chipNeutral;
      case "OPEN":
      default:
        return chipInfo;
    }
  }}
`;

export const ActiveBadge = styled.span<{ $active?: boolean }>`
  ${chipBase}
  ${({ $active }) => ($active ? chipPaid : chipNeutral)}
`;

export const CampaignStatusBadge = styled.span<{ $status?: string }>`
  ${chipBase}

  ${({ $status }) => {
    switch ($status) {
      case "active":
        return chipPaid;
      case "scheduled":
        return chipInfo;
      case "ended":
        return chipNeutral;
      case "disabled":
      default:
        return chipError;
    }
  }}
`;

export const RoleBadge = styled.span<{ $role?: string }>`
  ${chipBase}
  ${({ $role }) => ($role === "ADMIN" ? chipInfo : $role === "OWNER" ? chipPaid : chipNeutral)}
`;

/* Tipo de feriado — rótulo de categoria, não status: chip quadrado */
export const HolidayType = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-muted);
`;

/* ─── Pagination ─── */

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const PageInfo = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;

/* ─── Buttons ─── */

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

/** Variante compacta para ações dentro de linhas de tabela/lista. */
const buttonSmall = css`
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;

  ${media.md} {
    min-height: 44px;
    padding: 0 14px;
  }
`;

type ButtonSize = { $size?: "sm" };

export const PrimaryButton = styled.button<ButtonSize>`
  ${buttonBase}
  border: 1px solid var(--brand);
  background: var(--brand);
  color: var(--on-brand);

  &:hover:not(:disabled) {
    background: var(--brand-dark);
    border-color: var(--brand-dark);
  }

  ${({ $size }) => $size === "sm" && buttonSmall}
`;

export const SecondaryButton = styled.button<ButtonSize>`
  ${buttonBase}
  border: 1px solid var(--brand-border);
  background: transparent;
  color: var(--brand);

  &:hover:not(:disabled) {
    background: var(--brand-subtle);
    border-color: var(--brand);
  }

  ${({ $size }) => $size === "sm" && buttonSmall}
`;

export const DangerButton = styled.button<ButtonSize>`
  ${buttonBase}
  border: 1px solid var(--status-error-border);
  background: transparent;
  color: var(--status-error-text);

  &:hover:not(:disabled) {
    background: var(--status-error-bg);
  }

  ${({ $size }) => $size === "sm" && buttonSmall}
`;

export const PageButton = styled.button`
  ${buttonBase}
  ${buttonSmall}
  min-height: 36px;

  ${media.md} {
    min-height: 44px;
  }
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);

  &:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:disabled {
    opacity: 0.45;
  }
`;

export const RaffleButton = styled.button`
  ${buttonBase}
  ${buttonSmall}
  border: 1px solid var(--brand);
  background: transparent;
  color: var(--brand);

  &:hover:not(:disabled) {
    background: var(--brand);
    color: var(--on-brand);
  }
`;

export const CopyButton = styled.button`
  ${buttonBase}
  ${buttonSmall}
  align-self: flex-end;
  border: 1px solid var(--brand-border);
  background: transparent;
  color: var(--brand);

  &:hover:not(:disabled) {
    background: var(--brand-subtle);
    border-color: var(--brand);
  }
`;

/* ─── Listas (campanhas, feriados) — um painel, linhas com hairline ─── */

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;

  & > * + * {
    border-top: 1px solid var(--border-default);
  }
`;

const listRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 20px;
`;

export const CampaignCard = styled.div`
  ${listRow}
`;

export const CampaignInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  & > strong {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  span strong {
    font-weight: 600;
    color: var(--text-secondary);
  }
`;

export const CampaignActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

export const HolidayCard = styled.div`
  ${listRow}
  padding: 10px 20px;
`;

export const HolidayInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  min-width: 0;

  strong {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  span {
    order: -1;
    min-width: 88px;
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

/* ─── Sorteio ─── */

export const WinnerCard = styled.div`
  background: var(--brand-subtle);
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  span {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
`;

export const WinnerMeta = styled.span`
  margin-top: 6px;
  font-size: var(--text-xs) !important;
  color: var(--text-muted) !important;
`;

export const MessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MessagePreview = styled.div`
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: pre-wrap;
  line-height: 1.6;
`;

/* ─── Modal ─── */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Acima do botão do chat (1000/1001) */
  z-index: 1100;
  padding: 20px;

  ${media.sm} {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalBox = styled.div<{ $maxWidth?: number }>`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 28px;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth ?? 480}px;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* Folha inferior de largura total */
  ${media.sm} {
    max-width: none;
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: none;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  }
`;

/* Cabeçalho do modal: título + fechar, fixo no topo da área rolável */
export const ModalHeader = styled.div`
  position: sticky;
  top: -28px; /* compensa o padding do ModalBox */
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: -28px -28px 0;
  padding: 20px 16px 4px 28px;
  background: var(--bg-surface);

  ${media.sm} {
    top: -20px;
    margin: -20px -16px 0;
    padding: 12px 8px 4px 16px;
  }
`;

export const ModalClose = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-top: -4px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--bg-muted);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ModalTitle = styled.h3`
  padding-top: 8px;
  font-size: var(--text-xl);
  line-height: 1.2;
  color: var(--text-primary);
`;

export const ModalText = styled.p`
  max-width: none;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--text-secondary);
`;

export const ModalNote = styled.p`
  max-width: none;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--text-muted);
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;

  ${media.sm} {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);

    & > button {
      width: 100%;
      white-space: normal;
    }
  }
`;

/* Resumo de reembolso (cancelamento de reserva paga) */
export const RefundSummary = styled.dl`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    padding: 10px 14px;
  }

  & > div + div {
    border-top: 1px solid var(--border-default);
  }

  dt {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  dd {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    font-variant-numeric: lining-nums tabular-nums;
  }
`;

export const RefundWarning = styled.p`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--status-error-text);
`;

/* ─── Forms ─── */

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  & > label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
  }

  & > select,
  & > input {
    height: 44px;
    width: 100%;
    box-sizing: border-box;
  }
`;

/** Campos lado a lado; empilha no mobile. */
export const FormRow = styled.div<{ $cols?: string }>`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols ?? "1fr 1fr"};
  gap: 12px;

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`;

/** Bloco temático do formulário (ex.: Endereço, Comodidades). */
export const FormSection = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 16px 0 0;
  border: none;
  border-top: 1px solid var(--border-default);
  min-width: 0;

  & > legend {
    float: left;
    width: 100%;
    padding: 0;
    margin-bottom: 4px;
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  & > legend + * {
    clear: both;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  font-size: var(--text-base);

  ${media.md} {
    min-height: 44px;
  }
  color: var(--text-secondary);
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--brand);
    cursor: pointer;
  }
`;

export const FieldHint = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--bg-muted);
  padding: 8px 12px;
  border-radius: var(--radius-sm);

  strong {
    font-weight: 600;
    color: var(--text-secondary);
  }
`;

/* ─── Empty / Loading ─── */

export const EmptyState = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  h3 {
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  p {
    font-size: var(--text-base);
    color: var(--text-muted);
  }
`;

export const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  animation: ${spin} 0.8s linear infinite;
  margin: 40px auto;
`;

/* Tab panel — always mounted, hidden when inactive */
export const TabPanel = styled.div<{ $active?: boolean }>`
  display: ${({ $active }) => ($active ? "contents" : "none")};
`;

/* ─── Receita mensal ─── */

export const MonthlyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;

  /* Celular: só mês, receita (com nº de reservas embaixo) e barra — cabe sem rolar */
  ${media.sm} {
    min-width: 0;
  }
`;

const hideOnSm = css`
  ${media.sm} {
    display: none;
  }
`;

export const MonthlyCount = styled.span`
  display: none;

  ${media.sm} {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
`;

export const MonthlyTh = styled.th<{ $num?: boolean; $hideSm?: boolean }>`
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;

  ${({ $num }) => $num && numericCell}
  ${({ $hideSm }) => $hideSm && hideOnSm}

  ${media.sm} {
    padding: 10px 12px;
  }
`;

export const MonthlyTd = styled.td<{ $num?: boolean; $muted?: boolean; $hideSm?: boolean }>`
  padding: 8px 16px;
  font-size: var(--text-sm);
  color: ${({ $muted }) => ($muted ? "var(--text-faint)" : "var(--text-secondary)")};
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;

  &:first-child {
    color: var(--text-primary);
    font-weight: 600;
  }

  ${({ $num }) => $num && numericCell}
  ${({ $hideSm }) => $hideSm && hideOnSm}

  ${media.sm} {
    padding: 8px 12px;
  }
`;

export const MonthlyTr = styled.tr`
  &:last-child ${MonthlyTd} { border-bottom: none; }
  &:hover ${MonthlyTd} { background: var(--bg-page); }
`;

export const RevenueBar = styled.div<{ $pct: number }>`
  height: 10px;
  min-width: 120px;
  border-radius: 2px;

  ${media.sm} {
    min-width: 48px;
  }
  background: var(--bg-muted);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: var(--brand);
  }
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

/* ─── Listas paginadas ─── */

/** Região da lista: fica translúcida enquanto a próxima página/filtro carrega. */
export const ListRegion = styled.div<{ $busy?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  opacity: ${({ $busy }) => ($busy ? 0.55 : 1)};
  transition: opacity 0.15s ease;
`;

/** Alvo de foco/rolagem ao trocar de página (topo da seção). */
export const ScrollAnchor = styled.div`
  scroll-margin-top: 96px;

  &:focus {
    outline: none;
  }
`;

export const ResultCount = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;
`;

/** Seletor de ano no cabeçalho de Feriados — mesmo controle da barra de filtros. */
export const YearField = styled.div`
  width: 140px;
`;

/* ─── Painel do espaço: nome do espaço e barra de contexto (ADMIN) ─── */

export const TitleTenant = styled.span`
  display: block;
  margin-top: 2px;
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--text-muted);
  overflow-wrap: anywhere;
`;

/** Faixa informativa: em qual espaço o ADMIN está operando. Sem sombra (painel). */
export const ContextBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 12px 16px;
  border: 1px solid var(--status-info-border);
  border-radius: var(--radius-lg);
  background: var(--status-info-bg);
  color: var(--status-info-text);
  font-size: var(--text-sm);
  line-height: 1.45;

  strong {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  & > span {
    min-width: 0;
    flex: 1 1 280px;
  }
`;

export const ContextLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--brand);
  text-decoration: underline;
  text-decoration-color: var(--brand-border);
  text-underline-offset: 3px;

  &:hover {
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    border-radius: var(--radius-sm);
  }
`;
