import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { cancelAdminReservation, listAdminReservationsPage } from "../../../services/admin";
import { listVenues } from "../../../services/venue";
import { listPackages } from "../../../services/salonRules";
import {
    ActiveFilterChips,
    DateField,
    FilterBar,
    MoneyRangeField,
    NoResults,
    Pagination,
    SelectField,
    TextField,
} from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { isAbortError } from "../../../utils/errors";
import { packageLabel } from "../../../utils/reservationFormat";
import { refundEstimate } from "../../../utils/cancellationPolicy";
import type { Reservation } from "../../../types";
import {
    formatCurrency,
    formatDateTime,
    STATUS_LABELS,
} from "./constants";
import {
    ALL_PACKAGES_OPTION,
    describeReservationChip,
    RESERVATION_FILTER_DEFAULTS,
    RESERVATION_FILTER_KEYS,
    RESERVATION_NON_FILTER_KEYS,
    RESERVATION_STATUS_OPTIONS,
    SORT_OPTIONS,
    type ReservationFilterKey,
} from "./reservationFilters";
import { ModalHeader } from "../ModalHeader";
import { PaymentsModal } from "./PaymentsModal";
import * as S from "../styles";

interface CancelModal {
    id: string;
    status: string;
    startDate: string;
    totalPrice: number;
    daysBeforeEvent?: number;
    refundPct?: number;
    refundAmount?: number;
    /** Frases da política gravada na reserva. */
    policy?: string[];
}

export const ADMIN_RESERVATIONS_PAGE_SIZE = 15;

export function ReservationsTab() {
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<CancelModal | null>(null);
    const [venueOptions, setVenueOptions] = useState([{ value: "", label: "Todos os espaços" }]);
    const [packageOptions, setPackageOptions] = useState([ALL_PACKAGES_OPTION]);
    const [paymentsFor, setPaymentsFor] = useState<Reservation | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);

    const list = useListParams<ReservationFilterKey>(RESERVATION_FILTER_KEYS, {
        defaults: RESERVATION_FILTER_DEFAULTS,
        nonFilterKeys: RESERVATION_NON_FILTER_KEYS,
    });
    const { values, page, activeKeys, setFilter, setFilters, setPage, clearFilters } = list;

    const params = useMemo(() => ({ ...values, page, limit: ADMIN_RESERVATIONS_PAGE_SIZE }), [values, page]);
    const { data: reservations, meta, isLoading, isFetching, refresh } = usePaginatedQuery(
        listAdminReservationsPage,
        params,
        { errorMessage: "Erro ao carregar reservas.", onPageOutOfRange: setPage },
    );

    useEffect(() => {
        const controller = new AbortController();
        listVenues(controller.signal)
            .then((venues) => setVenueOptions([
                { value: "", label: "Todos os espaços" },
                ...venues.map((v) => ({ value: v.id, label: v.name })),
            ]))
            // sem a lista de espaços o filtro fica só com "Todos os espaços"; a tabela segue funcionando
            .catch((error) => {
                if (!isAbortError(error)) toast.error(getErrorMessage(error, "Erro ao carregar os espaços."));
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        listPackages(controller.signal)
            .then((packages) => setPackageOptions([ALL_PACKAGES_OPTION, ...packages.map((p) => ({ value: p.id, label: p.name }))]))
            // sem a lista o filtro fica só com "Todos os pacotes"
            .catch((error) => {
                if (!isAbortError(error)) toast.error(getErrorMessage(error, "Erro ao carregar os pacotes."));
            });
        return () => controller.abort();
    }, []);

    const chips = activeKeys.map((key) => ({ key, label: describeReservationChip(key, values, venueOptions, packageOptions) }));
    const hasFilters = activeKeys.length > 0;

    function handleCancelClick(r: Reservation) {
        // A devolução é sobre o que o salão já recebeu (pode ser só o sinal, mesmo em reserva pendente).
        const received = Number(r.payment?.amount ?? 0) - Number(r.payment?.refundAmount ?? 0);
        if (!(received > 0)) {
            setCancelModal({ id: r.id, status: r.status, startDate: r.startDate, totalPrice: r.totalPrice });
        } else {
            const { daysBeforeEvent, percentage: refundPct, refundAmount } = refundEstimate(Math.max(0, received), r.cancellationPolicy?.tiers ?? [], r.startDate);
            setCancelModal({ id: r.id, status: r.status, startDate: r.startDate, totalPrice: r.totalPrice, daysBeforeEvent, refundPct, refundAmount, policy: r.cancellationPolicy?.summary });
        }
    }

    async function handleConfirmCancel() {
        if (!cancelModal) return;
        try {
            setCancellingId(cancelModal.id);
            setCancelModal(null);
            await cancelAdminReservation(cancelModal.id);
            toast.success("Reserva cancelada.");
            refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao cancelar reserva."));
        } finally {
            setCancellingId(null);
        }
    }

    return (
        <S.Section>
            <S.ScrollAnchor ref={topRef} tabIndex={-1}>
                <S.SectionHeader>
                    <S.SectionTitle>Todas as reservas</S.SectionTitle>
                    {meta?.total !== undefined && (
                        <S.ResultCount aria-live="polite">
                            {meta.total.toLocaleString("pt-BR")} reserva{meta.total === 1 ? "" : "s"}
                            {hasFilters ? " com esses filtros" : ""}
                        </S.ResultCount>
                    )}
                </S.SectionHeader>
            </S.ScrollAnchor>

            <FilterBar
                label="Filtrar reservas"
                activeCount={activeKeys.length}
                footer={
                    <ActiveFilterChips
                        chips={chips}
                        onRemove={(key) => setFilter(key as ReservationFilterKey, "")}
                        onClearAll={clearFilters}
                    />
                }
            >
                <TextField
                    label="Cliente"
                    placeholder="Nome ou e-mail"
                    value={values.q}
                    onChange={(v) => setFilter("q", v)}
                    wide
                />
                <SelectField
                    label="Status"
                    value={values.status}
                    onChange={(v) => setFilter("status", v)}
                    options={RESERVATION_STATUS_OPTIONS}
                />
                <SelectField
                    label="Espaço"
                    value={values.venueId}
                    onChange={(v) => setFilter("venueId", v)}
                    options={venueOptions}
                />
                <SelectField
                    label="Pacote"
                    value={values.packageId}
                    onChange={(v) => setFilter("packageId", v)}
                    options={packageOptions}
                />
                <DateField
                    label="Evento a partir de"
                    value={values.startDate}
                    maxDate={values.endDate || undefined}
                    onChange={(v) => setFilter("startDate", v)}
                />
                <DateField
                    label="Evento até"
                    value={values.endDate}
                    minDate={values.startDate || undefined}
                    onChange={(v) => setFilter("endDate", v)}
                />
                <MoneyRangeField
                    label="Valor da reserva"
                    min={values.minPrice}
                    max={values.maxPrice}
                    onChange={({ min, max }) => setFilters({ minPrice: min, maxPrice: max })}
                />
                <SelectField
                    label="Ordenar por"
                    value={values.sort}
                    onChange={(v) => setFilter("sort", v)}
                    options={SORT_OPTIONS}
                />
            </FilterBar>

            {isLoading ? (
                <S.LoadingSpinner role="status" aria-label="Carregando reservas" />
            ) : reservations.length === 0 ? (
                hasFilters ? (
                    <NoResults title="Nenhuma reserva com esses filtros" onClear={clearFilters} />
                ) : (
                    <S.EmptyState>
                        <h3>Nenhuma reserva encontrada</h3>
                        <p>As reservas feitas pelos clientes aparecem aqui.</p>
                    </S.EmptyState>
                )
            ) : (
                <S.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <S.TableWrapper>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th>Cliente</S.Th>
                                    <S.Th>Espaço</S.Th>
                                    <S.Th>Início</S.Th>
                                    <S.Th>Fim</S.Th>
                                    <S.Th>Pacote</S.Th>
                                    <S.Th $num>Valor</S.Th>
                                    <S.Th>Status</S.Th>
                                    <S.Th><S.VisuallyHidden>Ação</S.VisuallyHidden></S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <S.Tr key={r.id}>
                                        <S.Td>{r.user?.name ?? (r.userId ? r.userId.slice(0, 8) + "..." : "—")}</S.Td>
                                        <S.Td>{r.venue?.name ?? r.venueId}</S.Td>
                                        <S.Td>{formatDateTime(r.startDate)}</S.Td>
                                        <S.Td>{formatDateTime(r.endDate)}</S.Td>
                                        <S.Td>{packageLabel(r)}</S.Td>
                                        <S.Td $num>
                                            {formatCurrency(r.totalPrice ?? 0)}
                                            {Number(r.payment?.amount ?? 0) > 0 && (
                                                <S.MonthlyCount>{formatCurrency(Number(r.payment!.amount) - Number(r.payment!.refundAmount ?? 0))} recebido</S.MonthlyCount>
                                            )}
                                        </S.Td>
                                        <S.Td>
                                            <S.StatusBadge $status={r.status}>
                                                {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status}
                                            </S.StatusBadge>
                                        </S.Td>
                                        <S.Td>
                                            <S.InlineGroup style={{ flexWrap: "nowrap" }}>
                                            <S.SecondaryButton $size="sm" onClick={() => setPaymentsFor(r)} aria-label={`Pagamentos de ${r.user?.name ?? "cliente"} em ${formatDateTime(r.startDate)}`}>
                                                Pagamentos
                                            </S.SecondaryButton>
                                            {(r.status === "PENDING" || r.status === "PAID") && (
                                                <S.DangerButton
                                                    $size="sm"
                                                    onClick={() => handleCancelClick(r)}
                                                    disabled={cancellingId === r.id}
                                                >
                                                    {cancellingId === r.id ? "..." : "Cancelar"}
                                                </S.DangerButton>
                                            )}
                                            </S.InlineGroup>
                                        </S.Td>
                                    </S.Tr>
                                ))}
                            </tbody>
                        </S.Table>
                    </S.TableWrapper>

                    {meta && (
                        <Pagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            count={reservations.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação das reservas"
                        />
                    )}
                </S.ListRegion>
            )}

            {paymentsFor && (
                <PaymentsModal reservation={paymentsFor} onClose={() => setPaymentsFor(null)} onChanged={refresh} />
            )}

            {cancelModal && (
                <S.ModalOverlay onClick={() => setCancelModal(null)}>
                    <S.ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setCancelModal(null)}>Cancelar reserva</ModalHeader>

                        {cancelModal.refundPct !== undefined ? (
                            <>
                                <S.ModalText>O salão já recebeu por esta reserva. A devolução segue a política gravada nela, e você a registra em <strong>Pagamentos</strong> depois de devolver:</S.ModalText>
                                {cancelModal.policy && cancelModal.policy.length > 0 && (
                                    <S.ModalNote as="ul">{cancelModal.policy.map((line) => <li key={line}>{line}</li>)}</S.ModalNote>
                                )}
                                <S.RefundSummary>
                                    <div>
                                        <dt>Dias até o evento</dt>
                                        <dd>{cancelModal.daysBeforeEvent}</dd>
                                    </div>
                                    <div>
                                        <dt>Percentual de devolução</dt>
                                        <dd>{cancelModal.refundPct}%</dd>
                                    </div>
                                    <div>
                                        <dt>Valor a devolver</dt>
                                        <dd>{formatCurrency(cancelModal.refundAmount ?? 0)}</dd>
                                    </div>
                                </S.RefundSummary>
                                {cancelModal.refundPct === 0 && (
                                    <S.RefundWarning>Cancelamento fora do prazo: não há devolução.</S.RefundWarning>
                                )}
                                <S.ModalNote>Não há estorno automático: devolva ao cliente e registre a devolução em Pagamentos. Ele recebe um aviso.</S.ModalNote>
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
