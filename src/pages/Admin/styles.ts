import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const PageHeader = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const Description = styled.p`
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
`;

/* Tabs */
export const TabBar = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-muted);
  border-radius: 14px;
  padding: 4px;
  width: fit-content;

  @media (max-width: 600px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

export const Tab = styled.button<{ $active?: boolean }>`
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  background: ${({ $active }) => ($active ? "var(--brand)" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-muted)")};

  &:hover:not([disabled]) {
    color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-primary)")};
  }

  @media (max-width: 600px) {
    flex: 1;
  }
`;

/* Summary cards */
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

export const SummaryCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SummaryLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const SummaryValue = styled.span<{ $accent?: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ $accent }) => ($accent ? "var(--brand)" : "var(--text-primary)")};
`;

export const SummarySubtitle = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

export const RevenueBreakdown = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const RevenueMethodCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const RevenueMethodIcon = styled.span`
  font-size: 28px;
  flex-shrink: 0;
`;

export const RevenueMethodInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

/* Generic section */
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
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

/* Filters row */
export const FiltersRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Select = styled.select`
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: var(--brand);
  }
`;

export const DateInput = styled.input`
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--brand);
  }
`;

/* Table */
export const TableWrapper = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

export const Th = styled.th`
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-page);
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--bg-muted);
  white-space: nowrap;

  &:last-child {
    color: var(--text-primary);
  }
`;

export const Tr = styled.tr`
  &:last-child ${Td} {
    border-bottom: none;
  }

  &:hover ${Td} {
    background: var(--bg-page);
  }
`;

/* Status badge */
export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "PAID":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "CANCELLED":
      case "EXPIRED":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      case "PENDING":
      default:
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
    }
  }}
`;

export const NegStatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "ACCEPTED":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "REJECTED":
        return `background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);`;
      case "CLOSED":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      case "OPEN":
      default:
        return `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;
    }
  }}
`;

/* Pagination */
export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
`;

export const PageInfo = styled.span`
  font-size: 14px;
  color: var(--text-muted);
`;

export const PageButton = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* Cards list (campaigns) */
export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const CampaignCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const CampaignInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 14px;
    color: var(--text-primary);
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

export const CampaignActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

export const ActiveBadge = styled.span<{ $active?: boolean }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;

  ${({ $active }) =>
    $active
      ? `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`
      : `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`}
`;

export const CampaignStatusBadge = styled.span<{ $status?: string }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "active":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "scheduled":
        return `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;
      case "ended":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      case "disabled":
      default:
        return `background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);`;
    }
  }}
`;

export const WinnerCard = styled.div`
  background: var(--status-paid-bg);
  border: 1px solid var(--status-paid-border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  strong {
    font-size: 18px;
    color: var(--text-primary);
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }
`;

export const MessagePreview = styled.div`
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  line-height: 1.6;
`;

export const CopyButton = styled.button`
  align-self: flex-end;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--brand);
    color: var(--brand);
  }
`;

export const RaffleButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid var(--brand);
  background: var(--bg-surface);
  color: var(--brand);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--brand);
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Buttons */
export const PrimaryButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: var(--brand);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerButton = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--status-error-border);
  background: var(--status-error-bg);
  color: var(--status-error-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--status-error-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Modal */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalBox = styled.div`
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }
`;

export const TextInput = styled.input`
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-faint);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
`;

/* Empty / Loading states */
export const EmptyState = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 48px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  h3 {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  p {
    font-size: 14px;
    color: var(--text-faint);
  }
`;

export const LoadingSpinner = styled.div`
  width: 36px;
  height: 36px;
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

/* Holiday row */
export const HolidayCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HolidayInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    color: var(--text-primary);
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

/* Monthly revenue table */
export const MonthlyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const MonthlyTh = styled.th`
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-page);
  white-space: nowrap;
`;

export const MonthlyTd = styled.td`
  padding: 10px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--bg-muted);

  &:first-child { color: var(--text-primary); font-weight: 600; }
`;

export const MonthlyTr = styled.tr`
  &:last-child ${MonthlyTd} { border-bottom: none; }
  &:hover ${MonthlyTd} { background: var(--bg-page); }
`;

export const RevenueBar = styled.div<{ $pct: number }>`
  height: 6px;
  border-radius: 999px;
  background: var(--border-default);
  overflow: hidden;
  min-width: 60px;
  flex: 1;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: var(--brand);
    border-radius: 999px;
    transition: width 0.4s ease;
  }
`;

/* Search input */
export const SearchInput = styled.input`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  min-width: 220px;

  &:focus { border-color: var(--brand); }
  &::placeholder { color: var(--text-faint); }
`;

export const RoleBadge = styled.span<{ $role?: string }>`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;

  ${({ $role }) =>
    $role === "ADMIN"
      ? `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`
      : `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`}
`;

export const HolidayType = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--status-info-bg);
  color: var(--status-info-text);
  border: 1px solid var(--status-info-border);
`;
