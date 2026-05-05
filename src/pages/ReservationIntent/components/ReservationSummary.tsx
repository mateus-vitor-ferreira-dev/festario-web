import { formatCents } from "../../../utils/reservationFormat";
import type { Venue } from "../../../types";
import * as S from "../styles";

interface QuoteItem {
    type?: string;
    description?: string;
    label?: string;
    amountCents?: number;
    totalAmountCents?: number;
    totalCents?: number;
    totalAmount?: number;
    amount?: number;
}

interface NormalizedQuote {
    totalCents: number;
    subtotalCents: number;
    discountCents: number;
    discountApplied: boolean;
    items?: QuoteItem[];
}

interface Plan {
    code: string;
    label: string;
    days: string;
    priceCents: number;
}

interface ReservationSummaryProps {
    venue: Venue;
    selectedPlan: Plan | null;
    eventDate: string;
    startTime: string;
    endTime: string;
    kidsMonitorHours: number;
    normalizedQuote: NormalizedQuote | null;
    quoteLoading: boolean;
}

/**
 * Coluna direita: resumo dos campos selecionados e breakdown da cotação.
 */
export function ReservationSummary({
    venue,
    selectedPlan,
    eventDate,
    startTime,
    endTime,
    kidsMonitorHours,
    normalizedQuote,
    quoteLoading,
}: ReservationSummaryProps) {
    return (
        <S.Card className="anim-card">
            <S.CardTitle>Resumo da reserva</S.CardTitle>

            <S.SummaryList>
                <S.SummaryItem>
                    <span>Salão</span>
                    <strong>{venue.name}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Plano</span>
                    <strong>{selectedPlan?.label || "Não selecionado"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Data</span>
                    <strong>{eventDate || "Não selecionada"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Início</span>
                    <strong>{startTime || "—"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Término</span>
                    <strong>{endTime || "—"}</strong>
                </S.SummaryItem>
                {kidsMonitorHours > 0 && (
                    <S.SummaryItem>
                        <span>Monitor kids</span>
                        <strong>{kidsMonitorHours}h</strong>
                    </S.SummaryItem>
                )}
            </S.SummaryList>

            <S.Divider />

            {quoteLoading && <S.QuoteLoading>Calculando cotação...</S.QuoteLoading>}

            {normalizedQuote && !quoteLoading && (
                <>
                    {normalizedQuote.items?.map((item, i) => (
                        <S.SummaryItem key={i}>
                            <span>
                                {item.type === "PLAN_BASE"
                                    ? `Plano: ${selectedPlan?.label || item.description || item.label}`
                                    : item.type === "KIDS_MONITOR_EXTRA_HOUR"
                                        ? "Horas extras área kids"
                                        : item.description || item.label}
                            </span>
                            <strong>
                                {formatCents(
                                    item.totalAmountCents ?? item.amountCents ?? item.totalCents ??
                                    item.totalAmount ?? item.amount ?? 0
                                )}
                            </strong>
                        </S.SummaryItem>
                    ))}

                    {normalizedQuote.discountApplied && (
                        <>
                            <S.SummaryItem>
                                <span>Subtotal</span>
                                <strong>{formatCents(normalizedQuote.subtotalCents)}</strong>
                            </S.SummaryItem>
                            <S.SummaryItem>
                                <span>Desconto</span>
                                <strong>- {formatCents(normalizedQuote.discountCents)}</strong>
                            </S.SummaryItem>
                        </>
                    )}

                    <S.TotalRow>
                        <span>Total</span>
                        <strong>{formatCents(normalizedQuote.totalCents)}</strong>
                    </S.TotalRow>
                </>
            )}

            {!normalizedQuote && !quoteLoading && selectedPlan && (
                <S.TotalRow>
                    <span>Valor base do plano</span>
                    <strong>{formatCents(selectedPlan.priceCents)}</strong>
                </S.TotalRow>
            )}
        </S.Card>
    );
}
