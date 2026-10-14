import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  /* Folga para o botão flutuante do chat (56px + 28px) não cobrir o fim do conteúdo */
  ${media.md} {
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
`;

export const Header = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: var(--text-3xl);
  color: var(--text-primary);
  line-height: 1.1;

  ${media.sm} {
    font-size: var(--text-2xl);
  }
`;

export const Description = styled.p`
  color: var(--text-muted);
  line-height: 1.6;
  font-size: var(--text-base);
  max-width: 640px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionTitle = styled.h2`
  font-size: var(--text-xl);
  color: var(--text-primary);
`;

export const CampaignGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CampaignCard = styled.div<{ $inactive?: boolean }>`
  background: ${({ $inactive }) => ($inactive ? "transparent" : "var(--bg-surface)")};
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: ${({ $inactive }) => ($inactive ? "pointer" : "default")};
  transition: border-color 0.15s;

  ${({ $inactive }) => $inactive && `
    &:hover { border-color: var(--border-medium); }
  `}

  ${media.md} {
    padding: 20px;
  }
`;

export const UnavailableReason = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? "120px" : "0")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height 0.28s ease, opacity 0.2s ease;
  border-top: ${({ $open }) => ($open ? "1px solid var(--border-default)" : "none")};
`;

export const UnavailableText = styled.p`
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  padding-top: 12px;
`;

export const ExpandHint = styled.span<{ $open?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  min-height: 32px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--brand);
  margin-top: -8px;

  &::after {
    content: "";
    width: 6px;
    height: 6px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: ${({ $open }) => ($open ? "translateY(2px) rotate(-135deg)" : "translateY(-2px) rotate(45deg)")};
    transition: transform 0.2s ease;
  }
`;

export const CampaignTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px 16px;

  ${media.sm} {
    flex-wrap: wrap;
  }
`;

export const CampaignLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

export const CampaignMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const CampaignName = styled.h3`
  font-size: var(--text-lg);
  color: var(--text-primary);
  line-height: 1.2;
`;

export const CampaignType = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
`;

export const StatusBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
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
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 680px;
`;

export const CampaignDates = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;

export const InviteForm = styled.form`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border-default);

  ${media.sm} {
    flex-direction: column;
  }
`;

export const InviteInput = styled.input`
  flex: 1;
  min-width: 200px;
  height: 44px;

  ${media.sm} {
    min-width: 0;
    width: 100%;
    flex: none;
  }
  padding: 0 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-base);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--brand);
    box-shadow: var(--focus-ring);
  }
  &::placeholder { color: var(--text-faint); }
  &:disabled { background: var(--bg-muted); cursor: not-allowed; }
`;

export const InviteButton = styled.button`
  min-height: 44px;
  padding: 0 20px;
  background: var(--brand);
  color: var(--on-brand);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: var(--brand-dark); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }

  ${media.sm} {
    width: 100%;
  }
`;

export const NoCampaignBanner = styled.div`
  background: var(--status-pending-bg);
  border: 1px solid var(--status-pending-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: var(--text-sm);
  color: var(--status-pending-text-deep);
  line-height: 1.5;
`;

export const InstagramLink = styled.a`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--brand);
  text-decoration: none;
  transition: background 0.15s;

  &:hover { background: var(--brand-subtle); }
`;

// Seção de descontos
export const GrantsGrid = styled.div`
  display: grid;
  /* auto-fill (não auto-fit) para um único desconto não esticar na largura toda */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 12px;
`;

export const GrantCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const GrantPercent = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1;
  color: var(--text-primary);
  font-variant-numeric: lining-nums tabular-nums;

  small {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-muted);
    margin-left: 6px;
  }
`;

export const GrantCampaign = styled.span`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 6px;
`;

export const GrantExpiry = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;

export const EmptyGrants = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
  padding: 20px 0;
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
`;

// Seção de indicações — uma lista com divisórias finas
export const ReferralList = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
`;

export const ReferralCard = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-default);

  &:last-child { border-bottom: none; }

  /* ≤md: e-mail em linha própria; data e status lado a lado logo abaixo */
  ${media.md} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 4px 12px;
    padding: 14px 16px;
  }
`;

export const ReferralInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  ${media.md} {
    display: contents;

    strong { grid-column: 1 / -1; }
  }

  strong {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
  span {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
`;

export const ReferralBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
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
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
  padding: 20px 0;
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
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
