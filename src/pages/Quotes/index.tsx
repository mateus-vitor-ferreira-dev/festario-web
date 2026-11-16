import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { StarInput, StarsDisplay } from "../../components/Marketplace/Stars";
import VenueCover from "../../components/VenueCover";
import { CATEGORY_LABELS, QUOTE_STATUS_LABELS } from "../../constants/providers";
import { acceptQuote, cancelQuote, declineQuote, listMyQuotes } from "../../services/quote";
import { createReview } from "../../services/review";
import type { CustomerQuote } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate, whatsappLink } from "../../utils/providerFormat";
import { formatPrice } from "../../utils/salonFormat";
import { mailtoHref } from "../../utils/safeUrl";
import * as A from "../Admin/styles";
import * as M from "../MyBusiness/styles";
import * as S from "./styles";

/**
 * Meus orçamentos: os pedidos feitos aos prestadores, a resposta de cada um e o que fazer com ela.
 * Depois da resposta aparece o WhatsApp do prestador, com uma mensagem pronta. `?id=` (o link do
 * e-mail de resposta) rola até o pedido.
 *
 * @see GET /quotes/mine
 */
export default function Quotes() {
    const [quotes, setQuotes] = useState<CustomerQuote[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);
    const [params] = useSearchParams();
    const focusId = params.get("id");
    const focusRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        listMyQuotes({ limit: 50 }, controller.signal)
            .then((r) => { setQuotes(r.data); setError(null); })
            .catch((err) => { if (!isAbortError(err)) setError(getLoadErrorMessage(err, "Não foi possível carregar os seus orçamentos.")); });
        return () => controller.abort();
    }, [reload]);

    useEffect(() => {
        if (quotes && focusId) focusRef.current?.scrollIntoView({ block: "start" });
    }, [quotes, focusId]);

    const replace = (q: CustomerQuote) => setQuotes((cur) => cur?.map((x) => (x.id === q.id ? q : x)) ?? null);

    return (
        <M.Container>
            <header>
                <M.Title>Meus orçamentos</M.Title>
                <M.Lead>Os pedidos que você fez aos prestadores. Quando um responde, o valor e o WhatsApp dele aparecem aqui.</M.Lead>
            </header>

            {error ? (
                <A.EmptyState role="alert">
                    {error}
                    <A.SecondaryButton type="button" onClick={() => setReload((n) => n + 1)}>Tentar de novo</A.SecondaryButton>
                </A.EmptyState>
            ) : quotes === null ? (
                <A.LoadingSpinner aria-label="Carregando os orçamentos" />
            ) : quotes.length === 0 ? (
                <S.Empty>
                    <h2>Nenhum pedido ainda</h2>
                    <p>Encontre buffet, decoração, maquiagem e os outros serviços para a sua festa e peça o orçamento pelo Festário.</p>
                    <S.CTA as={Link} to="/servicos">Ver serviços</S.CTA>
                </S.Empty>
            ) : (
                <M.QuoteList>
                    {quotes.map((q) => (
                        <CustomerQuoteItem key={q.id} quote={q} onChange={replace} itemRef={q.id === focusId ? focusRef : undefined} />
                    ))}
                </M.QuoteList>
            )}
        </M.Container>
    );
}

function CustomerQuoteItem({ quote: q, onChange, itemRef }: { quote: CustomerQuote; onChange: (q: CustomerQuote) => void; itemRef?: React.Ref<HTMLLIElement> }) {
    const [busy, setBusy] = useState(false);
    const contact = q.provider.contact;
    const wa = whatsappLink(contact?.whatsapp, `Olá! Vi a sua resposta ao meu pedido de orçamento no Festário para ${formatEventDate(q.eventDate, { weekday: false })}.`);

    async function run(action: () => Promise<CustomerQuote>, done: string) {
        try {
            setBusy(true);
            onChange(await action());
            toast.success(done);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
        } finally {
            setBusy(false);
        }
    }

    const canCancel = q.status === "OPEN" || q.status === "ANSWERED" || q.status === "ACCEPTED";

    return (
        <M.QuoteCard $status={q.status} ref={itemRef} tabIndex={-1}>
            <S.Provider>
                <S.Thumb><VenueCover venueName={q.provider.name} photo={q.provider.cover} sizes="96px" ratio={1} /></S.Thumb>
                <div>
                    <S.ProviderName><Link to={`/servicos/${q.provider.slug}`}>{q.provider.name}</Link></S.ProviderName>
                    <M.QuoteMeta>{q.provider.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}</M.QuoteMeta>
                </div>
                <M.StatusTag $status={q.status}>{QUOTE_STATUS_LABELS[q.status]}</M.StatusTag>
            </S.Provider>

            <M.QuoteWho>
                {q.eventType} em {formatEventDate(q.eventDate)}{q.guests ? `, ${q.guests} convidados` : ""}
            </M.QuoteWho>

            {q.status === "OPEN" && <M.QuoteMeta>Pedido enviado. Você recebe um aviso quando {q.provider.name} responder.</M.QuoteMeta>}

            {q.quotedAmount != null && (
                <M.Answer>
                    <strong>{q.status === "HIRED" && q.closedAmount != null ? `Fechado por ${formatPrice(q.closedAmount)}` : `Orçamento: ${formatPrice(q.quotedAmount)}`}</strong>
                    {q.responseMessage && <p>{q.responseMessage}</p>}
                </M.Answer>
            )}
            {q.status === "REJECTED" && (
                <M.QuoteMeta>
                    {q.rejectionReason ? `${q.provider.name}: ${q.rejectionReason}` : `${q.provider.name} não pode atender esse pedido.`}{" "}
                    <Link to={`/servicos?category=${q.provider.categories[0] ?? ""}&date=${q.eventDate}`}>Ver outros livres na data</Link>
                </M.QuoteMeta>
            )}

            {contact && (wa || contact.email) && (
                <M.ContactRow aria-label={`Contato de ${q.provider.name}`}>
                    {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer">Combinar pelo WhatsApp</a></li>}
                    {contact.email && <li>{mailtoHref(contact.email) ? <a href={mailtoHref(contact.email)!}>{contact.email}</a> : contact.email}</li>}
                </M.ContactRow>
            )}

            {q.review && (
                <S.MyReview>
                    <strong>Sua avaliação</strong>
                    <StarsDisplay value={q.review.rating} />
                    {q.review.comment && <p>{q.review.comment}</p>}
                    {q.review.reply && <p><em>Resposta de {q.provider.name}:</em> {q.review.reply}</p>}
                </S.MyReview>
            )}
            {q.canReview && <ReviewForm quote={q} onDone={onChange} />}

            {(q.status === "ANSWERED" || canCancel) && (
                <A.InlineGroup>
                    {q.status === "ANSWERED" && (
                        <>
                            <A.PrimaryButton type="button" disabled={busy} onClick={() => run(() => acceptQuote(q.id), `Você aceitou o orçamento de ${q.provider.name}.`)}>Aceitar orçamento</A.PrimaryButton>
                            <A.SecondaryButton type="button" disabled={busy} onClick={() => run(() => declineQuote(q.id), "Orçamento recusado.")}>Recusar</A.SecondaryButton>
                        </>
                    )}
                    {canCancel && q.status !== "ANSWERED" && (
                        <A.SecondaryButton type="button" disabled={busy} onClick={() => { if (window.confirm("Desistir deste pedido? O prestador é avisado no painel.")) run(() => cancelQuote(q.id), "Pedido cancelado."); }}>
                            Desistir do pedido
                        </A.SecondaryButton>
                    )}
                </A.InlineGroup>
            )}
        </M.QuoteCard>
    );
}

/** A festa passou e o serviço foi contratado: a nota (obrigatória) e o comentário (opcional). */
function ReviewForm({ quote: q, onDone }: { quote: CustomerQuote; onDone: (q: CustomerQuote) => void }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [sending, setSending] = useState(false);

    if (!open) {
        return (
            <S.ReviewPrompt>
                <p>Como foi o serviço de {q.provider.name} na festa? A sua avaliação ajuda quem está escolhendo.</p>
                <A.PrimaryButton type="button" onClick={() => setOpen(true)}>Avaliar</A.PrimaryButton>
            </S.ReviewPrompt>
        );
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!rating) return toast.error("Escolha de 1 a 5 estrelas.");
        try {
            setSending(true);
            const review = await createReview(q.id, rating, comment.trim() || null);
            onDone({ ...q, canReview: false, review: { id: review.id, rating: review.rating, comment: review.comment, reply: null, createdAt: review.createdAt } });
            toast.success("Avaliação publicada. Obrigado!");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível enviar a avaliação."));
        } finally {
            setSending(false);
        }
    }

    return (
        <S.ReviewForm onSubmit={submit} noValidate aria-label={`Avaliar ${q.provider.name}`}>
            <StarInput value={rating} onChange={setRating} label={`Sua nota para ${q.provider.name}`} />
            <A.FormGroup>
                <label htmlFor={`review-${q.id}`}>Comentário (opcional, aparece na página do prestador)</label>
                <M.TextArea id={`review-${q.id}`} rows={3} maxLength={1500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="O que deu certo, o que poderia melhorar." />
            </A.FormGroup>
            <A.InlineGroup>
                <A.PrimaryButton type="submit" disabled={sending} aria-busy={sending}>{sending ? "Enviando..." : "Publicar avaliação"}</A.PrimaryButton>
                <A.SecondaryButton type="button" onClick={() => setOpen(false)} disabled={sending}>Agora não</A.SecondaryButton>
            </A.InlineGroup>
        </S.ReviewForm>
    );
}
