import styled, { keyframes } from "styled-components";
import { media } from "../../styles/breakpoints";

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

/* ─── Page shell ─── */

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
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
        font-size: var(--text-sm);
    }
`;

export const Spinner = styled.div`
    width: 36px;
    height: 36px;
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
    gap: 6px;
    min-width: 0;
`;

export const Greeting = styled.h1`
    font-size: var(--text-4xl);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.05;
`;

export const Subgreeting = styled.p`
    font-size: var(--text-base);
    color: var(--text-muted);
`;

export const NewReservationButton = styled.a`
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 20px;
    background: var(--brand);
    color: var(--on-brand);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s ease;

    &:hover {
        background: var(--brand-dark);
    }
`;

/** Atalhos do cabeçalho: área do papel (painel/plataforma) + nova reserva. */
export const HeaderActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    ${media.sm} {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;

        & > a {
            justify-content: center;
        }
    }
`;

export const ShortcutLink = styled.a`
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 18px;
    border: 1px solid var(--brand-border);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--brand);
    font-size: var(--text-base);
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
        background: var(--brand-subtle);
        border-color: var(--brand);
    }

    &:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
    }
`;

/* ─── Facts — linha discreta de números ─── */

export const Facts = styled.dl`
    display: flex;

    ${media.md} {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    border-top: 1px solid var(--border-default);
    border-bottom: 1px solid var(--border-default);
`;

export const Fact = styled.div`
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 14px 28px 14px 0;
    margin-right: 28px;
    border-right: 1px solid var(--border-default);

    &:last-child {
        border-right: none;
        margin-right: 0;
    }

    ${media.md} {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 12px 12px 12px 0;
        margin-right: 12px;
    }
`;

export const FactValue = styled.dd`
    order: -1;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
    font-variant-numeric: lining-nums tabular-nums;
`;

export const FactLabel = styled.dt`
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

/* ─── Content panels ─── */

export const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 24px;
    align-items: start;

    ${media.lg} {
        /* minmax(0, …): o painel não cresce até o min-content da data em destaque */
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const Panel = styled.article`
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const PanelHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
`;

export const PanelTitle = styled.h2`
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
`;

export const PanelLink = styled.a`
    font-size: var(--text-sm);
    font-weight: 700;
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
`;

/* Assinatura: o próximo evento como convite em arco */
export const FeaturedItem = styled.li`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 56px 24px 28px;
    margin-bottom: 8px;
    border: 1px solid var(--gold-border);
    /* arco elíptico: a curva acompanha a largura sem virar cúpula */
    border-radius: 50% 50% var(--radius-lg) var(--radius-lg) / 120px 120px var(--radius-lg) var(--radius-lg);
    background: var(--gold-subtle);
    text-align: center;

    ${media.sm} {
        padding: 44px 16px 22px;
        border-radius: 50% 50% var(--radius-lg) var(--radius-lg) / 72px 72px var(--radius-lg) var(--radius-lg);
    }
`;

export const FeaturedDate = styled.time`
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 500;
    font-style: italic;
    line-height: 1.1;
    color: var(--text-primary);

    &::first-letter {
        text-transform: uppercase;
    }

    ${media.sm} {
        font-size: var(--text-2xl);
    }
`;

export const FeaturedVenue = styled.strong`
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 6px;
`;

export const ListItem = styled.li`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-default);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
`;

export const DateBlock = styled.time`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 44px;
    flex-shrink: 0;
    line-height: 1;

    strong {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
    }

    span {
        font-size: var(--text-2xs);
        color: var(--text-muted);
        margin-top: 2px;
    }
`;

export const ListItemMain = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
`;

export const ListItemTitle = styled.strong`
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const ListItemSub = styled.span`
    font-size: var(--text-xs);
    color: var(--text-muted);
`;

/* ─── Chips ─── */

export const StatusChip = styled.span<{ $color?: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: 700;
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
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
    color: var(--text-secondary);
    flex-shrink: 0;
`;

export const DiscountChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: 700;
    white-space: nowrap;
    background: var(--status-paid-bg);
    color: var(--status-paid-text);
    border: 1px solid var(--status-paid-border);
    flex-shrink: 0;
`;

/* ─── Venue rows ─── */

export const VenueList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const VenueCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border-default);

    &:first-child {
        padding-top: 0;
    }

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
`;

export const VenueCardTop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
`;

export const VenueCardName = styled.strong`
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const VenueCardLocation = styled.span`
    font-size: var(--text-xs);
    color: var(--text-muted);
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
    border-radius: var(--radius-sm);
    font-size: var(--text-2xs);
    font-weight: 500;
    white-space: nowrap;
    background: var(--bg-muted);
    color: var(--text-medium);
`;

export const VenueReserveBtn = styled.button`
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    background: transparent;
    color: var(--brand);
    border: 1px solid var(--brand-border);
    transition: background 0.15s ease;

    &:hover {
        background: var(--brand-subtle);
    }
`;

/* ─── Empty state ─── */

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 0;

    span {
        font-size: var(--text-base);
        color: var(--text-muted);
    }
`;
