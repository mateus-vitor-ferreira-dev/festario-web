import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cancelAdminReservation, listAdminReservations } from "../../../services/admin";
import { isAbortError } from "../../../utils/errors";
import { DatePickerInput } from "../../../components";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { Reservation } from "../../../types";
import {
    formatCurrency,
    formatDateTime,
    getRefundPercentage,
    STATUS_LABELS,
    STATUS_OPTIONS,
} from "./constants";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

interface CancelModal {
    id: string;
    status: string;
    startDate: string;
    totalPrice: number;
    daysBeforeEvent?: number;
    refundPct?: number;
    refundAmount?: number;
}

export function ReservationsTab() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [status, setStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<CancelModal | null>(null);
    const limit = 15;

    async function load(currentPage = 1, signal?: AbortSignal) {
        try {
            setIsLoading(true);
            const filters: Record<string, unknown> = { page: currentPage, limit };
            if (status) filters.status = status;
            if (startDate) filters.startDate = new Date(startDate).toISOString();
            if (endDate) filters.endDate = new Date(endDate + "T23:59:59").toISOString();
            const result = await listAdminReservations(filters, signal);
            if (signal?.aborted) return;
            const list = result ?? [];
            setReservations(list);
            setHasMore(list.length === limit);
        } catch (error) {
            if (isAbortError(error)) return;
            toast.error(getErrorMessage(error, "Erro ao carregar reservas."));
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        setPage(1);
        load(1, controller.signal);
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, startDate, endDate]);

    function handlePageChange(next: number) {
        setPage(next);
        load(next);
    }

    function handleCancelClick(r: Reservation) {
        if (r.status === "PENDING") {
            setCancelModal({ id: r.id, status: r.status, startDate: r.startDate, totalPrice: r.totalPrice });
        } else {
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysBeforeEvent = Math.max(0, Math.floor((new Date(r.startDate).getTime() - Date.now()) / msPerDay));
            const refundPct = getRefundPercentage(daysBeforeEvent);
            const refundAmount = (Number(r.totalPrice) * refundPct) / 100;
            setCancelModal({ id: r.id, status: r.status, startDate: r.startDate, totalPrice: r.totalPrice, daysBeforeEvent, refundPct, refundAmount });
        }
    }

    async function handleConfirmCancel() {
        if (!cancelModal) return;
        try {
            setCancellingId(cancelModal.id);
            setCancelModal(null);
            await cancelAdminReservation(cancelModal.id);
            toast.success("Reserva cancelada.");
            load(page);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao cancelar reserva."));
        } finally {
            setCancellingId(null);
        }
    }

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Todas as reservas</S.SectionTitle>
            </S.SectionHeader>

            <S.FiltersRow>
                <S.Select value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </S.Select>
                <S.FilterField>
                    <DatePickerInput
                        value={startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                        placeholder="Data inicial"
                    />
                </S.FilterField>
                <S.FilterField>
                    <DatePickerInput
                        value={endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                        placeholder="Data final"
                    />
                </S.FilterField>
            </S.FiltersRow>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : reservations.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhuma reserva encontrada</h3>
                    <p>Tente ajustar os filtros.</p>
                </S.EmptyState>
            ) : (
                <>
                    <S.TableWrapper>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th>Cliente</S.Th>
                                    <S.Th>Espaço</S.Th>
                                    <S.Th>Início</S.Th>
                                    <S.Th>Fim</S.Th>
                                    <S.Th>Plano</S.Th>
                                    <S.Th $num>Valor</S.Th>
                                    <S.Th>Status</S.Th>
                                    <S.Th></S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <S.Tr key={r.id}>
                                        <S.Td>{r.user?.name ?? (r.userId ? r.userId.slice(0, 8) + "..." : "—")}</S.Td>
                                        <S.Td>{r.venue?.name ?? r.venueId}</S.Td>
                                        <S.Td>{formatDateTime(r.startDate)}</S.Td>
                                        <S.Td>{formatDateTime(r.endDate)}</S.Td>
                                        <S.Td>{r.planCode ?? "—"}</S.Td>
                                        <S.Td $num>{formatCurrency(r.totalPrice ?? 0)}</S.Td>
                                        <S.Td>
                                            <S.StatusBadge $status={r.status}>
                                                {STATUS_LABELS[r.status] ?? r.status}
                                            </S.StatusBadge>
                                        </S.Td>
                                        <S.Td>
                                            {(r.status === "PENDING" || r.status === "PAID") && (
                                                <S.DangerButton
                                                    $size="sm"
                                                    onClick={() => handleCancelClick(r)}
                                                    disabled={cancellingId === r.id}
                                                >
                                                    {cancellingId === r.id ? "..." : "Cancelar"}
                                                </S.DangerButton>
                                            )}
                                        </S.Td>
                                    </S.Tr>
                                ))}
                            </tbody>
                        </S.Table>
                    </S.TableWrapper>

                    <S.Pagination>
                        <S.PageButton onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Anterior</S.PageButton>
                        <S.PageInfo>Página {page}</S.PageInfo>
                        <S.PageButton onClick={() => handlePageChange(page + 1)} disabled={!hasMore}>Próxima</S.PageButton>
                    </S.Pagination>
                </>
            )}

            {cancelModal && (
                <S.ModalOverlay onClick={() => setCancelModal(null)}>
                    <S.ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setCancelModal(null)}>Cancelar reserva</ModalHeader>

                        {cancelModal.status === "PAID" ? (
                            <>
                                <S.ModalText>Esta reserva já foi <strong>paga</strong>. O reembolso segue a política de cancelamento:</S.ModalText>
                                <S.RefundSummary>
                                    <div>
                                        <dt>Dias até o evento</dt>
                                        <dd>{cancelModal.daysBeforeEvent}</dd>
                                    </div>
                                    <div>
                                        <dt>Percentual de reembolso</dt>
                                        <dd>{cancelModal.refundPct}%</dd>
                                    </div>
                                    <div>
                                        <dt>Valor a reembolsar</dt>
                                        <dd>{formatCurrency(cancelModal.refundAmount ?? 0)}</dd>
                                    </div>
                                </S.RefundSummary>
                                {cancelModal.refundPct === 0 && (
                                    <S.RefundWarning>Cancelamento fora do prazo: não há reembolso.</S.RefundWarning>
                                )}
                                <S.ModalNote>O reembolso é processado automaticamente na forma de pagamento original.</S.ModalNote>
                            </>
                        ) : (
                            <S.ModalText>
                                Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                            </S.ModalText>
                        )}

                        <S.ModalActions>
                            <S.SecondaryButton onClick={() => setCancelModal(null)}>Voltar</S.SecondaryButton>
                            <S.DangerButton onClick={handleConfirmCancel}>Confirmar cancelamento</S.DangerButton>
                        </S.ModalActions>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
