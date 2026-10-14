import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
    createHoliday,
    deleteHoliday,
    listHolidaysPage,
    syncHolidays,
    syncMunicipalHolidays,
} from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useAuth } from "../../../contexts/AuthContext";
import { DatePickerInput, Pagination, SelectField } from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { formatDate, getMunicipalHolidaysSeed, HOLIDAY_TYPE_OPTIONS } from "./constants";
import type { Holiday } from "../../../types";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

const HOLIDAY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    HOLIDAY_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export const HOLIDAYS_PAGE_SIZE = 20;

const HOLIDAY_KEYS = ["year"] as const;

/**
 * Feriados são globais (afetam o preço de todos os espaços): só o ADMIN da
 * plataforma cria, sincroniza ou remove. O OWNER apenas consulta.
 */
export function HolidaysTab() {
    const { user } = useAuth();
    const canEdit = user?.role === "ADMIN";
    const currentYear = new Date().getFullYear();
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, setFilter, setPage } = useListParams(HOLIDAY_KEYS, {
        defaults: { year: String(currentYear) },
        nonFilterKeys: HOLIDAY_KEYS,
    });
    const parsedYear = Number.parseInt(values.year, 10);
    const year = Number.isFinite(parsedYear) ? parsedYear : currentYear;
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingMunicipal, setIsSyncingMunicipal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: "", name: "", type: "national" });
    const [isSaving, setIsSaving] = useState(false);

    const params = useMemo(() => ({ year, page, limit: HOLIDAYS_PAGE_SIZE }), [year, page]);
    const { data: holidays, meta, isLoading, isFetching, refresh } = usePaginatedQuery<Holiday>(
        listHolidaysPage,
        params,
        { errorMessage: "Erro ao carregar feriados.", onPageOutOfRange: setPage },
    );
    const load = refresh;

    async function handleSync() {
        try {
            setIsSyncing(true);
            const result = await syncHolidays(year);
            toast.success(`${result.synced} feriados nacionais sincronizados para ${year}.`);
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao sincronizar feriados nacionais."));
        } finally {
            setIsSyncing(false);
        }
    }

    async function handleSyncMunicipal() {
        try {
            setIsSyncingMunicipal(true);
            const seed = getMunicipalHolidaysSeed(year);
            const result = await syncMunicipalHolidays(year, seed);
            toast.success(`${result.synced} feriados municipais de Lavras sincronizados para ${year}.`);
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao sincronizar feriados municipais."));
        } finally {
            setIsSyncingMunicipal(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            setDeletingId(id);
            await deleteHoliday(id);
            toast.success("Feriado removido.");
            refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao remover feriado."));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSaving(true);
            await createHoliday(form);
            toast.success("Feriado criado com sucesso.");
            setShowModal(false);
            setForm({ date: "", name: "", type: "national" });
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao criar feriado."));
        } finally {
            setIsSaving(false);
        }
    }

    const yearOptions = Array.from(new Set([currentYear - 1, currentYear, currentYear + 1, currentYear + 2, year]))
        .sort((x, y) => x - y)
        .map((y) => ({ value: String(y), label: String(y) }));

    return (
        <S.Section>
            <S.ScrollAnchor ref={topRef} tabIndex={-1}>
                <S.SectionHeader>
                    <S.InlineGroup style={{ gap: 16, alignItems: "flex-end" }}>
                        <S.SectionTitle>Feriados</S.SectionTitle>
                        <S.YearField>
                            <SelectField
                                label="Ano"
                                value={String(year)}
                                onChange={(v) => setFilter("year", v)}
                                options={yearOptions}
                            />
                        </S.YearField>
                    </S.InlineGroup>
                    {canEdit && (
                    <S.SectionActions>
                        <S.PrimaryButton onClick={() => setShowModal(true)}>+ Novo feriado</S.PrimaryButton>
                        <S.SecondaryButton onClick={handleSync} disabled={isSyncing}>
                            {isSyncing ? "Sincronizando..." : "Sincronizar feriados nacionais"}
                        </S.SecondaryButton>
                        <S.SecondaryButton onClick={handleSyncMunicipal} disabled={isSyncingMunicipal}>
                            {isSyncingMunicipal ? "Sincronizando..." : "Sincronizar feriados municipais"}
                        </S.SecondaryButton>
                    </S.SectionActions>
                    )}
                </S.SectionHeader>
            </S.ScrollAnchor>

            {!canEdit && (
                <S.ModalNote>
                    Os feriados valem para todos os espaços e são mantidos pela equipe da plataforma. Se faltar algum, fale com o suporte.
                </S.ModalNote>
            )}

            {isLoading ? (
                <S.LoadingSpinner />
            ) : holidays.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum feriado cadastrado para {year}</h3>
                    <p>
                        {canEdit
                            ? "Use “Sincronizar feriados nacionais” ou adicione um feriado manualmente."
                            : "A equipe da plataforma ainda não cadastrou os feriados deste ano. Escolha outro ano ou fale com o suporte."}
                    </p>
                </S.EmptyState>
            ) : (
                <S.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <S.CardList>
                        {holidays.map((h) => (
                            <S.HolidayCard key={h.id}>
                                <S.HolidayInfo>
                                    <strong>{h.name}</strong>
                                    <span>{formatDate(h.date)}</span>
                                </S.HolidayInfo>
                                <S.InlineGroup>
                                    {h.type && <S.HolidayType>{HOLIDAY_TYPE_LABELS[h.type] ?? h.type}</S.HolidayType>}
                                    {canEdit && (
                                        <S.DangerButton $size="sm" onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                                            {deletingId === h.id ? "Removendo..." : "Remover"}
                                        </S.DangerButton>
                                    )}
                                </S.InlineGroup>
                            </S.HolidayCard>
                        ))}
                    </S.CardList>
                    {meta && (
                        <Pagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            count={holidays.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação dos feriados"
                        />
                    )}
                </S.ListRegion>
            )}

            {canEdit && showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setShowModal(false)} disabled={isSaving}>Novo feriado</ModalHeader>
                        <S.Form onSubmit={handleCreate}>
                            <S.FormGroup>
                                <label>Nome</label>
                                <S.TextInput required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Consciência Negra" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Data</label>
                                <DatePickerInput
                                    value={form.date}
                                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Tipo</label>
                                <S.Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                                    {HOLIDAY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Criando..." : "Criar feriado"}</S.PrimaryButton>
                            </S.ModalActions>
                        </S.Form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
