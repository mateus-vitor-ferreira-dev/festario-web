import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import PaymentMeter from "../../../components/PaymentMeter";
import { deletePaymentEntry, getReservationPayment, recordPaymentEntry, refundOnlineEntry } from "../../../services/payment";
import type { PaymentEntry, PaymentEntryKind, PaymentMethod, Reservation, ReservationPayment } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { METHOD_LABELS, PAYMENT_METHODS, formatDeadline } from "../../../utils/paymentFormat";
import { formatCents, formatDate, packageLabel } from "../../../utils/reservationFormat";
import { ModalHeader } from "../ModalHeader";
import * as R from "../rules/styles";
import * as S from "../styles";

interface PaymentsModalProps {
    reservation: Reservation;
    onClose: () => void;
    /** Algo mudou (lançamento novo ou desfeito): a lista recarrega. */
    onChanged: () => void;
}

const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const reais = (cents: number) => (cents > 0 ? (cents / 100).toFixed(2).replace(".", ",") : "");

/** Valor sugerido: o que falta para confirmar, o saldo, ou a devolução que ainda falta fazer. */
function suggested(kind: PaymentEntryKind, p: ReservationPayment): string {
    const s = p.summary;
    if (kind === "REFUND") return reais(Math.max(0, (p.refundDueCents ?? 0) - s.refundedCents));
    return reais(s.missingToConfirmCents > 0 ? s.missingToConfirmCents : s.balanceCents);
}

/**
 * Pagamentos da reserva, no painel do dono: quanto entrou, quanto falta, o histórico e o registro de
 * um pagamento recebido ou de uma devolução. Ao chegar no sinal (ou no total), a reserva é confirmada e o
 * cliente recebe o aviso.
 */
export function PaymentsModal({ reservation, onClose, onChanged }: PaymentsModalProps) {
    const [payment, setPayment] = useState<ReservationPayment | null>(null);
    const [kind, setKind] = useState<PaymentEntryKind>("PAYMENT");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<PaymentMethod>("PIX");
    const [date, setDate] = useState(todayISO());
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    /** Pagamento online sendo devolvido pelo Asaas, e o valor digitado. */
    const [refunding, setRefunding] = useState<PaymentEntry | null>(null);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundError, setRefundError] = useState<string | null>(null);
    const [refundSaving, setRefundSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        getReservationPayment(reservation.id, null, controller.signal)
            .then((p) => {
                setPayment(p);
                const closed = p.reservationStatus === "CANCELLED" || p.reservationStatus === "EXPIRED";
                const k: PaymentEntryKind = closed ? "REFUND" : "PAYMENT";
                setKind(k);
                setAmount(suggested(k, p));
            })
            .catch((err) => {
                if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar os pagamentos."));
            });
        return () => controller.abort();
    }, [reservation.id]);

    const busy = saving || removingId !== null || refundSaving;
    const closed = payment?.reservationStatus === "CANCELLED" || payment?.reservationStatus === "EXPIRED";
    const canRefund = (payment?.summary.netCents ?? 0) > 0;

    function chooseKind(k: PaymentEntryKind) {
        setKind(k);
        setError(null);
        if (payment) setAmount(suggested(k, payment));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = Number(amount.replace(/\./g, "").replace(",", "."));
        if (!(value > 0)) { setError("Informe o valor."); return; }
        try {
            setSaving(true);
            setError(null);
            const wasPending = payment?.reservationStatus === "PENDING";
            const updated = await recordPaymentEntry(reservation.id, {
                kind, method, amount: Math.round(value * 100) / 100,
                // Hoje = agora; outro dia = meio-dia daquele dia (a API não aceita data no futuro).
                ...(date !== todayISO() && { paidAt: new Date(`${date}T12:00:00`).toISOString() }),
                ...(note.trim() && { note: note.trim() }),
            });
            setPayment(updated);
            setNote("");
            setAmount(suggested(kind, updated));
            toast.success(kind === "REFUND"
                ? "Devolução registrada. O cliente recebe um aviso."
                : wasPending && updated.reservationStatus === "PAID"
                    ? "Pagamento registrado. Reserva confirmada e cliente avisado!"
                    : "Pagamento registrado.");
            onChanged();
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível registrar."));
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(entryId: string, label: string) {
        if (!window.confirm(`Desfazer o lançamento "${label}"? Use só para corrigir um registro feito por engano.`)) return;
        try {
            setRemovingId(entryId);
            const updated = await deletePaymentEntry(reservation.id, entryId);
            setPayment(updated);
            toast.success("Lançamento desfeito.");
            onChanged();
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível desfazer."));
        } finally {
            setRemovingId(null);
        }
    }

    function startRefund(e: PaymentEntry) {
        setRefunding(e);
        setRefundError(null);
        // Sugere o que ainda pode ser devolvido, limitado ao que a política manda devolver quando houver.
        const due = payment?.refundDueCents != null ? Math.max(0, payment.refundDueCents - payment.summary.refundedCents) : null;
        const max = e.refundableCents ?? 0;
        setRefundAmount(reais(due != null && due > 0 ? Math.min(due, max) : max));
    }

    async function handleOnlineRefund(ev: React.FormEvent) {
        ev.preventDefault();
        if (!refunding) return;
        const value = Number(refundAmount.replace(/\./g, "").replace(",", "."));
        if (!(value > 0)) { setRefundError("Informe o valor."); return; }
        if (Math.round(value * 100) > (refunding.refundableCents ?? 0)) {
            setRefundError(`O máximo deste pagamento é ${formatCents(refunding.refundableCents ?? 0)}.`);
            return;
        }
        if (!window.confirm(`Devolver ${formatCents(Math.round(value * 100))} ao cliente pelo Asaas? O valor sai da conta do salão.`)) return;
        try {
            setRefundSaving(true);
            setRefundError(null);
            const updated = await refundOnlineEntry(reservation.id, refunding.id, Math.round(value * 100) / 100);
            setPayment(updated);
            setRefunding(null);
            toast.success("Devolução feita pelo Asaas. O cliente recebe um aviso.");
            onChanged();
        } catch (err) {
            setRefundError(getErrorMessage(err, "O Asaas não fez a devolução."));
        } finally {
            setRefundSaving(false);
        }
    }

    const s = payment?.summary;

    return (
        <S.ModalOverlay onClick={() => !busy && onClose()}>
            <S.ModalBox $maxWidth={600} role="dialog" aria-modal="true" aria-labelledby="payments-title" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={busy}>
                    <span id="payments-title">Pagamentos de {reservation.user?.name ?? "cliente"}</span>
                </ModalHeader>
                <S.ModalText>
                    {reservation.venue?.name} · {formatDate(reservation.startDate)} · {packageLabel(reservation)}
                </S.ModalText>

                {!payment || !s ? (
                    <S.LoadingSpinner aria-label="Carregando pagamentos" />
                ) : (
                    <>
                        <PaymentMeter totalCents={s.totalCents} netCents={s.netCents} requiredCents={s.requiredCents} />
                        <S.RefundSummary>
                            <div><dt>Valor da reserva</dt><dd>{formatCents(s.totalCents)}</dd></div>
                            {payment.depositCents != null && <div><dt>Sinal (confirma a reserva)</dt><dd>{formatCents(payment.depositCents)}</dd></div>}
                            <div><dt>Recebido</dt><dd>{formatCents(s.paidCents)}</dd></div>
                            {s.refundedCents > 0 && <div><dt>Devolvido</dt><dd>{formatCents(s.refundedCents)}</dd></div>}
                            {payment.reservationStatus === "PENDING" && <div><dt>Falta para confirmar</dt><dd>{formatCents(s.missingToConfirmCents)}</dd></div>}
                            {!closed && <div><dt>Saldo</dt><dd>{formatCents(s.balanceCents)}{payment.balanceDueAt && s.balanceCents > 0 ? ` até ${formatDate(payment.balanceDueAt)}` : ""}</dd></div>}
                            {payment.refundDueCents != null && payment.refundDueCents > 0 && (
                                <div><dt>Devolução pela política ({payment.refundPercentage}%)</dt><dd>{formatCents(payment.refundDueCents)}</dd></div>
                            )}
                        </S.RefundSummary>
                        {payment.confirmBy && (
                            <S.ModalNote>
                                Sem pagamento registrado até <strong>{formatDeadline(payment.confirmBy)}</strong>, a reserva expira e a data fica livre.
                            </S.ModalNote>
                        )}

                        <section aria-labelledby="entries-heading">
                            <h3 id="entries-heading" style={{ fontSize: "var(--text-base)", color: "var(--text-primary)", marginBottom: 4 }}>Lançamentos</h3>
                            {payment.entries.length === 0 ? (
                                <S.ModalNote>Nenhum pagamento registrado ainda.</S.ModalNote>
                            ) : (
                                <div>
                                    {payment.entries.map((e) => {
                                        const label = `${e.kind === "REFUND" ? "Devolução" : "Pagamento"} de ${formatCents(e.amountCents)} em ${formatDate(e.paidAt)}`;
                                        return (
                                            <R.ItemRow key={e.id}>
                                                <R.ItemName>
                                                    <strong>{e.kind === "REFUND" ? "−" : ""}{formatCents(e.amountCents)} · {METHOD_LABELS[e.method]}{e.online ? " · online" : ""}</strong>
                                                    <span>
                                                        {e.kind === "REFUND" ? "Devolução" : "Pagamento"} em {formatDate(e.paidAt)}
                                                        {e.recordedBy ? `, por ${e.recordedBy.name}` : ""}{e.note ? ` — ${e.note}` : ""}
                                                    </span>
                                                </R.ItemName>
                                                {e.online ? (
                                                    (e.refundableCents ?? 0) > 0 && (
                                                        <S.SecondaryButton type="button" $size="sm" onClick={() => startRefund(e)} disabled={busy} aria-label={`Devolver pelo Asaas: ${label}`}>
                                                            Devolver pelo Asaas
                                                        </S.SecondaryButton>
                                                    )
                                                ) : (
                                                    <S.SecondaryButton type="button" $size="sm" onClick={() => handleRemove(e.id, label)} disabled={busy} aria-label={`Desfazer ${label}`}>
                                                        {removingId === e.id ? "Desfazendo..." : "Desfazer"}
                                                    </S.SecondaryButton>
                                                )}
                                            </R.ItemRow>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {refunding && (
                            <S.Form onSubmit={handleOnlineRefund} noValidate aria-label="Devolver pelo Asaas">
                                <S.ModalNote>
                                    Devolução do pagamento online de {formatCents(refunding.amountCents)} ({METHOD_LABELS[refunding.method]}). O valor sai da conta do salão no Asaas e volta para o cliente{refunding.method === "CARD" ? " na fatura do cartão (pode levar até 10 dias úteis)" : " pelo Pix"}.
                                </S.ModalNote>
                                {refundError && <R.Errors role="alert"><li>{refundError}</li></R.Errors>}
                                <S.FormGroup>
                                    <label htmlFor="refund-amount">Valor a devolver (R$), até {formatCents(refunding.refundableCents ?? 0)}</label>
                                    <S.TextInput id="refund-amount" inputMode="decimal" value={refundAmount} onChange={(ev) => setRefundAmount(ev.target.value)} placeholder="0,00" autoFocus />
                                </S.FormGroup>
                                <S.ModalActions>
                                    <S.SecondaryButton type="button" onClick={() => setRefunding(null)} disabled={refundSaving}>Voltar</S.SecondaryButton>
                                    <S.PrimaryButton type="submit" disabled={refundSaving} aria-busy={refundSaving}>
                                        {refundSaving ? "Devolvendo..." : "Devolver pelo Asaas"}
                                    </S.PrimaryButton>
                                </S.ModalActions>
                            </S.Form>
                        )}

                        {refunding ? null : closed && !canRefund ? (
                            <S.ModalNote>Reserva {payment.reservationStatus === "CANCELLED" ? "cancelada" : "expirada"} sem valor recebido: não há o que registrar.</S.ModalNote>
                        ) : (
                            <S.Form onSubmit={handleSubmit} noValidate aria-label="Registrar lançamento">
                                {error && <R.Errors role="alert"><li>{error}</li></R.Errors>}
                                {!closed && canRefund && (
                                <R.Segmented role="radiogroup" aria-label="O que registrar">
                                    {(
                                        <R.SegmentButton type="button" role="radio" aria-checked={kind === "PAYMENT"} $on={kind === "PAYMENT"} onClick={() => chooseKind("PAYMENT")}>
                                            Pagamento recebido
                                        </R.SegmentButton>
                                    )}
                                    {(
                                        <R.SegmentButton type="button" role="radio" aria-checked={kind === "REFUND"} $on={kind === "REFUND"} onClick={() => chooseKind("REFUND")}>
                                            Devolução
                                        </R.SegmentButton>
                                    )}
                                </R.Segmented>
                                )}
                                {closed && <S.ModalNote>Reserva {payment.reservationStatus === "CANCELLED" ? "cancelada" : "expirada"}: registre a devolução feita ao cliente.</S.ModalNote>}
                                <S.FormRow>
                                    <S.FormGroup>
                                        <label htmlFor="pay-amount">Valor (R$)</label>
                                        <S.TextInput id="pay-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
                                    </S.FormGroup>
                                    <S.FormGroup>
                                        <label htmlFor="pay-method">Forma</label>
                                        <S.Select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                                            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                                        </S.Select>
                                    </S.FormGroup>
                                    <S.FormGroup>
                                        <label htmlFor="pay-date">{kind === "REFUND" ? "Devolvido em" : "Recebido em"}</label>
                                        <S.TextInput id="pay-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value || todayISO())} />
                                    </S.FormGroup>
                                </S.FormRow>
                                <S.FormGroup>
                                    <label htmlFor="pay-note">Observação (opcional)</label>
                                    <S.TextInput id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Ex.: comprovante no WhatsApp" />
                                </S.FormGroup>
                                <S.ModalActions>
                                    <S.SecondaryButton type="button" onClick={onClose} disabled={busy}>Fechar</S.SecondaryButton>
                                    <S.PrimaryButton type="submit" disabled={busy} aria-busy={saving}>
                                        {saving ? "Registrando..." : kind === "REFUND" ? "Registrar devolução" : "Registrar pagamento"}
                                    </S.PrimaryButton>
                                </S.ModalActions>
                            </S.Form>
                        )}
                    </>
                )}
            </S.ModalBox>
        </S.ModalOverlay>
    );
}
