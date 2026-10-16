import { formatCents } from "../../../utils/reservationFormat";
import type { QuoteResult, Venue, VenuePackage } from "../../../types";
import * as S from "../styles";

interface ReservationSummaryProps {
    venue: Venue;
    selectedPackage: VenuePackage | null;
    eventDate: string;
    startTime: string;
    endTime: string;
    endsNextDay: boolean;
    guests: string;
    quote: QuoteResult | null;
    quoteError: string | null;
    quoteLoading: boolean;
    missing: string[];
}

/** Formata `YYYY-MM-DD` como "sáb., 14 de nov. de 2026". */
function formatEventDate(value: string): string {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/**
 * Coluna direita: o que foi escolhido e o orçamento itemizado da API. Nenhum valor é somado
 * aqui; quando a API recusa (horário fora do pacote, convidados demais, antecedência), mostra o motivo.
 */
export function ReservationSummary({
    venue, selectedPackage, eventDate, startTime, endTime, endsNextDay, guests, quote, quoteError, quoteLoading, missing,
}: ReservationSummaryProps) {
    return (
        <S.Card className="anim-card">
            <S.CardTitle>Resumo da reserva</S.CardTitle>

            <S.SummaryList>
                <S.SummaryItem>
                    <span>Espaço</span>
                    <strong>{venue.name}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Pacote</span>
                    <strong>{selectedPackage?.name || "Não escolhido"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Data</span>
                    <strong>{eventDate ? formatEventDate(eventDate) : "Não escolhida"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Horário</span>
                    <strong>{startTime && endTime ? `${startTime} às ${endTime}${endsNextDay ? " (dia seguinte)" : ""}` : "—"}</strong>
                </S.SummaryItem>
                <S.SummaryItem>
                    <span>Convidados</span>
                    <strong>{guests || "—"}</strong>
                </S.SummaryItem>
            </S.SummaryList>

            <S.Divider />

            <div aria-live="polite">
                {quoteLoading && <S.QuoteLoading>Calculando orçamento...</S.QuoteLoading>}

                {!quoteLoading && quoteError && (
                    <S.QuoteError role="alert">{quoteError}</S.QuoteError>
                )}

                {!quoteLoading && !quoteError && !quote && missing.length > 0 && (
                    <S.QuoteLoading>Para ver o orçamento, falta escolher {missing.join(", ")}.</S.QuoteLoading>
                )}

                {quote && !quoteLoading && !quoteError && (
                    <>
                        <S.QuoteList>
                            {quote.items.map((item, i) => (
                                <S.SummaryItem key={`${item.type}-${i}`}>
                                    <span>{item.type === "PLAN_BASE" ? `Pacote ${quote.packageName ?? selectedPackage?.name ?? ""}`.trim() : item.description}</span>
                                    <strong>{item.type === "INCLUDED_ITEM" ? "Incluso" : formatCents(item.totalAmountCents)}</strong>
                                </S.SummaryItem>
                            ))}

                            {quote.discountApplied && quote.discountCents > 0 && (
                                <>
                                    <S.SummaryItem>
                                        <span>Subtotal</span>
                                        <strong>{formatCents(quote.subtotalCents)}</strong>
                                    </S.SummaryItem>
                                    <S.SummaryItem>
                                        <span>Desconto ({quote.discountApplied.campaignName})</span>
                                        <strong>- {formatCents(quote.discountCents)}</strong>
                                    </S.SummaryItem>
                                </>
                            )}
                        </S.QuoteList>

                        <S.TotalRow>
                            <span>Total</span>
                            <strong>{formatCents(quote.totalCents)}</strong>
                        </S.TotalRow>

                        <S.PolicyBox>
                            <h3>Como fica o pagamento</h3>
                            <S.Hint style={{ marginTop: 0 }}>
                                {quote.paymentTerms?.depositCents != null
                                    ? `Você combina o pagamento com o salão. A reserva é confirmada com o sinal de ${formatCents(quote.paymentTerms.depositCents)} (${quote.paymentTerms.depositPercent}%); o restante, ${formatCents(quote.totalCents - quote.paymentTerms.depositCents)}, ${quote.paymentTerms.balanceDueDays != null ? `até ${quote.paymentTerms.balanceDueDays} dia${quote.paymentTerms.balanceDueDays === 1 ? "" : "s"} antes do evento` : "até o dia do evento"}.`
                                    : "Você combina o pagamento com o salão. A reserva é confirmada quando ele registrar o valor total."}
                            </S.Hint>
                        </S.PolicyBox>

                        {quote.cancellationPolicy?.summary?.length > 0 && (
                            <S.PolicyBox>
                                <h3>Se precisar cancelar</h3>
                                <ul>
                                    {quote.cancellationPolicy.summary.map((line) => <li key={line}>{line}</li>)}
                                </ul>
                                {quote.cancellationPolicy.notes && <S.Hint>{quote.cancellationPolicy.notes}</S.Hint>}
                            </S.PolicyBox>
                        )}
                    </>
                )}
            </div>
        </S.Card>
    );
}
