import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { cancelReservation, listReservationsPaginated } from "../../services/reservation";
import { usePagination } from "../../hooks/usePagination";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { PLAN_LABELS, formatDate, formatTime, formatCurrency, calcDuration } from "../../utils/reservationFormat";
import { STATUS_MAP, REFUND_TIERS, getRefundPercentage } from "../../constants/reservation";
import { animateFadeInUp } from "../../utils/animations";
import type { Reservation } from "../../types";
import * as S from "./styles";

/**
 * Página que lista as reservas do usuário autenticado com paginação.
 *
 * Exibe status (PENDING/PAID/CANCELLED/EXPIRED), datas, duração e valor.
 * Reservas PENDING têm botão "Pagar" que navega para `/checkout/:reservationId`.
 * Reservas PENDING ou PAID podem ser canceladas com confirmação inline.
 *
 * @see GET /reservations?page=&limit=
 * @see PATCH /reservations/:id/cancel
 * @component
 */

function calcRefundEstimate(reservation: Reservation) {
    if (reservation.status !== "PAID") return null;

    const totalPaid = Number(reservation.payment?.amount ?? reservation.totalPrice ?? 0);
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysBeforeEvent = Math.max(0, Math.floor((startDate.getTime() - now.getTime()) / msPerDay));
    const percentage = getRefundPercentage(daysBeforeEvent);
    const refundAmount = Number((totalPaid * percentage / 100).toFixed(2));

    return { daysBeforeEvent, percentage, refundAmount, totalPaid };
}

const PAGE_SIZE = 10;

export default function Reservations() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { data: reservations, meta, isLoading, page, setPage, refresh } = usePagination(
        listReservationsPaginated,
        { limit: PAGE_SIZE, errorMessage: "Erro ao carregar reservas." }
    );

    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmCancelReservation, setConfirmCancelReservation] = useState<Reservation | null>(null);

    useGSAP(() => {
        if (isLoading || !reservations.length) return;
        const el = containerRef.current;
        if (!el) return;
        animateFadeInUp(el.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [isLoading, reservations.length] });

    async function handleCancelReservation() {
        const reservation = confirmCancelReservation;
        setConfirmCancelReservation(null);
        if (!reservation) return;
        try {
            setCancellingId(reservation.id);
            await cancelReservation(reservation.id);
            toast.success("Reserva cancelada com sucesso.");
            await refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao cancelar reserva."));
        } finally {
            setCancellingId(null);
        }
    }

    if (isLoading) {
        return (
            <S.Container>
                <S.Header>
                    <S.Title>Minhas reservas</S.Title>
                </S.Header>
                <S.LoadingCard>
                    <h2>Carregando reservas...</h2>
                    <p>Aguarde enquanto buscamos suas reservas.</p>
                </S.LoadingCard>
            </S.Container>
        );
    }

    if (!reservations.length && page === 1) {
        return (
            <S.Container>
                <S.Header>
                    <S.Title>Minhas reservas</S.Title>
                </S.Header>
                <S.EmptyState>
                    <h2>Nenhuma reserva encontrada</h2>
                    <p>Você ainda não tem reservas. Escolha um espaço e marque a data do seu evento.</p>
                    <S.PayButton as={Link} to="/venues">Fazer uma reserva</S.PayButton>
                </S.EmptyState>
            </S.Container>
        );
    }

    const refundEstimate = confirmCancelReservation
        ? calcRefundEstimate(confirmCancelReservation)
        : null;

    return (
        <S.Container ref={containerRef}>
            {confirmCancelReservation && (
                <S.ModalOverlay role="presentation">
                    <S.ModalBox
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-cancel-title"
                    >
                        <S.ModalTitle id="modal-cancel-title">Cancelar reserva</S.ModalTitle>

                        <S.PolicySection>
                            <S.PolicyTitle>Política de reembolso</S.PolicyTitle>
                            <S.PolicyList>
                                {REFUND_TIERS.map((tier) => (
                                    <S.PolicyTier key={tier.percentage} $highlighted={refundEstimate?.percentage === tier.percentage}>
                                        <span>{tier.label}</span>
                                        <strong>
                                            {tier.percentage === 0 ? "Sem reembolso" : `${tier.percentage}% de reembolso`}
                                        </strong>
                                    </S.PolicyTier>
                                ))}
                            </S.PolicyList>
                        </S.PolicySection>

                        {refundEstimate ? (
                            <S.RefundCard>
                                <S.RefundCardTitle>Seu reembolso estimado</S.RefundCardTitle>
                                <S.RefundRow>
                                    <span>Dias até o evento</span>
                                    <strong>{refundEstimate.daysBeforeEvent} dia{refundEstimate.daysBeforeEvent !== 1 ? "s" : ""}</strong>
                                </S.RefundRow>
                                <S.RefundRow>
                                    <span>Valor pago</span>
                                    <strong>{formatCurrency(refundEstimate.totalPaid)}</strong>
                                </S.RefundRow>
                                <S.RefundRow $accent={refundEstimate.refundAmount > 0}>
                                    <span>Valor do reembolso</span>
                                    <strong>
                                        {refundEstimate.refundAmount > 0
                                            ? `${formatCurrency(refundEstimate.refundAmount)} (${refundEstimate.percentage}%)`
                                            : "Sem reembolso"}
                                    </strong>
                                </S.RefundRow>
                            </S.RefundCard>
                        ) : (
                            <S.RefundCard $neutral>
                                <S.RefundCardTitle>Sem cobrança</S.RefundCardTitle>
                                <S.ModalBody>
                                    Esta reserva ainda não foi paga, portanto o cancelamento não gera nenhuma cobrança.
                                </S.ModalBody>
                            </S.RefundCard>
                        )}

                        <S.ModalActions>
                            <S.ModalCancelBtn onClick={() => setConfirmCancelReservation(null)}>
                                Voltar
                            </S.ModalCancelBtn>
                            <S.ModalConfirmBtn
                                onClick={handleCancelReservation}
                                disabled={cancellingId !== null}
                            >
                                {cancellingId ? "Cancelando..." : "Sim, cancelar"}
                            </S.ModalConfirmBtn>
                        </S.ModalActions>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}

            <S.Header className="anim-header">
                <S.Title>Minhas reservas</S.Title>
                <S.Description>
                    Acompanhe o status das suas reservas e gerencie seus eventos.
                    {meta?.total != null && ` ${meta.total} reserva${meta.total !== 1 ? "s" : ""} no total.`}
                </S.Description>
            </S.Header>

            <S.List>
                {reservations.map((reservation) => {
                    const status = STATUS_MAP[reservation.status] ?? { label: reservation.status, color: "gray" };
                    const duration = calcDuration(reservation.startDate, reservation.endDate);
                    const canCancel = reservation.status === "PENDING" || reservation.status === "PAID";

                    return (
                        <S.Card className="anim-card" key={reservation.id}>
                            <S.CardHeader>
                                <div>
                                    <strong>{reservation.venue?.name || "Salão"}</strong>
                                    <span>
                                        {formatDate(reservation.startDate)} •{" "}
                                        {formatTime(reservation.startDate)}
                                    </span>
                                </div>

                                <S.Status status={reservation.status}>
                                    {status.label}
                                </S.Status>
                            </S.CardHeader>

                            <S.CardBody>
                                <div>
                                    <span>Plano</span>
                                    <strong>
                                        {reservation.planCode ? (PLAN_LABELS[reservation.planCode] || reservation.planCode) : "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Duração</span>
                                    <strong>{duration} hora{duration !== 1 ? "s" : ""}</strong>
                                </div>

                                <div>
                                    <span>Valor</span>
                                    <strong>{formatCurrency(reservation.totalPrice)}</strong>
                                </div>
                            </S.CardBody>

                            {canCancel && (
                            <S.CardFooter>
                                {reservation.status === "PENDING" && (
                                    <S.PayButton
                                        onClick={() => navigate(`/checkout/${reservation.id}`)}
                                    >
                                        Ir para pagamento
                                    </S.PayButton>
                                )}

                                {canCancel && (
                                    <S.CancelButton
                                        onClick={() => setConfirmCancelReservation(reservation)}
                                        disabled={cancellingId === reservation.id}
                                    >
                                        {cancellingId === reservation.id ? "Cancelando..." : "Cancelar reserva"}
                                    </S.CancelButton>
                                )}
                            </S.CardFooter>
                            )}
                        </S.Card>
                    );
                })}
            </S.List>

            {meta && (meta.totalPages ?? 1) > 1 && (
                <S.Pagination>
                    <S.PageButton
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        ← Anterior
                    </S.PageButton>

                    <S.PageInfo>
                        Página {page} de {meta.totalPages ?? 1}
                    </S.PageInfo>

                    <S.PageButton
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= (meta.totalPages ?? 1) || isLoading}
                    >
                        Próxima →
                    </S.PageButton>
                </S.Pagination>
            )}
        </S.Container>
    );
}
