import { useCallback, useEffect, useId, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "react-toastify";

import { getMySubscription, requestAutomaticPayment } from "../../../services/subscription";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../../utils/getErrorMessage";
import { formatCents, formatDay, looksLikeDocument, SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_TONE } from "../../../utils/subscription";
import type { SubscriptionDetail } from "../../../types";
import * as A from "../styles";
import { ChargesTable } from "./ChargesTable";
import { statusCopy } from "./statusCopy";
import * as S from "./styles";

const GRACE_DAYS = 7;

async function copy(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Aba "Assinatura" do painel do dono: a situação numa frase, o próximo vencimento, a autorização do Pix
 * Automático (QR Code e copia e cola) e o histórico de cobranças.
 *
 * @see GET /tenant/subscription · POST /tenant/subscription/authorization
 */
export function SubscriptionTab() {
    const [sub, setSub] = useState<SubscriptionDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloading, setReloading] = useState(false);

    const load = useCallback((signal?: AbortSignal) => {
        return getMySubscription(signal)
            .then((data) => {
                setSub(data);
                setError(null);
            })
            .catch((err) => {
                if (!isAbortError(err)) setError(getLoadErrorMessage(err, "Não foi possível carregar a assinatura."));
            });
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function refresh() {
        setReloading(true);
        await load();
        setReloading(false);
    }

    if (error) {
        return (
            <A.EmptyState role="alert">
                <h3>Não foi possível carregar a assinatura</h3>
                <p>{error}</p>
                <A.SecondaryButton type="button" onClick={refresh}>Tentar de novo</A.SecondaryButton>
            </A.EmptyState>
        );
    }
    if (!sub) return <A.LoadingSpinner role="status" aria-label="Carregando a assinatura" />;

    const tone = sub.billingEnabled ? SUBSCRIPTION_STATUS_TONE[sub.status] : "info";
    const { headline, text } = statusCopy(sub);
    const overdue = sub.billingEnabled && (sub.status === "EM_ATRASO" || sub.status === "SUSPENSA");
    const pastDays = Math.min(GRACE_DAYS, sub.overdueDays);

    return (
        <A.Section>
            <S.StatusPanel $tone={tone} aria-labelledby="subscription-headline">
                {sub.billingEnabled && <div><S.ToneBadge $tone={tone}>{SUBSCRIPTION_STATUS_LABELS[sub.status]}</S.ToneBadge></div>}
                <S.StatusHeadline id="subscription-headline">{headline}</S.StatusHeadline>
                <S.StatusText>{text}</S.StatusText>

                {overdue && (
                    <div>
                        <S.GraceTrack $tone={tone} aria-hidden="true">
                            {Array.from({ length: GRACE_DAYS }, (_, i) => <li key={i} data-past={i < pastDays} />)}
                        </S.GraceTrack>
                        <S.GraceCaption>
                            {sub.status === "SUSPENSA"
                                ? "Os 7 dias de tolerância acabaram."
                                : `${pastDays} de ${GRACE_DAYS} dias de tolerância usados. Último dia: ${formatDay(sub.graceEndsOn)}.`}
                        </S.GraceCaption>
                    </div>
                )}

                <S.Facts>
                    <div><dt>Plano</dt><dd>{sub.name}</dd></div>
                    <div><dt>Valor</dt><dd>{formatCents(sub.monthlyPriceCents)} por mês</dd></div>
                    <div><dt>{overdue ? "Venceu em" : sub.inTrial ? "Primeira cobrança" : "Próxima cobrança"}</dt><dd>{formatDay(sub.nextDueDate)}</dd></div>
                    {sub.billingEnabled && (
                        <div><dt>Forma de pagamento</dt><dd>{sub.automaticPayment.state === "APPROVED" ? "Pix Automático" : "Ainda não definida"}</dd></div>
                    )}
                </S.Facts>
            </S.StatusPanel>

            {sub.billingEnabled && (
                <AutomaticPaymentCard sub={sub} onChange={setSub} onRefresh={refresh} refreshing={reloading} />
            )}

            <S.Card aria-labelledby="charges-title">
                <S.CardTitle id="charges-title">Histórico de cobranças</S.CardTitle>
                <ChargesTable charges={sub.charges} caption="Cobranças da assinatura" />
            </S.Card>
        </A.Section>
    );
}

interface AutomaticPaymentCardProps {
    sub: SubscriptionDetail;
    onChange: (sub: SubscriptionDetail) => void;
    onRefresh: () => void;
    refreshing: boolean;
}

function AutomaticPaymentCard({ sub, onChange, onRefresh, refreshing }: AutomaticPaymentCardProps) {
    const { state, payerName, payerDocument, authorizedAt, code } = sub.automaticPayment;
    const [showForm, setShowForm] = useState(false);

    if (state === "APPROVED") {
        return (
            <S.Card aria-labelledby="pa-title">
                <S.CardTitle id="pa-title">Pix Automático autorizado</S.CardTitle>
                <S.CardText>
                    Todo mês, {formatCents(sub.monthlyPriceCents)} são debitados da conta de {payerName ?? "quem autorizou"}
                    {payerDocument ? ` (${payerDocument})` : ""} no dia do vencimento. Você recebe um e-mail 5 dias antes e outro no dia.
                    {authorizedAt && ` Autorizado em ${new Date(authorizedAt).toLocaleDateString("pt-BR")}.`}
                </S.CardText>
                <S.CardText>Para cancelar ou trocar a conta, use a área de Pix Automático do app do seu banco.</S.CardText>
            </S.Card>
        );
    }

    if (state === "PENDING" && code && !showForm) {
        return <PendingAuthorization sub={sub} code={code} onRefresh={onRefresh} refreshing={refreshing} onRestart={() => setShowForm(true)} />;
    }

    return (
        <S.Card aria-labelledby="pa-title">
            <S.CardTitle id="pa-title">{state === "ENDED" ? "Autorize o Pix Automático de novo" : "Autorize o Pix Automático"}</S.CardTitle>
            <S.CardText>
                Você autoriza uma vez no app do seu banco e a assinatura é paga sozinha todo mês, no dia do vencimento. Dá para cancelar
                quando quiser pelo próprio banco.
            </S.CardText>
            <AuthorizationForm
                onDone={(updated) => {
                    setShowForm(false);
                    onChange(updated);
                }}
            />
            {(sub.status === "EM_ATRASO" || sub.status === "SUSPENSA") && (
                <S.CardText>Prefere pagar de outro jeito? Fale com a equipe do Festário: assim que o pagamento for registrado, o painel volta ao normal.</S.CardText>
            )}
        </S.Card>
    );
}

function AuthorizationForm({ onDone }: { onDone: (sub: SubscriptionDetail) => void }) {
    const nameId = useId();
    const docId = useId();
    const nameErrorId = useId();
    const docErrorId = useId();
    const nameRef = useRef<HTMLInputElement>(null);
    const docRef = useRef<HTMLInputElement>(null);
    const [payerName, setPayerName] = useState("");
    const [payerDocument, setPayerDocument] = useState("");
    const [touched, setTouched] = useState(false);
    const [saving, setSaving] = useState(false);

    const nameInvalid = payerName.trim().length < 3;
    const docInvalid = !looksLikeDocument(payerDocument);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(true);
        if (nameInvalid || docInvalid) {
            (nameInvalid ? nameRef : docRef).current?.focus();
            return;
        }
        setSaving(true);
        try {
            const updated = await requestAutomaticPayment({ payerName: payerName.trim(), payerDocument });
            toast.success("Autorização gerada. Agora aprove no app do seu banco.");
            onDone(updated);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível gerar a autorização. Tente de novo."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <S.FormGrid onSubmit={handleSubmit} noValidate aria-label="Autorizar o Pix Automático">
            <S.Field>
                <label htmlFor={nameId}>Nome de quem paga</label>
                <input
                    id={nameId}
                    ref={nameRef}
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={touched && nameInvalid}
                    aria-describedby={touched && nameInvalid ? nameErrorId : undefined}
                    onBlur={() => payerName && setTouched(true)}
                    disabled={saving}
                />
                {touched && nameInvalid && <S.FieldError id={nameErrorId}>Informe o nome do titular da conta.</S.FieldError>}
            </S.Field>
            <S.Field>
                <label htmlFor={docId}>CPF ou CNPJ</label>
                <input
                    id={docId}
                    ref={docRef}
                    value={payerDocument}
                    onChange={(e) => setPayerDocument(e.target.value)}
                    inputMode="numeric"
                    aria-invalid={touched && docInvalid}
                    aria-describedby={touched && docInvalid ? docErrorId : undefined}
                    disabled={saving}
                />
                {touched && docInvalid && <S.FieldError id={docErrorId}>Digite os 11 números do CPF ou os 14 do CNPJ.</S.FieldError>}
            </S.Field>
            <A.PrimaryButton type="submit" disabled={saving}>{saving ? "Gerando..." : "Gerar autorização"}</A.PrimaryButton>
        </S.FormGrid>
    );
}

interface PendingProps {
    sub: SubscriptionDetail;
    code: string;
    onRefresh: () => void;
    refreshing: boolean;
    onRestart: () => void;
}

function PendingAuthorization({ sub, code, onRefresh, refreshing, onRestart }: PendingProps) {
    const [qr, setQr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        QRCode.toDataURL(code, { margin: 1, width: 440, errorCorrectionLevel: "M" })
            .then((url: string) => { if (alive) setQr(url); })
            .catch(() => { if (alive) setQr(null); });
        return () => { alive = false; };
    }, [code]);

    async function handleCopy() {
        if (await copy(code)) toast.success("Código copiado. Cole no app do banco, na opção Pix Copia e Cola.");
        else toast.error("Não foi possível copiar. Selecione o código e copie manualmente.");
    }

    return (
        <S.Card aria-labelledby="pa-title">
            <S.CardTitle id="pa-title">Aprove o Pix Automático no seu banco</S.CardTitle>
            <S.AuthorizeLayout>
                {qr && (
                    <S.QrFrame>
                        <img src={qr} alt="QR Code para autorizar o Pix Automático" />
                        <figcaption>Leia com o app do banco</figcaption>
                    </S.QrFrame>
                )}
                <S.Stack>
                    <S.Steps>
                        <li>Abra o app do banco de {sub.automaticPayment.payerName ?? "quem vai pagar"} e escolha Pix.</li>
                        <li>Leia o QR Code ou use “Pix Copia e Cola” com o código abaixo.</li>
                        <li>Confira {formatCents(sub.monthlyPriceCents)} por mês, a partir de {formatDay(sub.nextDueDate)}, e confirme.</li>
                    </S.Steps>
                    <S.CodeBox readOnly value={code} aria-label="Código Pix Copia e Cola" onFocus={(e) => e.currentTarget.select()} />
                    <S.Actions>
                        <A.PrimaryButton type="button" onClick={handleCopy}>Copiar código</A.PrimaryButton>
                        <A.SecondaryButton type="button" onClick={onRefresh} disabled={refreshing}>
                            {refreshing ? "Conferindo..." : "Já aprovei, conferir"}
                        </A.SecondaryButton>
                        <A.SecondaryButton type="button" onClick={onRestart}>Usar outra conta</A.SecondaryButton>
                    </S.Actions>
                    <S.Muted>A aprovação pode levar alguns minutos para aparecer aqui.</S.Muted>
                </S.Stack>
            </S.AuthorizeLayout>
        </S.Card>
    );
}
