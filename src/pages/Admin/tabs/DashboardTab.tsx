import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";
import { getMonthlyRevenue, getReservationsSummary } from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { animateFadeInUp } from "../../../utils/animations";
import { formatCurrency, MONTH_NAMES } from "./constants";
import type { ReservationSummary, MonthlyRevenue } from "../../../types";
import * as S from "../styles";

export function DashboardTab() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [summary, setSummary] = useState<ReservationSummary | null>(null);
    const [monthly, setMonthly] = useState<MonthlyRevenue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        async function load() {
            try {
                const [summaryData, monthlyData] = await Promise.all([
                    getReservationsSummary(),
                    getMonthlyRevenue(currentYear),
                ]);
                setSummary(summaryData);
                setMonthly(monthlyData);
            } catch (error) {
                toast.error(getErrorMessage(error, "Erro ao carregar métricas."));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [currentYear]);

    useGSAP(() => {
        if (isLoading || !sectionRef.current) return;
        animateFadeInUp(sectionRef.current);
    }, { scope: sectionRef, dependencies: [isLoading] });

    if (isLoading) return <S.LoadingSpinner />;
    if (!summary) return null;

    const stripe = summary.revenueByMethod?.stripe;
    const pix = summary.revenueByMethod?.pix;

    const paymentCount = (count?: number) => `${count ?? 0} pagamento${count !== 1 ? "s" : ""}`;

    return (
        <S.Section ref={sectionRef}>
            <S.SectionTitle>Visão geral</S.SectionTitle>
            <S.SummaryGrid>
                <S.SummaryCard>
                    <S.SummaryLabel>Total de reservas</S.SummaryLabel>
                    <S.SummaryValue>{summary.totalReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>Pagas</S.SummaryLabel>
                    <S.SummaryValue>{summary.paidReservations ?? 0}</S.SummaryValue>
                    <S.SummarySubtitle>confirmadas</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>Pendentes</S.SummaryLabel>
                    <S.SummaryValue>{summary.pendingReservations ?? 0}</S.SummaryValue>
                    <S.SummarySubtitle>aguardando pagamento</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>Canceladas</S.SummaryLabel>
                    <S.SummaryValue>{summary.cancelledReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>Expiradas</S.SummaryLabel>
                    <S.SummaryValue>{summary.expiredReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>
            </S.SummaryGrid>

            <S.SectionTitle style={{ marginTop: 16 }}>Receita</S.SectionTitle>
            <S.RevenueBreakdown>
                <S.SummaryCard>
                    <S.SummaryLabel>Receita confirmada</S.SummaryLabel>
                    <S.SummaryValue>{formatCurrency(summary.totalRevenue ?? 0)}</S.SummaryValue>
                    <S.SummarySubtitle>reservas pagas</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>Cartão de crédito</S.SummaryLabel>
                    <S.SummaryValue>{formatCurrency(stripe?.amount ?? 0)}</S.SummaryValue>
                    <S.SummarySubtitle>{paymentCount(stripe?.count)}</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard>
                    <S.SummaryLabel>PIX</S.SummaryLabel>
                    <S.SummaryValue>{formatCurrency(pix?.amount ?? 0)}</S.SummaryValue>
                    <S.SummarySubtitle>{paymentCount(pix?.count)}</S.SummarySubtitle>
                </S.SummaryCard>
            </S.RevenueBreakdown>

            {monthly && (
                <>
                    <S.SectionTitle style={{ marginTop: 16 }}>Receita mensal de {monthly.year}</S.SectionTitle>
                    <S.TableWrapper>
                        <S.MonthlyTable>
                            <thead>
                                <tr>
                                    <S.MonthlyTh>Mês</S.MonthlyTh>
                                    <S.MonthlyTh $num $hideSm>Reservas</S.MonthlyTh>
                                    <S.MonthlyTh $num $hideSm>Cartão</S.MonthlyTh>
                                    <S.MonthlyTh $num $hideSm>PIX</S.MonthlyTh>
                                    <S.MonthlyTh $num>Receita</S.MonthlyTh>
                                    <S.MonthlyTh style={{ width: "28%" }}>
                                        <S.VisuallyHidden>Proporção da receita</S.VisuallyHidden>
                                    </S.MonthlyTh>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const maxRevenue = Math.max(...monthly.months.map((m) => m.revenue), 1);
                                    return monthly.months.map((m) => {
                                        const empty = m.revenue === 0 && m.count === 0;
                                        return (
                                            <S.MonthlyTr key={m.month}>
                                                <S.MonthlyTd>{MONTH_NAMES[m.month - 1]}</S.MonthlyTd>
                                                <S.MonthlyTd $num $hideSm $muted={empty}>{m.count}</S.MonthlyTd>
                                                <S.MonthlyTd $num $hideSm $muted={empty}>{formatCurrency(m.stripe)}</S.MonthlyTd>
                                                <S.MonthlyTd $num $hideSm $muted={empty}>{formatCurrency(m.pix)}</S.MonthlyTd>
                                                <S.MonthlyTd $num $muted={empty}>
                                                    {formatCurrency(m.revenue)}
                                                    <S.MonthlyCount aria-hidden="true">
                                                        {m.count} reserva{m.count !== 1 ? "s" : ""}
                                                    </S.MonthlyCount>
                                                </S.MonthlyTd>
                                                <S.MonthlyTd>
                                                    <S.RevenueBar $pct={Math.round((m.revenue / maxRevenue) * 100)} />
                                                </S.MonthlyTd>
                                            </S.MonthlyTr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </S.MonthlyTable>
                    </S.TableWrapper>
                </>
            )}
        </S.Section>
    );
}
