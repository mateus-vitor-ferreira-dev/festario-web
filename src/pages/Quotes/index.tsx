import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import VenueCover from "../../components/VenueCover";
import { CATEGORY_LABELS, QUOTE_STATUS_LABELS } from "../../constants/providers";
import { acceptQuote, cancelQuote, declineQuote, listMyQuotes } from "../../services/quote";
import type { CustomerQuote } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate, whatsappLink } from "../../utils/providerFormat";
import { formatPrice } from "../../utils/salonFormat";
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
                    {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
                </M.ContactRow>
            )}

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
