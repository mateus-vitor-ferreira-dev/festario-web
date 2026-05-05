import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createPlan, deletePlan, listPlans, updatePlan } from "../../../services/admin";
import { listVenues } from "../../../services/venue";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { isAbortError } from "../../../utils/errors";
import type { ReservationPlan, Venue } from "../../../types";
import { EMPTY_PLAN_FORM, formatCurrency, PLAN_CODES } from "./constants";
import * as S from "../styles";

interface PlanForm {
    venueId: string;
    code: string;
    name: string;
    basePriceAmount: string | number;
    partyDurationHours: string | number;
    endsAtHour: string | number;
    keyDeliveryOffsetHours: string | number;
    includedKidsMonitorHours: string | number;
    includesPool: boolean;
    includesCleaning: boolean;
    validOnHolidays: boolean;
}

export function PlansTab() {
    const [plans, setPlans] = useState<ReservationPlan[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ReservationPlan | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<PlanForm>(EMPTY_PLAN_FORM as PlanForm);

    async function loadAll(signal?: AbortSignal) {
        try {
            setIsLoading(true);
            const [plansData, venuesData] = await Promise.all([
                listPlans({}, signal),
                listVenues(signal),
            ]);
            if (signal?.aborted) return;
            setPlans(plansData ?? []);
            setVenues(venuesData ?? []);
        } catch (error) {
            if (isAbortError(error)) return;
            toast.error(getErrorMessage(error, "Erro ao carregar planos."));
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        loadAll(controller.signal);
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openCreate() {
        setEditingPlan(null);
        setForm(EMPTY_PLAN_FORM);
        setShowModal(true);
    }

    function openEdit(plan: ReservationPlan) {
        setEditingPlan(plan);
        setForm({
            venueId: plan.venueId ?? "",
            code: plan.code,
            name: plan.name,
            basePriceAmount: plan.basePriceAmount ?? "",
            partyDurationHours: plan.partyDurationHours ?? "",
            endsAtHour: plan.endsAtHour ?? "",
            keyDeliveryOffsetHours: plan.keyDeliveryOffsetHours ?? "",
            includedKidsMonitorHours: plan.includedKidsMonitorHours ?? "",
            includesPool: plan.includesPool ?? false,
            includesCleaning: plan.includesCleaning ?? false,
            validOnHolidays: plan.validOnHolidays ?? false,
        });
        setShowModal(true);
    }

    async function handleDelete(id: string) {
        try {
            setDeletingId(id);
            await deletePlan(id);
            toast.success("Plano removido.");
            setPlans((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao remover plano."));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSaving(true);
            const payload = {
                ...form,
                venueId: form.venueId || null,
                basePriceAmount: String(form.basePriceAmount),
                partyDurationHours: Number(form.partyDurationHours),
                endsAtHour: form.endsAtHour !== "" ? Number(form.endsAtHour) : undefined,
                keyDeliveryOffsetHours: form.keyDeliveryOffsetHours !== "" ? Number(form.keyDeliveryOffsetHours) : undefined,
                includedKidsMonitorHours: form.includedKidsMonitorHours !== "" ? Number(form.includedKidsMonitorHours) : undefined,
            };
            if (editingPlan) {
                await updatePlan(editingPlan.id, payload as ReservationPlan);
                toast.success("Plano atualizado.");
            } else {
                await createPlan(payload as ReservationPlan);
                toast.success("Plano criado.");
            }
            setShowModal(false);
            await loadAll();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao salvar plano."));
        } finally {
            setIsSaving(false);
        }
    }

    function field(key: keyof PlanForm) {
        return { value: String(form[key]), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value })) };
    }

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Planos de reserva</S.SectionTitle>
                <S.PrimaryButton onClick={openCreate}>+ Novo plano</S.PrimaryButton>
            </S.SectionHeader>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : plans.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum plano cadastrado</h3>
                    <p>Crie o primeiro plano clicando no botão acima.</p>
                </S.EmptyState>
            ) : (
                <S.TableWrapper>
                    <S.Table>
                        <thead>
                            <tr>
                                <S.Th>Código</S.Th>
                                <S.Th>Nome</S.Th>
                                <S.Th>Espaço</S.Th>
                                <S.Th>Preço base</S.Th>
                                <S.Th>Duração (h)</S.Th>
                                <S.Th>Piscina</S.Th>
                                <S.Th>Limpeza</S.Th>
                                <S.Th></S.Th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((p) => (
                                <S.Tr key={p.id}>
                                    <S.Td><strong>{p.code}</strong></S.Td>
                                    <S.Td>{p.name}</S.Td>
                                    <S.Td>{p.venue?.name ?? "Global"}</S.Td>
                                    <S.Td>{formatCurrency(Number(p.basePriceAmount ?? 0))}</S.Td>
                                    <S.Td>{p.partyDurationHours}h</S.Td>
                                    <S.Td>{p.includesPool ? "Sim" : "Não"}</S.Td>
                                    <S.Td>{p.includesCleaning ? "Sim" : "Não"}</S.Td>
                                    <S.Td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <S.SecondaryButton style={{ height: "30px", padding: "0 10px", fontSize: "12px" }} onClick={() => openEdit(p)}>Editar</S.SecondaryButton>
                                            <S.DangerButton style={{ height: "30px", padding: "0 10px", fontSize: "12px" }} onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                                                {deletingId === p.id ? "..." : "Remover"}
                                            </S.DangerButton>
                                        </div>
                                    </S.Td>
                                </S.Tr>
                            ))}
                        </tbody>
                    </S.Table>
                </S.TableWrapper>
            )}

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
                        <S.ModalTitle>{editingPlan ? "Editar plano" : "Novo plano"}</S.ModalTitle>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <S.FormGroup>
                                <label>Espaço (opcional)</label>
                                <S.Select value={form.venueId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, venueId: e.target.value }))} style={{ height: 42 }}>
                                    <option value="">Global (todos os espaços)</option>
                                    {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Código</label>
                                <S.Select {...field("code")} style={{ height: 42 }} disabled={!!editingPlan}>
                                    {PLAN_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </S.Select>
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Nome</label>
                                <S.TextInput required {...field("name")} placeholder="Ex: Pacote Essencial" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Preço base (R$)</label>
                                <S.TextInput required type="number" min="0" step="0.01" {...field("basePriceAmount")} placeholder="Ex: 2500.00" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Duração da festa (horas)</label>
                                <S.TextInput required type="number" min="1" {...field("partyDurationHours")} placeholder="Ex: 6" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Hora de encerramento</label>
                                <S.TextInput type="number" min="0" max="23" {...field("endsAtHour")} placeholder="Ex: 23 (opcional)" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Antecedência para entrega de chaves (horas)</label>
                                <S.TextInput type="number" min="0" {...field("keyDeliveryOffsetHours")} placeholder="Ex: 2 (opcional)" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Horas de monitor de crianças incluídas</label>
                                <S.TextInput type="number" min="0" {...field("includedKidsMonitorHours")} placeholder="Ex: 4 (opcional)" />
                            </S.FormGroup>
                            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                {[
                                    { key: "includesPool", label: "Inclui piscina" },
                                    { key: "includesCleaning", label: "Inclui limpeza" },
                                    { key: "validOnHolidays", label: "Válido em feriados" },
                                ].map(({ key, label }) => (
                                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                                        <input type="checkbox" checked={!!form[key as keyof PlanForm]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.checked }))} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>
                                    {isSaving ? "Salvando..." : editingPlan ? "Salvar alterações" : "Criar plano"}
                                </S.PrimaryButton>
                            </S.ModalActions>
                        </form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
