import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";

import { extendTrial, getTenantSubscription, markSubscriptionPaid } from "../../services/subscription";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import {
    formatCents, formatDay, SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_TONE,
} from "../../utils/subscription";
import type { SubscriptionDetail, Tenant } from "../../types";
import { ModalHeader } from "../Admin/ModalHeader";
import * as A from "../Admin/styles";
import { ChargesTable } from "../Admin/subscription/ChargesTable";
import * as SS from "../Admin/subscription/styles";
import * as S from "./styles";

const AUTOMATIC_LABELS = {
    NONE: "Não autorizado",
    PENDING: "Gerado, falta o dono aprovar no banco",
    APPROVED: "Autorizado",
    ENDED: "Recusado ou cancelado no banco",
} as const;

/** "AAAA-MM-DD" de hoje, no relógio do navegador. */
function todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Soma dias a um "AAAA-MM-DD" sem passar pelo fuso. */
function addDaysKey(key: string, n: number): string {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/**
 * Assinatura do estabelecimento na plataforma: situação, Pix Automático, histórico e as ações da equipe
 * (estender o teste ou adiar o vencimento, e registrar pagamento feito por fora).
 */
export function SubscriptionSection({ tenant, onChanged }: { tenant: Tenant; onChanged: () => void }) {
    const [sub, setSub] = useState<SubscriptionDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [modal, setModal] = useState<"extend" | "paid" | null>(null);

    const load = useCallback((signal?: AbortSignal) => {
        return getTenantSubscription(tenant.id, signal).then((data) => {
            setSub(data);
            setError(null);
        }).catch((err) => {
            if (!isAbortError(err)) setError(getLoadErrorMessage(err, "Não foi possível carregar a assinatura."));
        });
    }, [tenant.id]);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    function handleDone(updated: SubscriptionDetail) {
        setModal(null);
        setSub(updated);
        onChanged();
    }

    return (
        <S.Panel aria-labelledby="subscription-title">
            <A.SectionHeader>
                <S.PanelTitle id="subscription-title">Assinatura</S.PanelTitle>
                {sub && (
                    <A.InlineGroup>
                        <A.SecondaryButton type="button" $size="sm" onClick={() => setModal("extend")}>
                            {sub.lastPaidAt ? "Adiar vencimento" : "Estender teste"}
                        </A.SecondaryButton>
                        <A.PrimaryButton type="button" $size="sm" onClick={() => setModal("paid")}>Marcar como pago</A.PrimaryButton>
                    </A.InlineGroup>
                )}
            </A.SectionHeader>

            {error ? (
                <S.ErrorState role="alert">
                    <p>{error}</p>
                    <A.SecondaryButton type="button" onClick={() => load()}>Tentar de novo</A.SecondaryButton>
                </S.ErrorState>
            ) : !sub ? (
                <A.LoadingSpinner role="status" aria-label="Carregando a assinatura" />
            ) : (
                <>
                    {!sub.billingEnabled && (
                        <A.ContextBar role="note">
                            <span>A cobrança automática está desligada (sem as credenciais da Efí): nada é cobrado nem bloqueado.</span>
                        </A.ContextBar>
                    )}
                    <SS.Facts>
                        <div>
                            <dt>Situação</dt>
                            <dd><SS.ToneBadge $tone={SUBSCRIPTION_STATUS_TONE[sub.status]}>{SUBSCRIPTION_STATUS_LABELS[sub.status]}</SS.ToneBadge></dd>
                        </div>
                        <div><dt>{sub.overdueDays > 0 ? "Venceu em" : "Próximo vencimento"}</dt><dd>{formatDay(sub.nextDueDate)}</dd></div>
                        {sub.overdueDays > 0 && <div><dt>Dias em atraso</dt><dd>{sub.overdueDays}</dd></div>}
                        <div><dt>Valor</dt><dd>{formatCents(sub.monthlyPriceCents)}/mês</dd></div>
                        <div>
                            <dt>Pix Automático</dt>
                            <dd>
                                {AUTOMATIC_LABELS[sub.automaticPayment.state]}
                                {sub.automaticPayment.payerName && <SS.Muted> · {sub.automaticPayment.payerName}</SS.Muted>}
                            </dd>
                        </div>
                        <div><dt>Painel do dono</dt><dd>{sub.readOnly ? "Só para consulta" : "Normal"}</dd></div>
                    </SS.Facts>
                    <ChargesTable charges={sub.charges} caption={`Cobranças de ${tenant.name}`} />
                </>
            )}

            {modal === "extend" && sub && <ExtendModal tenant={tenant} sub={sub} onClose={() => setModal(null)} onDone={handleDone} />}
            {modal === "paid" && sub && <MarkPaidModal tenant={tenant} sub={sub} onClose={() => setModal(null)} onDone={handleDone} />}
        </S.Panel>
    );
}

interface ModalProps {
    tenant: Tenant;
    sub: SubscriptionDetail;
    onClose: () => void;
    onDone: (sub: SubscriptionDetail) => void;
}

function ExtendModal({ tenant, sub, onClose, onDone }: ModalProps) {
    const titleId = useId();
    const inputId = useId();
    // A API exige uma data depois de hoje e depois do vencimento atual.
    const today = todayKey();
    const firstValid = addDaysKey(sub.nextDueDate > today ? sub.nextDueDate : today, 1);
    const [until, setUntil] = useState(firstValid);
    const [saving, setSaving] = useState(false);
    const trial = !sub.lastPaidAt;

    async function handleConfirm(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await extendTrial(tenant.id, until);
            toast.success(trial ? `Teste estendido até ${formatDay(until)}.` : `Vencimento adiado para ${formatDay(until)}.`);
            onDone(updated);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível mudar a data."));
            setSaving(false);
        }
    }

    return (
        <A.ModalOverlay onClick={() => !saving && onClose()}>
            <A.ModalBox role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={saving}>
                    <span id={titleId}>{trial ? "Estender o teste" : "Adiar o vencimento"}</span>
                </ModalHeader>
                <A.Form onSubmit={handleConfirm}>
                    <A.ModalText>
                        {trial
                            ? <>O mês grátis de <strong>{tenant.name}</strong> passa a ir até a data escolhida, e a primeira cobrança vence nesse dia.</>
                            : <><strong>{tenant.name}</strong> ganha dias sem cobrança: o próximo vencimento passa para a data escolhida.</>}
                        {" "}Cobranças em aberto do vencimento atual ({formatDay(sub.nextDueDate)}) são canceladas e o painel do dono volta ao normal na hora.
                    </A.ModalText>
                    <A.FormGroup>
                        <label htmlFor={inputId}>Nova data</label>
                        <A.DateInput id={inputId} type="date" value={until} min={firstValid} onChange={(e) => setUntil(e.target.value)} required disabled={saving} />
                    </A.FormGroup>
                    <A.ModalActions>
                        <A.SecondaryButton type="button" onClick={onClose} disabled={saving}>Cancelar</A.SecondaryButton>
                        <A.PrimaryButton type="submit" disabled={saving || !until}>{saving ? "Salvando..." : trial ? "Estender teste" : "Adiar vencimento"}</A.PrimaryButton>
                    </A.ModalActions>
                </A.Form>
            </A.ModalBox>
        </A.ModalOverlay>
    );
}

function MarkPaidModal({ tenant, sub, onClose, onDone }: ModalProps) {
    const titleId = useId();
    const noteId = useId();
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const scheduled = sub.charges.some((c) => c.status === "AGENDADA");

    async function handleConfirm(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await markSubscriptionPaid(tenant.id, note.trim() || undefined);
            toast.success("Pagamento registrado.");
            onDone(updated);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível registrar o pagamento."));
            setSaving(false);
        }
    }

    return (
        <A.ModalOverlay onClick={() => !saving && onClose()}>
            <A.ModalBox role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={saving}>
                    <span id={titleId}>Registrar pagamento feito por fora</span>
                </ModalHeader>
                <A.Form onSubmit={handleConfirm}>
                    <A.ModalText>
                        Marca como paga a cobrança de <strong>{formatDay(sub.nextDueDate)}</strong> ({formatCents(sub.monthlyPriceCents)}) de{" "}
                        <strong>{tenant.name}</strong>. O próximo vencimento passa para um mês depois e o painel do dono volta ao normal na hora.
                    </A.ModalText>
                    {scheduled && <A.ModalNote>O débito já agendado no Pix Automático para esse vencimento é cancelado, para não cobrar duas vezes.</A.ModalNote>}
                    <A.FormGroup>
                        <label htmlFor={noteId}>Observação (opcional)</label>
                        <A.TextInput id={noteId} value={note} maxLength={200} placeholder="Ex.: Pix direto em 12/11" onChange={(e) => setNote(e.target.value)} disabled={saving} />
                    </A.FormGroup>
                    <A.ModalActions>
                        <A.SecondaryButton type="button" onClick={onClose} disabled={saving}>Cancelar</A.SecondaryButton>
                        <A.PrimaryButton type="submit" disabled={saving}>{saving ? "Registrando..." : "Marcar como pago"}</A.PrimaryButton>
                    </A.ModalActions>
                </A.Form>
            </A.ModalBox>
        </A.ModalOverlay>
    );
}
