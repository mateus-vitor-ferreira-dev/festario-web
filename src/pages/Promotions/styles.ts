import styled, { keyframes } from "styled-components";

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const Header = styled.section`
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
  line-height: 1.6;
  font-size: 14px;
`;

export const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
`;

export const CampaignGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const CampaignCard = styled.div<{ $inactive?: boolean }>`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 14px;
  opacity: ${({ $inactive }) => ($inactive ? 0.65 : 1)};
  cursor: ${({ $inactive }) => ($inactive ? "pointer" : "default")};
  transition: border-color 0.15s;

  ${({ $inactive }) => $inactive && `
    &:hover { border-color: var(--border-medium); }
  `}
`;

export const UnavailableReason = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "120px" : "0")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height 0.28s ease, opacity 0.2s ease;
  padding-top: ${({ $open }) => ($open ? "4px" : "0")};
  border-top: ${({ $open }) => ($open ? "1px solid var(--border-default)" : "none")};
`;

export const UnavailableText = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  padding-top: 10px;
`;

export const ExpandHint = styled.span`
  font-size: 12px;
  color: var(--text-faint);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -6px;
`;

export const CampaignTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const CampaignLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const CampaignIcon = styled.div`
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
`;

export const CampaignMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const CampaignName = styled.strong`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

export const CampaignType = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
`;

export const StatusBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.8;
  }

  ${({ $active }) => $active
    ? `background: var(--status-paid-bg); color: var(--status-paid-text); border: 1px solid var(--status-paid-border);`
    : `background: var(--bg-muted); color: var(--text-muted); border: 1px solid var(--border-default);`
  }
`;

export const CampaignDesc = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
`;

export const CampaignDates = styled.span`
  font-size: 12px;
  color: var(--text-muted);
`;

export const InviteForm = styled.form`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
  border-top: 1px solid var(--border-default);
`;

export const InviteInput = styled.input`
  flex: 1;
  min-width: 200px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus { border-color: var(--brand); }
  &::placeholder { color: var(--text-faint); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const InviteButton = styled.button`
  height: 42px;
  padding: 0 20px;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export const NoCampaignBanner = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--status-pending-text-deep);
  line-height: 1.5;
`;

export const InstagramLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand);
  text-decoration: none;
  padding-top: 4px;
  border-top: 1px solid var(--border-default);

  &:hover { text-decoration: underline; }
`;

// Seção de descontos
export const GrantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

export const GrantCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--status-paid-border);
  border-radius: 16px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const GrantPercent = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: var(--status-paid-text);
`;

export const GrantCampaign = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

export const GrantExpiry = styled.span`
  font-size: 12px;
  color: var(--text-muted);
`;

export const EmptyGrants = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  padding: 16px 0;
`;

// Seção de indicações
export const ReferralList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ReferralCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ReferralInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  strong { font-size: 14px; color: var(--text-primary); }
  span { font-size: 12px; color: var(--text-muted); }
`;

export const ReferralBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "REWARDED":
        return `background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);`;
      case "QUALIFIED":
        return `background: var(--status-info-bg); color: var(--status-info-text); border-color: var(--status-info-border);`;
      case "EXPIRED":
      case "CANCELLED":
        return `background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);`;
      default:
        return `background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);`;
    }
  }}
`;

export const EmptyReferrals = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  padding: 16px 0;
`;

export const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--border-default);
  border-top-color: var(--brand);
  animation: ${spin} 0.8s linear infinite;
  margin: 24px auto;
`;
