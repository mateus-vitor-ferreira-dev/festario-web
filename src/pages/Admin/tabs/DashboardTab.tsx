import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";
import { getMonthlyRevenue, getReservationsSummary } from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { animateFadeInUp } from "../../../utils/animations";
import { formatCurrency, MONTH_NAMES } from "./constants";
import type { MonthlyRevenue, PaymentMethod, ReservationSummary } from "../../../types";
import { METHOD_LABELS } from "../../../utils/paymentFormat";
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

    // Formas de pagamento que o salão registrou (#48), da que mais rendeu para a que menos rendeu.
    const methods = (Object.entries(summary.revenueByMethod ?? {}) as [PaymentMethod, { amount: number; count: number }][])
        .filter(([, v]) => v.count > 0 || v.amount !== 0)
        .sort(([, a], [, b]) => b.amount - a.amount);

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
                    <S.SummaryLabel>Receita</S.SummaryLabel>
                    <S.SummaryValue>{formatCurrency(summary.totalRevenue ?? 0)}</S.SummaryValue>
                    <S.SummarySubtitle>
                        recebido{summary.totalRefunded ? `, menos ${formatCurrency(summary.totalRefunded)} devolvidos` : ""}
                    </S.SummarySubtitle>
                </S.SummaryCard>

                {methods.map(([method, v]) => (
                    <S.SummaryCard key={method}>
                        <S.SummaryLabel>{METHOD_LABELS[method]}</S.SummaryLabel>
                        <S.SummaryValue>{formatCurrency(v.amount)}</S.SummaryValue>
                        <S.SummarySubtitle>{paymentCount(v.count)}</S.SummarySubtitle>
                    </S.SummaryCard>
                ))}
            </S.RevenueBreakdown>

            {monthly && (
                <>
                    <S.SectionTitle style={{ marginTop: 16 }}>Receita mensal de {monthly.year}</S.SectionTitle>
                    <S.TableWrapper>
                        <S.MonthlyTable>
                            <thead>
                                <tr>
                                    <S.MonthlyTh>Mês</S.MonthlyTh>
                                    <S.MonthlyTh $num $hideSm>Pagamentos</S.MonthlyTh>
                                    <S.MonthlyTh $num $hideSm>Devolvido</S.MonthlyTh>
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
                                        const empty = m.revenue === 0 && m.count === 0 && !m.refunded;
                                        return (
                                            <S.MonthlyTr key={m.month}>
                                                <S.MonthlyTd>{MONTH_NAMES[m.month - 1]}</S.MonthlyTd>
                                                <S.MonthlyTd $num $hideSm $muted={empty}>{m.count}</S.MonthlyTd>
                                                <S.MonthlyTd $num $hideSm $muted={!m.refunded}>{formatCurrency(m.refunded ?? 0)}</S.MonthlyTd>
                                                <S.MonthlyTd $num $muted={empty}>
                                                    {formatCurrency(m.revenue)}
                                                    <S.MonthlyCount aria-hidden="true">
                                                        {m.count} pagamento{m.count !== 1 ? "s" : ""}
                                                    </S.MonthlyCount>
                                                </S.MonthlyTd>
                                                <S.MonthlyTd>
                                                    <S.RevenueBar $pct={Math.max(0, Math.round((m.revenue / maxRevenue) * 100))} />
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
