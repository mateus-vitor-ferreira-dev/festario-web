import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
    createHoliday,
    deleteHoliday,
    listHolidaysPage,
    syncHolidays,
} from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useAuth } from "../../../contexts/AuthContext";
import { DatePickerInput, Pagination, SelectField } from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import type { Holiday } from "../../../types";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

export const HOLIDAYS_PAGE_SIZE = 20;

/** Feriado é uma data sem hora (vem como meia-noite UTC): formatar no fuso local mostraria o dia anterior. */
const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });

const HOLIDAY_KEYS = ["year"] as const;

type Scope = "salon" | "national";
const EMPTY_FORM = { date: "", name: "", scope: "salon" as Scope };

/**
 * Feriados que valem para o salão: os nacionais (mantidos pela plataforma, só o ADMIN cria e sincroniza)
 * e os do próprio salão (municipais, padroeiro...), que o dono cria e remove. Pacotes podem valer ou não em feriado.
 */
export function HolidaysTab() {
    const { user } = useAuth();
    const isPlatformAdmin = user?.role === "ADMIN";
    const currentYear = new Date().getFullYear();
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, setFilter, setPage } = useListParams(HOLIDAY_KEYS, {
        defaults: { year: String(currentYear) },
        nonFilterKeys: HOLIDAY_KEYS,
    });
    const parsedYear = Number.parseInt(values.year, 10);
    const year = Number.isFinite(parsedYear) ? parsedYear : currentYear;
    const [isSyncing, setIsSyncing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const params = useMemo(() => ({ year, page, limit: HOLIDAYS_PAGE_SIZE }), [year, page]);
    const { data: holidays, meta, isLoading, isFetching, refresh } = usePaginatedQuery<Holiday>(
        listHolidaysPage,
        params,
        { errorMessage: "Erro ao carregar feriados.", onPageOutOfRange: setPage },
    );

    const scopeOf = (h: Holiday): Scope => h.scope ?? (h.type === "national" ? "national" : "salon");
    const canDelete = (h: Holiday) => isPlatformAdmin || scopeOf(h) === "salon";

    async function handleSync() {
        try {
            setIsSyncing(true);
            const result = await syncHolidays(year);
            toast.success(`${result.synced} feriados nacionais sincronizados para ${year}.`);
            refresh();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao sincronizar feriados nacionais."));
        } finally {
            setIsSyncing(false);
        }
    }

    async function handleDelete(h: Holiday) {
        if (!window.confirm(`Remover o feriado "${h.name}" (${formatDate(h.date)})?`)) return;
        try {
            setDeletingId(h.id);
            await deleteHoliday(h.id);
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
            const national = isPlatformAdmin && form.scope === "national";
            await createHoliday({ date: form.date, name: form.name, ...(national ? { type: "national" } : {}) });
            toast.success("Feriado criado.");
            setShowModal(false);
            setForm(EMPTY_FORM);
            refresh();
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
                    <S.SectionActions>
                        <S.PrimaryButton onClick={() => setShowModal(true)}>+ Novo feriado</S.PrimaryButton>
                        {isPlatformAdmin && (
                            <S.SecondaryButton onClick={handleSync} disabled={isSyncing}>
                                {isSyncing ? "Sincronizando..." : "Sincronizar feriados nacionais"}
                            </S.SecondaryButton>
                        )}
                    </S.SectionActions>
                </S.SectionHeader>
            </S.ScrollAnchor>

            <S.ModalNote>
                Os feriados nacionais já vêm cadastrados pela plataforma. Adicione os da sua cidade (aniversário, padroeiro) e
                outras datas que o salão trata como feriado: os pacotes marcados para feriado passam a valer nelas.
            </S.ModalNote>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : holidays.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum feriado cadastrado para {year}</h3>
                    <p>
                        {isPlatformAdmin
                            ? "Use “Sincronizar feriados nacionais” ou adicione um feriado manualmente."
                            : "Os nacionais deste ano ainda não foram cadastrados pela plataforma. Use “Novo feriado” para adicionar os da sua cidade."}
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
                                    <S.HolidayType>{scopeOf(h) === "national" ? "Nacional" : "Do salão"}</S.HolidayType>
                                    {canDelete(h) && (
                                        <S.DangerButton $size="sm" onClick={() => handleDelete(h)} disabled={deletingId === h.id} aria-label={`Remover ${h.name}`}>
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

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setShowModal(false)} disabled={isSaving}>Novo feriado</ModalHeader>
                        <S.Form onSubmit={handleCreate}>
                            <S.FormGroup>
                                <label htmlFor="holiday-name">Nome</label>
                                <S.TextInput id="holiday-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex.: Aniversário da cidade" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Data</label>
                                <DatePickerInput
                                    value={form.date}
                                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                />
                            </S.FormGroup>
                            {isPlatformAdmin && (
                                <S.FormGroup>
                                    <label htmlFor="holiday-scope">Vale para</label>
                                    <S.Select id="holiday-scope" value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as Scope }))}>
                                        <option value="salon">Só este salão</option>
                                        <option value="national">Todos os salões (nacional)</option>
                                    </S.Select>
                                </S.FormGroup>
                            )}
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
