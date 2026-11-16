import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { PROVIDER_QUOTE_STATUS_LABELS } from "../../constants/providers";
import { answerQuote, listReceivedQuotes, markQuoteHired, rejectQuote, type ProviderQuoteList } from "../../services/quote";
import type { ProviderQuote, QuoteStatus } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate, formatPhoneDigits, whatsappLink } from "../../utils/providerFormat";
import { formatPrice } from "../../utils/salonFormat";
import * as A from "../Admin/styles";
import * as S from "./styles";

const FILTERS: { key: QuoteStatus | ""; label: string }[] = [
    { key: "OPEN", label: "Novos" },
    { key: "ANSWERED", label: "Respondidos" },
    { key: "ACCEPTED", label: "Aceitos" },
    { key: "HIRED", label: "Contratados" },
    { key: "", label: "Todos" },
];

const parseMoney = (v: string) => Number(v.replace(/\./g, "").replace(",", "."));

/**
 * Pedidos de orçamento recebidos. O prestador responde com valor e mensagem (o cliente recebe o
 * WhatsApp dele junto), recusa quando não atende e, depois do aceite, marca como contratado com o
 * valor fechado.
 *
 * @see GET /providers/me/quotes
 */
export default function QuotesInbox() {
    const [filter, setFilter] = useState<QuoteStatus | "">("OPEN");
    const [loaded, setLoaded] = useState<{ key: string; list: ProviderQuoteList } | null>(null);
    const [reload, setReload] = useState(0);
    const key = `${filter}:${reload}`;
    // Trocar o filtro mostra "carregando" até a lista nova chegar.
    const list = loaded?.key === key ? loaded.list : null;

    useEffect(() => {
        const controller = new AbortController();
        listReceivedQuotes({ status: filter || undefined, limit: 50 }, controller.signal)
            .then((l) => setLoaded({ key, list: l }))
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar os pedidos.")); });
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Os números continuam na tela enquanto a lista do filtro novo carrega.
    const counts = (list ?? loaded?.list)?.counts ?? {};

    return (
        <A.Section aria-labelledby="inbox-title">
            <A.SectionTitle id="inbox-title">Pedidos de orçamento</A.SectionTitle>
            <S.Filters role="group" aria-label="Filtrar pedidos">
                {FILTERS.map((f) => (
                    <S.FilterButton key={f.key || "all"} type="button" aria-pressed={filter === f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
                        {f.label}
                        {f.key && counts[f.key] ? <S.Count aria-label={`${counts[f.key]} pedidos`}>{counts[f.key]}</S.Count> : null}
                    </S.FilterButton>
                ))}
            </S.Filters>

            {list === null ? (
                <A.LoadingSpinner aria-label="Carregando os pedidos" />
            ) : list.data.length === 0 ? (
                <A.EmptyState>
                    {filter === "OPEN"
                        ? "Nenhum pedido novo. Perfis com várias fotos e pacotes com preço recebem mais pedidos."
                        : "Nenhum pedido nesta situação."}
                </A.EmptyState>
            ) : (
                <S.QuoteList>
                    {list.data.map((q) => <ReceivedQuote key={q.id} quote={q} onChanged={() => setReload((n) => n + 1)} />)}
                </S.QuoteList>
            )}
        </A.Section>
    );
}

function ReceivedQuote({ quote: q, onChanged }: { quote: ProviderQuote; onChanged: () => void }) {
    const [mode, setMode] = useState<"answer" | "reject" | "hired" | null>(null);
    const [amount, setAmount] = useState(q.quotedAmount != null ? String(q.quotedAmount).replace(".", ",") : "");
    const [text, setText] = useState(q.responseMessage ?? "");
    const [busy, setBusy] = useState(false);
    const wa = whatsappLink(q.customer.phone, `Olá, ${q.customer.name.split(" ")[0]}! Aqui é do seu pedido de orçamento no Festário para ${formatEventDate(q.eventDate, { weekday: false })}.`);

    async function run(action: () => Promise<unknown>, done: string) {
        try {
            setBusy(true);
            await action();
            toast.success(done);
            setMode(null);
            onChanged();
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
        } finally {
            setBusy(false);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (mode === "answer") {
            const value = parseMoney(amount);
            if (!amount.trim() || !Number.isFinite(value)) return toast.error("Informe o valor do orçamento.");
            if (text.trim().length < 5) return toast.error("Escreva a resposta para o cliente.");
            run(() => answerQuote(q.id, value, text.trim()), "Resposta enviada. O cliente recebeu o seu WhatsApp.");
        } else if (mode === "reject") {
            run(() => rejectQuote(q.id, text.trim() || null), "Pedido recusado. O cliente foi avisado.");
        } else if (mode === "hired") {
            const value = amount.trim() ? parseMoney(amount) : null;
            run(() => markQuoteHired(q.id, value), "Contratação registrada.");
        }
    }

    const canAnswer = q.status === "OPEN" || q.status === "ANSWERED";

    return (
        <S.QuoteCard $status={q.status}>
            <S.QuoteHead>
                <div>
                    <S.QuoteDate>{formatEventDate(q.eventDate)}</S.QuoteDate>
                    <S.QuoteWho>{q.eventType}{q.guests ? `, ${q.guests} convidados` : ""}, pedido por {q.customer.name}</S.QuoteWho>
                </div>
                <S.StatusTag $status={q.status}>{PROVIDER_QUOTE_STATUS_LABELS[q.status]}</S.StatusTag>
            </S.QuoteHead>

            {q.referredBy && <S.Referral>Indicação de {q.referredBy.name}</S.Referral>}
            {q.package && <S.QuoteMeta>Pacote de interesse: {q.package.name}</S.QuoteMeta>}
            <S.QuoteMessage>{q.message}</S.QuoteMessage>

            <S.ContactRow aria-label={`Contato de ${q.customer.name}`}>
                {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp {formatPhoneDigits(q.customer.phone)}</a></li>}
                <li><a href={`mailto:${q.customer.email}`}>{q.customer.email}</a></li>
            </S.ContactRow>

            {q.quotedAmount != null && (
                <S.Answer>
                    <strong>Sua resposta: {formatPrice(q.quotedAmount)}</strong>
                    {q.responseMessage && <p>{q.responseMessage}</p>}
                </S.Answer>
            )}
            {q.status === "HIRED" && q.closedAmount != null && <S.QuoteMeta>Valor fechado: <strong>{formatPrice(q.closedAmount)}</strong></S.QuoteMeta>}

            {mode ? (
                <S.InlineForm onSubmit={submit} noValidate>
                    {(mode === "answer" || mode === "hired") && (
                        <A.FormGroup>
                            <label htmlFor={`amt-${q.id}`}>{mode === "answer" ? "Valor do orçamento (R$)" : "Valor fechado (R$)"}</label>
                            <A.TextInput id={`amt-${q.id}`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
                            {mode === "hired" && <A.FieldHint>Em branco, vale o valor que você orçou.</A.FieldHint>}
                        </A.FormGroup>
                    )}
                    {mode !== "hired" && (
                        <A.FormGroup>
                            <label htmlFor={`txt-${q.id}`}>{mode === "answer" ? "Mensagem para o cliente" : "Motivo (opcional, o cliente vê)"}</label>
                            <S.TextArea
                                id={`txt-${q.id}`}
                                rows={3}
                                maxLength={mode === "answer" ? 2000 : 500}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={mode === "answer" ? "O que está incluso, forma de pagamento, prazo para confirmar." : "Ex.: já tenho outra festa nesse dia."}
                            />
                        </A.FormGroup>
                    )}
                    <A.InlineGroup>
                        <A.PrimaryButton type="submit" disabled={busy} aria-busy={busy}>
                            {mode === "answer" ? "Enviar resposta" : mode === "reject" ? "Recusar pedido" : "Registrar contratação"}
                        </A.PrimaryButton>
                        <A.SecondaryButton type="button" onClick={() => setMode(null)} disabled={busy}>Cancelar</A.SecondaryButton>
                    </A.InlineGroup>
                </S.InlineForm>
            ) : (
                <A.InlineGroup>
                    {canAnswer && <A.PrimaryButton type="button" onClick={() => setMode("answer")}>{q.status === "ANSWERED" ? "Mudar a resposta" : "Responder"}</A.PrimaryButton>}
                    {q.status === "ACCEPTED" && <A.PrimaryButton type="button" onClick={() => { setAmount(q.quotedAmount != null ? String(q.quotedAmount).replace(".", ",") : ""); setMode("hired"); }}>Marcar como contratado</A.PrimaryButton>}
                    {canAnswer && <A.SecondaryButton type="button" onClick={() => { setText(""); setMode("reject"); }}>Não posso atender</A.SecondaryButton>}
                </A.InlineGroup>
            )}
        </S.QuoteCard>
    );
}
