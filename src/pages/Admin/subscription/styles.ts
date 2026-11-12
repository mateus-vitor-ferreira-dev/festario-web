import styled, { css } from "styled-components";
import { media } from "../../../styles/breakpoints";
import type { SubscriptionTone } from "../../../utils/subscription";

const toneVars: Record<SubscriptionTone, { bg: string; text: string; border: string }> = {
    paid: { bg: "var(--status-paid-bg)", text: "var(--status-paid-text)", border: "var(--status-paid-border)" },
    pending: { bg: "var(--status-pending-bg)", text: "var(--status-pending-text)", border: "var(--status-pending-border)" },
    error: { bg: "var(--status-error-bg)", text: "var(--status-error-text)", border: "var(--status-error-border)" },
    info: { bg: "var(--status-info-bg)", text: "var(--status-info-text)", border: "var(--status-info-border)" },
    neutral: { bg: "var(--bg-muted)", text: "var(--text-muted)", border: "var(--border-default)" },
};

export const ToneBadge = styled.span<{ $tone: SubscriptionTone }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: var(--radius-pill);
    border: 1px solid ${({ $tone }) => toneVars[$tone].border};
    background: ${({ $tone }) => toneVars[$tone].bg};
    color: ${({ $tone }) => toneVars[$tone].text};
    font-size: var(--text-xs);
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
`;

/** A situação dita numa frase: a peça principal da aba. A borda à esquerda carrega a cor da situação. */
export const StatusPanel = styled.section<{ $tone: SubscriptionTone }>`
    display: grid;
    gap: 12px;
    padding: 24px 28px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    border-left: 6px solid ${({ $tone }) => toneVars[$tone].border};
    background: var(--bg-surface);

    ${media.sm} {
        padding: 18px 16px;
    }
`;

export const StatusHeadline = styled.h2`
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1.25;
    color: var(--text-primary);
    max-width: 32ch;

    ${media.sm} {
        font-size: var(--text-xl);
    }
`;

export const StatusText = styled.p`
    color: var(--text-secondary);
    font-size: var(--text-base);
    line-height: 1.55;
    max-width: 68ch;
`;

export const Facts = styled.dl`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 32px;
    margin-top: 4px;

    div {
        display: grid;
        gap: 2px;
    }

    dt {
        font-size: var(--text-xs);
        color: var(--text-muted);
    }

    dd {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
    }
`;

/** Os 7 dias de tolerância, um segmento por dia; os que já passaram ficam cheios. */
export const GraceTrack = styled.ol<{ $tone: SubscriptionTone }>`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    max-width: 420px;
    list-style: none;

    li {
        height: 8px;
        border-radius: var(--radius-pill);
        background: var(--bg-muted);
        border: 1px solid var(--border-default);
    }

    li[data-past="true"] {
        background: ${({ $tone }) => toneVars[$tone].text};
        border-color: transparent;
    }
`;

export const GraceCaption = styled.p`
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

export const Card = styled.section`
    display: grid;
    gap: 16px;
    padding: 24px 28px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);

    ${media.sm} {
        padding: 18px 16px;
    }
`;

export const CardTitle = styled.h3`
    font-size: var(--text-lg);
    color: var(--text-primary);
`;

export const CardText = styled.p`
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.55;
    max-width: 68ch;
`;

export const Steps = styled.ol`
    display: grid;
    gap: 6px;
    padding-left: 20px;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.5;
    max-width: 68ch;
`;

export const AuthorizeLayout = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 24px;
    align-items: start;

    ${media.md} {
        grid-template-columns: 1fr;
    }
`;

export const Stack = styled.div`
    display: grid;
    gap: 12px;
    min-width: 0;
`;

export const QrFrame = styled.figure`
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: #fff;

    img {
        width: 220px;
        height: 220px;
        image-rendering: pixelated;
    }

    figcaption {
        font-size: var(--text-xs);
        color: var(--text-muted);
    }

    ${media.md} {
        justify-self: center;
    }
`;

export const CodeBox = styled.textarea`
    width: 100%;
    min-height: 88px;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-medium);
    background: var(--bg-field);
    color: var(--text-primary);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: var(--text-xs);
    line-height: 1.5;
    resize: none;
    word-break: break-all;

    &:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
    }
`;

export const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;

    ${media.sm} {
        & > button {
            flex: 1 1 100%;
        }
    }
`;

export const FormGrid = styled.form`
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto;
    gap: 12px;
    align-items: end;

    ${media.md} {
        grid-template-columns: 1fr;
    }
`;

export const Field = styled.div`
    display: grid;
    gap: 6px;

    label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-secondary);
    }

    input {
        min-height: var(--control-h, 44px);
        padding: 0 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-medium);
        background: var(--bg-field);
        color: var(--text-primary);
        font: inherit;
        font-weight: 400;
    }

    input:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
    }

    input[aria-invalid="true"] {
        border-color: var(--status-error-border);
    }
`;

export const FieldError = styled.span`
    font-size: var(--text-xs);
    font-weight: 400;
    color: var(--status-error-text);
`;

export const Muted = styled.span`
    color: var(--text-muted);
    font-size: var(--text-sm);
`;

/** Aviso no topo do painel (atraso, somente leitura, fim do teste). */
export const Notice = styled.section<{ $tone: SubscriptionTone }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    border: 1px solid ${({ $tone }) => toneVars[$tone].border};
    background: ${({ $tone }) => toneVars[$tone].bg};

    h2 {
        font-size: var(--text-lg);
        color: ${({ $tone }) => ($tone === "pending" ? "var(--status-pending-text-deep)" : toneVars[$tone].text)};
    }

    p {
        margin-top: 2px;
        max-width: 72ch;
        color: ${({ $tone }) => toneVars[$tone].text};
        font-size: var(--text-sm);
        line-height: 1.5;
    }

    ${({ $tone }) => $tone === "error" && css`
        p { color: var(--text-primary); }
    `}

    button {
        min-height: 44px;
        padding: 0 18px;
        border: 0;
        border-radius: var(--radius-md);
        background: var(--brand);
        color: var(--on-brand);
        font: inherit;
        font-size: var(--text-sm);
        font-weight: 700;
        cursor: pointer;
    }

    button:hover {
        background: var(--brand-dark);
    }

    button:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
    }

    ${media.sm} {
        button {
            width: 100%;
        }
    }
`;
