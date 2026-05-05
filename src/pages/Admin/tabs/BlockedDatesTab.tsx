import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createBlockedDate, deleteBlockedDate, listBlockedDates } from "../../../services/admin";
import { listVenues } from "../../../services/venue";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { BlockedDate, Venue } from "../../../types";
import { formatDateTime } from "./constants";
import * as S from "../styles";

export function BlockedDatesTab() {
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ venueId: "", startDate: "", endDate: "", reason: "" });

    async function load() {
        try {
            setIsLoading(true);
            const [datesData, venuesData] = await Promise.all([listBlockedDates(), listVenues()]);
            setBlockedDates(datesData ?? []);
            setVenues(venuesData ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao carregar datas bloqueadas."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id: string) {
        try {
            setDeletingId(id);
            await deleteBlockedDate(id);
            toast.success("Data bloqueada removida.");
            setBlockedDates((prev) => prev.filter((d) => d.id !== id));
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
            load();
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
            <S.SectionHeader>
                <S.SectionTitle>Datas bloqueadas</S.SectionTitle>
                <S.PrimaryButton type="button" onClick={openModal}>+ Bloquear período</S.PrimaryButton>
            </S.SectionHeader>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : blockedDates.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhuma data bloqueada</h3>
                    <p>Bloqueie períodos de manutenção ou indisponibilidade clicando no botão acima.</p>
                </S.EmptyState>
            ) : (
                <S.TableWrapper>
                    <S.Table>
                        <thead>
                            <tr>
                                <S.Th>Espaço</S.Th>
                                <S.Th>Início</S.Th>
                                <S.Th>Fim</S.Th>
                                <S.Th>Motivo</S.Th>
                                <S.Th></S.Th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockedDates.map((d) => (
                                <S.Tr key={d.id}>
                                    <S.Td>{d.venue?.name ?? d.venueId}</S.Td>
                                    <S.Td>{formatDateTime(d.startDate)}</S.Td>
                                    <S.Td>{formatDateTime(d.endDate)}</S.Td>
                                    <S.Td>{d.reason ?? "—"}</S.Td>
                                    <S.Td>
                                        <S.DangerButton
                                            style={{ height: "30px", padding: "0 10px", fontSize: "12px" }}
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
            )}

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e) => e.stopPropagation()}>
                        <S.ModalTitle>Bloquear período</S.ModalTitle>
                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <S.FormGroup>
                                <label>Espaço</label>
                                <S.Select value={form.venueId} onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))} style={{ height: 42 }} required>
                                    {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Início</label>
                                <S.DateInput required type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} style={{ height: 42, width: "100%", boxSizing: "border-box" }} />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Fim</label>
                                <S.DateInput required type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} style={{ height: 42, width: "100%", boxSizing: "border-box" }} />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Motivo (opcional)</label>
                                <S.TextInput value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Ex: Manutenção da piscina" maxLength={255} />
                            </S.FormGroup>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Bloquear período"}</S.PrimaryButton>
                            </S.ModalActions>
                        </form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
