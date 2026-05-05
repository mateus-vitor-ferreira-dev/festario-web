import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    createHoliday,
    deleteHoliday,
    listHolidays,
    syncHolidays,
    syncMunicipalHolidays,
} from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { DatePickerInput } from "../../../components";
import { formatDate, getMunicipalHolidaysSeed, HOLIDAY_TYPE_OPTIONS } from "./constants";
import type { Holiday } from "../../../types";
import * as S from "../styles";

export function HolidaysTab() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncingMunicipal, setIsSyncingMunicipal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: "", name: "", type: "national" });
    const [isSaving, setIsSaving] = useState(false);

    async function load() {
        try {
            setIsLoading(true);
            const data = await listHolidays(year);
            setHolidays(data ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao carregar feriados."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { load(); }, [year]);

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
            setHolidays((prev) => prev.filter((h) => h.id !== id));
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

    const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    return (
        <S.Section>
            <S.SectionHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <S.SectionTitle>Feriados</S.SectionTitle>
                    <S.Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </S.Select>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <S.SecondaryButton onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? "Sincronizando..." : "Sincronizar feriados nacionais"}
                    </S.SecondaryButton>
                    <S.SecondaryButton onClick={handleSyncMunicipal} disabled={isSyncingMunicipal}>
                        {isSyncingMunicipal ? "Sincronizando..." : "Sincronizar feriados municipais"}
                    </S.SecondaryButton>
                    <S.PrimaryButton onClick={() => setShowModal(true)}>+ Novo feriado</S.PrimaryButton>
                </div>
            </S.SectionHeader>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : holidays.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum feriado cadastrado para {year}</h3>
                    <p>Sincronize com a BrasilAPI ou adicione manualmente.</p>
                </S.EmptyState>
            ) : (
                <S.CardList>
                    {holidays.map((h) => (
                        <S.HolidayCard key={h.id}>
                            <S.HolidayInfo>
                                <strong>{h.name}</strong>
                                <span>{formatDate(h.date)}</span>
                            </S.HolidayInfo>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <S.HolidayType>{h.type}</S.HolidayType>
                                <S.DangerButton onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                                    {deletingId === h.id ? "Removendo..." : "Remover"}
                                </S.DangerButton>
                            </div>
                        </S.HolidayCard>
                    ))}
                </S.CardList>
            )}

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e) => e.stopPropagation()}>
                        <S.ModalTitle>Novo feriado</S.ModalTitle>
                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                                <S.Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ height: 42 }}>
                                    {HOLIDAY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Criando..." : "Criar feriado"}</S.PrimaryButton>
                            </S.ModalActions>
                        </form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
