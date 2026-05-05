import styled, { keyframes } from "styled-components";

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Page shell ─── */

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 28px;
    animation: ${fadeUp} 0.35s ease;
`;

/* ─── Loading ─── */

export const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 320px;
    text-align: center;

    p {
        color: var(--text-muted);
        font-size: 14px;
    }
`;

export const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--border-default);
    border-top-color: var(--brand);
    animation: ${spinAnim} 0.8s linear infinite;
`;

/* ─── Page header ─── */

export const PageHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

export const HeaderLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const Greeting = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;

    span {
        color: var(--brand);
    }
`;

export const Subgreeting = styled.p`
    font-size: 14px;
    color: var(--text-muted);
`;

export const NewReservationButton = styled.a`
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background: var(--brand-dark);
    color: #ffffff;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.15s ease;

    &:hover {
        opacity: 0.9;
    }
`;

/* ─── Stats ─── */

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 800px) {
        grid-template-columns: 1fr;
    }
`;

export const StatCard = styled.article<{ $accent: string }>`
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-left: 4px solid ${({ $accent }) => $accent};
    border-radius: 14px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
    }
`;

export const StatLabel = styled.p`
    font-size: 12px;
    font-weight: 600;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

export const StatNumber = styled.strong<{ $accent: string }>`
    display: block;
    font-size: 36px;
    font-weight: 800;
    color: ${({ $accent }) => $accent};
    line-height: 1;
    margin: 4px 0;
`;

export const StatDescription = styled.p`
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.4;
`;

/* ─── Quick action cards ─── */

export const ActionRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 680px) {
        grid-template-columns: 1fr;
    }
`;

export const ActionCard = styled.a<{ $primary?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    border-radius: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

    background: ${({ $primary }) => ($primary ? "var(--brand-dark)" : "var(--bg-surface)")};
    color: ${({ $primary }) => ($primary ? "#ffffff" : "var(--text-primary)")};
    border: 1px solid ${({ $primary }) => ($primary ? "transparent" : "var(--border-default)")};
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);

    &:hover {
        opacity: ${({ $primary }) => ($primary ? "0.92" : "1")};
        background: ${({ $primary }) => ($primary ? "var(--brand-dark)" : "var(--bg-page)")};
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
    }
`;

export const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const ActionTitle = styled.strong`
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: inherit;
`;

export const ActionDesc = styled.p`
    font-size: 13px;
    color: inherit;
    opacity: 0.72;
`;

export const ActionArrow = styled.span<{ $primary?: boolean }>`
    font-size: 28px;
    line-height: 1;
    color: ${({ $primary }) => ($primary ? "rgba(255,255,255,0.7)" : "var(--text-faint)")};
    flex-shrink: 0;
    transition: transform 0.15s ease;

    ${ActionCard}:hover & {
        transform: translateX(3px);
    }
`;

/* ─── Content panels ─── */

export const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 800px) {
        grid-template-columns: 1fr;
    }
`;

export const Panel = styled.article`
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: 14px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
`;

export const PanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

export const PanelTitle = styled.h2`
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
`;

export const PanelLink = styled.a`
    font-size: 13px;
    font-weight: 600;
    color: var(--brand);
    text-decoration: none;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
    }
`;

/* ─── List ─── */

export const List = styled.ul`
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
`;

export const ListItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--bg-muted);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
`;

export const ListItemMain = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

export const ListItemTitle = styled.strong`
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const ListItemSub = styled.span`
    font-size: 12px;
    color: var(--text-faint);
`;

/* ─── Chips ─── */

export const StatusChip = styled.span<{ $color?: string }>`
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid;
    flex-shrink: 0;

    ${({ $color }) => {
        switch ($color) {
            case "green":
                return `
                    background: var(--status-paid-bg);
                    color: var(--status-paid-text);
                    border-color: var(--status-paid-border);
                `;
            case "amber":
                return `
                    background: var(--status-pending-bg);
                    color: var(--status-pending-text);
                    border-color: var(--status-pending-border);
                `;
            case "red":
                return `
                    background: var(--status-error-bg);
                    color: var(--status-error-text);
                    border-color: var(--status-error-border);
                `;
            default:
                return `
                    background: var(--bg-muted);
                    color: var(--text-medium);
                    border-color: var(--border-default);
                `;
        }
    }}
`;

export const PriceChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    background: var(--brand-subtle);
    color: var(--brand);
    border: 1px solid var(--brand-border);
    flex-shrink: 0;
`;

export const DiscountChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    background: var(--status-paid-bg);
    color: var(--status-paid-text);
    border: 1px solid var(--status-paid-border);
    flex-shrink: 0;
`;

/* ─── Venue mini-cards ─── */

export const VenueList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const VenueCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    border-radius: 10px;
    background: var(--bg-page);
    border: 1px solid var(--border-default);
    transition: box-shadow 0.15s ease;

    &:hover {
        box-shadow: 0 3px 12px rgba(15, 23, 42, 0.07);
    }
`;

export const VenueCardTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

export const VenueCardName = styled.strong`
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const VenueCardLocation = styled.span`
    font-size: 12px;
    color: var(--text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const VenueCardBottom = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 2px;
`;

export const VenueAmenities = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`;

export const AmenityChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    background: var(--bg-muted);
    color: var(--text-medium);
    border: 1px solid var(--border-default);
`;

export const VenueReserveBtn = styled.button`
    display: inline-flex;
    align-items: center;
    padding: 4px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--brand-dark);
    color: #ffffff;
    border: none;
    transition: opacity 0.15s ease;

    &:hover {
        opacity: 0.88;
    }
`;

/* ─── Empty state ─── */

export const EmptyState = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px 0;

    span {
        font-size: 14px;
        color: var(--text-faint);
    }
`;

export const EmptyDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-default);
    flex-shrink: 0;
`;
