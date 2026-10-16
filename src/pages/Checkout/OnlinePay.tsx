import { FormEvent, useId, useState } from "react";

import { payOnline } from "../../services/payment";
import { getApiErrorCode } from "../../utils/errors";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatCents } from "../../utils/reservationFormat";
import type { OnlineMethod, ReservationPayment } from "../../types";
import * as S from "./styles";

const METHODS: { value: OnlineMethod; label: string; hint: string }[] = [
    { value: "PIX", label: "Pix", hint: "Aprovação na hora" },
    { value: "CARD", label: "Cartão de crédito", hint: "Em até 2 dias úteis para o salão" },
];

/** Máscara de CPF/CNPJ enquanto digita. */
function maskDocument(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

interface OnlinePayProps {
    payment: ReservationPayment;
}

/**
 * Pagar online pelo Asaas: o cliente escolhe Pix ou cartão e vai para a fatura. O dinheiro cai na conta do
 * salão e a reserva confirma sozinha quando o Asaas aprova. O CPF só é pedido na primeira vez em cada
 * salão, e vai só para o Asaas.
 */
export default function OnlinePay({ payment }: OnlinePayProps) {
    const online = payment.online!;
    const pending = online.pendingCharge;
    const [method, setMethod] = useState<OnlineMethod>(pending?.method ?? "PIX");
    const [needsCpf, setNeedsCpf] = useState(false);
    const [cpf, setCpf] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const cpfId = useId();
    const salon = payment.tenant?.name ?? "o salão";
    const what = payment.reservationStatus === "PENDING" ? "para confirmar a reserva" : "do restante";

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const digits = cpf.replace(/\D/g, "");
        if (needsCpf && digits.length !== 11 && digits.length !== 14) {
            setError("Digite o CPF completo, com 11 números.");
            return;
        }
        try {
            setBusy(true);
            setError(null);
            const charge = await payOnline(payment.reservationId, method, needsCpf ? digits : null, payment.tenant?.slug);
            window.location.assign(charge.invoiceUrl);
        } catch (err) {
            if (getApiErrorCode(err) === "CPF_REQUIRED") {
                setNeedsCpf(true);
                setError(null);
            } else {
                setError(getErrorMessage(err, "Não foi possível abrir o pagamento. Tente de novo."));
            }
            setBusy(false);
        }
    }

    return (
        <S.PayNow aria-labelledby="pay-now-title">
            <S.SectionTitle as="h3" id="pay-now-title">Pagar agora: {formatCents(online.payableCents)}</S.SectionTitle>
            <S.PayNowText>
                Pague {what} por Pix ou cartão. O dinheiro vai direto para a conta de {salon} no Asaas, e a reserva é atualizada assim que o pagamento for aprovado.
            </S.PayNowText>

            {pending && (
                <S.PayNowText>
                    Você já abriu um pagamento por {pending.method === "PIX" ? "Pix" : "cartão"} de {formatCents(pending.amountCents)}.{" "}
                    <a href={pending.invoiceUrl}>Continuar esse pagamento</a>
                </S.PayNowText>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <S.MethodChoice role="radiogroup" aria-label="Forma de pagamento">
                    {METHODS.map((m) => (
                        <S.MethodOption key={m.value} type="button" role="radio" aria-checked={method === m.value} $on={method === m.value} onClick={() => setMethod(m.value)}>
                            <strong>{m.label}</strong>
                            <span>{m.hint}</span>
                        </S.MethodOption>
                    ))}
                </S.MethodChoice>

                {needsCpf && (
                    <S.CpfField>
                        <label htmlFor={cpfId}>Seu CPF</label>
                        <input id={cpfId} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskDocument(e.target.value))} autoFocus />
                        <small>O Asaas exige o CPF de quem paga. Ele vai só para o Asaas; o Festário não guarda. É pedido uma vez por salão.</small>
                    </S.CpfField>
                )}

                {error && <S.PayError role="alert">{error}</S.PayError>}

                <S.PayButton type="submit" disabled={busy} aria-busy={busy}>
                    {busy ? "Abrindo o pagamento..." : `Pagar ${formatCents(online.payableCents)} com ${method === "PIX" ? "Pix" : "cartão"}`}
                </S.PayButton>
            </form>
        </S.PayNow>
    );
}
