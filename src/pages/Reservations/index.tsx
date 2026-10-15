import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { cancelReservation, listReservationsPaginated } from "../../services/reservation";
import { getReservationContract } from "../../services/contract";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { useListParams } from "../../hooks/useListParams";
import { NoResults, Pagination, SelectField } from "../../components";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { packageLabel, formatDate, formatTime, formatCurrency, calcDuration } from "../../utils/reservationFormat";
import { describeTiers, refundEstimate } from "../../utils/cancellationPolicy";
import { STATUS_MAP } from "../../constants/reservation";
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
 * Filtro de status e página ficam na URL (`?status=PAID&page=2`).
 *
 * O cliente tem uma conta só para todos os salões: cada card mostra o salão da reserva,
 * e cancelar/pagar vai para o salão dela (`X-Tenant-Slug` do item).
 *
 * @see GET /reservations?page=&limit=&status=
 * @see PATCH /reservations/:id/cancel
 * @component
 */

/** Reembolso de uma reserva paga pela política gravada nela (#46); nulo se não foi paga. */
function calcRefundEstimate(reservation: Reservation) {
    if (reservation.status !== "PAID") return null;
    const totalPaid = Number(reservation.payment?.amount ?? reservation.totalPrice ?? 0);
    return refundEstimate(totalPaid, reservation.cancellationPolicy?.tiers ?? [], reservation.startDate);
}

/** Faixas da política da reserva em duas partes ("Com 30 dias ou mais de antecedência" / "100% de reembolso"). */
function policyRows(reservation: Reservation): { when: string; refund: string }[] {
    const policy = reservation.cancellationPolicy;
    if (!policy) return [];
    const lines = policy.summary?.length ? policy.summary : describeTiers(policy.tiers);
    return lines.map((line) => {
        const cut = line.lastIndexOf(": ");
        const refund = cut >= 0 ? line.slice(cut + 2) : "";
        return { when: cut >= 0 ? line.slice(0, cut) : line, refund: refund.charAt(0).toUpperCase() + refund.slice(1) };
    });
}

const PAGE_SIZE = 10;

const FILTER_KEYS = ["status"] as const;

const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Todas" },
    { value: "PENDING", label: "Aguardando pagamento" },
    { value: "PAID", label: "Pagas" },
    { value: "CANCELLED", label: "Canceladas" },
    { value: "EXPIRED", label: "Expiradas" },
];

export default function Reservations() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const listTopRef = useRef<HTMLDivElement | null>(null);
    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams(FILTER_KEYS);
    const params = useMemo(() => ({ ...values, page, limit: PAGE_SIZE }), [values, page]);
    const { data: reservations, meta, isLoading, isFetching, refresh } = usePaginatedQuery(
        listReservationsPaginated,
        params,
        { errorMessage: "Erro ao carregar reservas.", onPageOutOfRange: setPage },
    );
    const hasFilters = activeKeys.length > 0;

    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [contractId, setContractId] = useState<string | null>(null);

    /** Contrato aceito da reserva (#47), gerado em PDF no navegador. */
    async function handleDownloadContract(reservation: Reservation) {
        try {
            setContractId(reservation.id);
            const [contract, { downloadContract }] = await Promise.all([
                getReservationContract(reservation.id, reservation.tenant?.slug),
                import("../../components/Contract/download"),
            ]);
            await downloadContract(contract);
        } catch (error) {
            toast.error(getErrorMessage(error, "Não foi possível baixar o contrato."));
        } finally {
            setContractId(null);
        }
    }
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
            await cancelReservation(reservation.id, reservation.tenant?.slug);
            toast.success("Reserva cancelada com sucesso.");
            refresh();
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

    if (!reservations.length && page === 1 && !hasFilters) {
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

                        {policyRows(confirmCancelReservation).length > 0 && (
                            <S.PolicySection>
                                <S.PolicyTitle>Política de reembolso desta reserva</S.PolicyTitle>
                                <S.PolicyList>
                                    {policyRows(confirmCancelReservation).map((row, i) => (
                                        <S.PolicyTier key={row.when} $highlighted={refundEstimate?.tierIndex === i}>
                                            <span>{row.when}</span>
                                            <strong>{row.refund}</strong>
                                        </S.PolicyTier>
                                    ))}
                                </S.PolicyList>
                                {confirmCancelReservation.cancellationPolicy?.notes && (
                                    <S.ModalBody>{confirmCancelReservation.cancellationPolicy.notes}</S.ModalBody>
                                )}
                            </S.PolicySection>
                        )}

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
                    {meta?.total != null && !hasFilters && ` ${meta.total} reserva${meta.total !== 1 ? "s" : ""} no total.`}
                </S.Description>
            </S.Header>

            <S.Toolbar ref={listTopRef} tabIndex={-1}>
                <S.FilterSlot>
                    <SelectField
                        label="Mostrar reservas"
                        value={values.status}
                        onChange={(v) => setFilter("status", v)}
                        options={STATUS_FILTER_OPTIONS}
                    />
                </S.FilterSlot>
                {hasFilters && meta?.total != null && (
                    <S.ResultCount aria-live="polite">
                        {meta.total} reserva{meta.total !== 1 ? "s" : ""} encontrada{meta.total !== 1 ? "s" : ""}
                    </S.ResultCount>
                )}
            </S.Toolbar>

            {reservations.length === 0 && (
                <NoResults
                    title="Nenhuma reserva com esse status"
                    description="Escolha outro status ou veja todas as suas reservas."
                    onClear={clearFilters}
                    clearLabel="Ver todas as reservas"
                />
            )}

            <S.List aria-busy={isFetching} $busy={isFetching}>
                {reservations.map((reservation) => {
                    const status = STATUS_MAP[reservation.status] ?? { label: reservation.status, color: "gray" };
                    const duration = calcDuration(reservation.startDate, reservation.endDate);
                    const canCancel = reservation.status === "PENDING" || reservation.status === "PAID";

                    return (
                        <S.Card className="anim-card" key={reservation.id}>
                            <S.CardHeader>
                                <div>
                                    <strong>{reservation.venue?.name || "Salão"}</strong>
                                    {reservation.tenant?.name && <S.SalonName>{reservation.tenant.name}</S.SalonName>}
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
                                    <span>Pacote</span>
                                    <strong>{packageLabel(reservation)}</strong>
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

                            <S.CardFooter>
                                <S.ContractButton
                                    type="button"
                                    onClick={() => handleDownloadContract(reservation)}
                                    disabled={contractId === reservation.id}
                                    aria-busy={contractId === reservation.id}
                                >
                                    {contractId === reservation.id ? "Gerando contrato..." : "Baixar contrato"}
                                </S.ContractButton>
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
                        </S.Card>
                    );
                })}
            </S.List>

            {meta && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    count={reservations.length}
                    hasNext={meta.hasNext}
                    onChange={setPage}
                    scrollTargetRef={listTopRef}
                    disabled={isFetching}
                    label="Paginação das reservas"
                />
            )}
        </S.Container>
    );
}
