import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createBlockedDate, deleteBlockedDate, listBlockedDatesPage } from "../../../services/admin";
import { listVenues } from "../../../services/venue";
import { ActiveFilterChips, FilterBar, NoResults, Pagination, SelectField } from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { isAbortError } from "../../../utils/errors";
import type { BlockedDate, Venue } from "../../../types";
import { formatDateTime } from "./constants";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

export const BLOCKED_DATES_PAGE_SIZE = 20;

const BLOCKED_FILTER_KEYS = ["venueId"] as const;

export function BlockedDatesTab() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ venueId: "", startDate: "", endDate: "", reason: "" });
    const topRef = useRef<HTMLDivElement | null>(null);

    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams(BLOCKED_FILTER_KEYS);
    const params = useMemo(() => ({ ...values, page, limit: BLOCKED_DATES_PAGE_SIZE }), [values, page]);
    const { data: blockedDates, meta, isLoading, isFetching, refresh } = usePaginatedQuery<BlockedDate>(
        listBlockedDatesPage,
        params,
        { errorMessage: "Erro ao carregar datas bloqueadas.", onPageOutOfRange: setPage },
    );

    useEffect(() => {
        const controller = new AbortController();
        listVenues(controller.signal)
            .then((data) => setVenues(data ?? []))
            .catch((error) => {
                if (!isAbortError(error)) toast.error(getErrorMessage(error, "Erro ao carregar datas bloqueadas."));
            });
        return () => controller.abort();
    }, []);

    const venueOptions = [{ value: "", label: "Todos os espaços" }, ...venues.map((v) => ({ value: v.id, label: v.name }))];
    const chips = activeKeys.map((key) => ({
        key,
        label: `Espaço: ${venueOptions.find((o) => o.value === values.venueId)?.label ?? values.venueId}`,
    }));

    async function handleDelete(id: string) {
        try {
            setDeletingId(id);
            await deleteBlockedDate(id);
            toast.success("Data bloqueada removida.");
            refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao remover data bloqueada."));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSaving(true);
            await createBlockedDate({
                venueId: form.venueId,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                reason: form.reason || undefined,
            });
            toast.success("Data bloqueada criada com sucesso.");
            setShowModal(false);
            setForm({ venueId: venues[0]?.id ?? "", startDate: "", endDate: "", reason: "" });
            refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao criar data bloqueada."));
        } finally {
            setIsSaving(false);
        }
    }

    function openModal() {
        setForm({ venueId: venues[0]?.id ?? "", startDate: "", endDate: "", reason: "" });
        setShowModal(true);
    }

    return (
        <S.Section>
            <S.ScrollAnchor ref={topRef} tabIndex={-1}>
                <S.SectionHeader>
                    <S.SectionTitle>Datas bloqueadas</S.SectionTitle>
                    <S.PrimaryButton type="button" onClick={openModal}>+ Bloquear período</S.PrimaryButton>
                </S.SectionHeader>
            </S.ScrollAnchor>

            {venues.length > 1 && (
                <FilterBar
                    label="Filtrar datas bloqueadas"
                    activeCount={activeKeys.length}
                    footer={<ActiveFilterChips chips={chips} onRemove={() => setFilter("venueId", "")} onClearAll={clearFilters} />}
                >
                    <SelectField label="Espaço" value={values.venueId} onChange={(v) => setFilter("venueId", v)} options={venueOptions} />
                </FilterBar>
            )}

            {isLoading ? (
                <S.LoadingSpinner role="status" aria-label="Carregando datas bloqueadas" />
            ) : blockedDates.length === 0 ? (
                activeKeys.length > 0 ? (
                    <NoResults title="Nenhuma data bloqueada para esse espaço" onClear={clearFilters} />
                ) : (
                    <S.EmptyState>
                        <h3>Nenhuma data bloqueada</h3>
                        <p>Bloqueie períodos de manutenção ou indisponibilidade clicando no botão acima.</p>
                    </S.EmptyState>
                )
            ) : (
                <S.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <S.TableWrapper>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th>Espaço</S.Th>
                                    <S.Th>Início</S.Th>
                                    <S.Th>Fim</S.Th>
                                    <S.Th>Motivo</S.Th>
                                    <S.Th><S.VisuallyHidden>Ação</S.VisuallyHidden></S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedDates.map((d) => (
                                    <S.Tr key={d.id}>
                                        <S.Td><strong>{d.venue?.name ?? venues.find((v) => v.id === d.venueId)?.name ?? d.venueId}</strong></S.Td>
                                        <S.Td>{formatDateTime(d.startDate)}</S.Td>
                                        <S.Td>{formatDateTime(d.endDate)}</S.Td>
                                        <S.Td>{d.reason ?? "—"}</S.Td>
                                        <S.Td>
                                            <S.DangerButton
                                                $size="sm"
                                                onClick={() => handleDelete(d.id)}
                                                disabled={deletingId === d.id}
                                            >
                                                {deletingId === d.id ? "..." : "Remover"}
                                            </S.DangerButton>
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
                            count={blockedDates.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação das datas bloqueadas"
                        />
                    )}
                </S.ListRegion>
            )}

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setShowModal(false)} disabled={isSaving}>Bloquear período</ModalHeader>
                        <S.Form onSubmit={handleCreate}>
                            <S.FormGroup>
                                <label>Espaço</label>
                                <S.Select value={form.venueId} onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))} required>
                                    {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.FormRow>
                                <S.FormGroup>
                                    <label>Início</label>
                                    <S.DateInput required type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                                </S.FormGroup>
                                <S.FormGroup>
                                    <label>Fim</label>
                                    <S.DateInput required type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                                </S.FormGroup>
                            </S.FormRow>
                            <S.FormGroup>
                                <label>Motivo (opcional)</label>
                                <S.TextInput value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Ex: Manutenção da piscina" maxLength={255} />
                            </S.FormGroup>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Bloquear período"}</S.PrimaryButton>
                            </S.ModalActions>
                        </S.Form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
