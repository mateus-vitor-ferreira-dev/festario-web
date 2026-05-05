import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";
import { getMonthlyRevenue, getReservationsSummary } from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { animateStagger } from "../../../utils/animations";
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
    }, []);

    useGSAP(() => {
        if (isLoading || !sectionRef.current) return;
        animateStagger(sectionRef.current.querySelectorAll(".anim-card"));
    }, { scope: sectionRef, dependencies: [isLoading] });

    if (isLoading) return <S.LoadingSpinner />;
    if (!summary) return null;

    const stripe = summary.revenueByMethod?.stripe;
    const pix = summary.revenueByMethod?.pix;

    return (
        <S.Section ref={sectionRef}>
            <S.SectionTitle>Visão geral</S.SectionTitle>
            <S.SummaryGrid>
                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Total de reservas</S.SummaryLabel>
                    <S.SummaryValue>{summary.totalReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>

                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Receita confirmada</S.SummaryLabel>
                    <S.SummaryValue $accent>{formatCurrency(summary.totalRevenue ?? 0)}</S.SummaryValue>
                </S.SummaryCard>

                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Pendentes</S.SummaryLabel>
                    <S.SummaryValue>{summary.pendingReservations ?? 0}</S.SummaryValue>
                    <S.SummarySubtitle>aguardando pagamento</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Pagas</S.SummaryLabel>
                    <S.SummaryValue>{summary.paidReservations ?? 0}</S.SummaryValue>
                    <S.SummarySubtitle>confirmadas</S.SummarySubtitle>
                </S.SummaryCard>

                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Canceladas</S.SummaryLabel>
                    <S.SummaryValue>{summary.cancelledReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>

                <S.SummaryCard className="anim-card">
                    <S.SummaryLabel>Expiradas</S.SummaryLabel>
                    <S.SummaryValue>{summary.expiredReservations ?? 0}</S.SummaryValue>
                </S.SummaryCard>
            </S.SummaryGrid>

            <S.SectionTitle style={{ marginTop: "32px" }}>Receita por método</S.SectionTitle>
            <S.RevenueBreakdown>
                <S.RevenueMethodCard className="anim-card">
                    <S.RevenueMethodIcon>💳</S.RevenueMethodIcon>
                    <S.RevenueMethodInfo>
                        <S.SummaryLabel>Cartão de Crédito</S.SummaryLabel>
                        <S.SummaryValue $accent>{formatCurrency(stripe?.amount ?? 0)}</S.SummaryValue>
                        <S.SummarySubtitle>{stripe?.count ?? 0} pagamento{stripe?.count !== 1 ? "s" : ""}</S.SummarySubtitle>
                    </S.RevenueMethodInfo>
                </S.RevenueMethodCard>

                <S.RevenueMethodCard className="anim-card">
                    <S.RevenueMethodIcon>⚡</S.RevenueMethodIcon>
                    <S.RevenueMethodInfo>
                        <S.SummaryLabel>PIX</S.SummaryLabel>
                        <S.SummaryValue $accent>{formatCurrency(pix?.amount ?? 0)}</S.SummaryValue>
                        <S.SummarySubtitle>{pix?.count ?? 0} pagamento{pix?.count !== 1 ? "s" : ""}</S.SummarySubtitle>
                    </S.RevenueMethodInfo>
                </S.RevenueMethodCard>
            </S.RevenueBreakdown>

            {monthly && (
                <>
                    <S.SectionTitle style={{ marginTop: "32px" }}>Receita mensal — {monthly.year}</S.SectionTitle>
                    <S.TableWrapper>
                        <S.MonthlyTable>
                            <thead>
                                <tr>
                                    <S.MonthlyTh>Mês</S.MonthlyTh>
                                    <S.MonthlyTh>Receita</S.MonthlyTh>
                                    <S.MonthlyTh>Reservas</S.MonthlyTh>
                                    <S.MonthlyTh>Cartão</S.MonthlyTh>
                                    <S.MonthlyTh>PIX</S.MonthlyTh>
                                    <S.MonthlyTh style={{ width: "160px" }}></S.MonthlyTh>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const maxRevenue = Math.max(...monthly.months.map((m) => m.revenue), 1);
                                    return monthly.months.map((m) => (
                                        <S.MonthlyTr key={m.month}>
                                            <S.MonthlyTd>{MONTH_NAMES[m.month - 1]}</S.MonthlyTd>
                                            <S.MonthlyTd>{formatCurrency(m.revenue)}</S.MonthlyTd>
                                            <S.MonthlyTd>{m.count}</S.MonthlyTd>
                                            <S.MonthlyTd>{formatCurrency(m.stripe)}</S.MonthlyTd>
                                            <S.MonthlyTd>{formatCurrency(m.pix)}</S.MonthlyTd>
                                            <S.MonthlyTd>
                                                <S.RevenueBar $pct={Math.round((m.revenue / maxRevenue) * 100)} />
                                            </S.MonthlyTd>
                                        </S.MonthlyTr>
                                    ));
                                })()}
                            </tbody>
                        </S.MonthlyTable>
                    </S.TableWrapper>
                </>
            )}
        </S.Section>
    );
}
