import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import DatePickerInput from "../../components/DatePickerInput";
import VenueGallery from "../../components/VenueGallery";
import { CATEGORY_LABELS, EVENT_TYPES, PRICE_UNIT_LABELS, SERVICE_MODE_LABELS } from "../../constants/providers";
import { useAuth } from "../../contexts/AuthContext";
import { getProvider } from "../../services/provider";
import { requestQuote } from "../../services/quote";
import type { CustomerQuote, ProviderDetail } from "../../types";
import { getApiErrorCode, getHttpStatus, isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate, formatProviderPrice, instagramUrl } from "../../utils/providerFormat";
import { withReturn } from "../../utils/returnPath";
import { isManagerRole } from "../../utils/roles";
import { formatPlace, formatPrice } from "../../utils/salonFormat";
import * as SP from "../SalonPage/styles";
import * as S from "./styles";

type LoadState = { status: "loading" } | { status: "ready"; provider: ProviderDetail } | { status: "missing" } | { status: "error"; message: string };

const localToday = () => new Date().toLocaleDateString("en-CA");

/**
 * Página pública do prestador: portfólio, pacotes, onde atende e o pedido de orçamento. O WhatsApp
 * não aparece aqui: ele chega para o cliente junto com a resposta ao orçamento.
 * A busca pode trazer `data`, `convidados`, `reserva` e `pacote` para o pedido já sair preenchido
 * (vindo da vitrine com a data escolhida ou do "Monte a sua festa" de uma reserva).
 *
 * @see GET /providers/:slug
 * @see POST /providers/:slug/quotes
 */
export default function ProviderPage() {
    const { slug = "" } = useParams();
    const location = useLocation();
    const [search] = useSearchParams();
    // O resultado guarda de qual endereço veio: trocar de prestador volta a "carregando" sem setState no effect.
    const [result, setResult] = useState<{ key: string; state: LoadState } | null>(null);
    const [reload, setReload] = useState(0);
    const key = `${slug}:${reload}`;
    const state: LoadState = result?.key === key ? result.state : { status: "loading" };
    const setState = (next: LoadState) => setResult({ key, state: next });
    const from = (location.state as { from?: string } | null)?.from ?? "";

    useEffect(() => {
        const controller = new AbortController();
        getProvider(slug, controller.signal)
            .then((provider) => setState({ status: "ready", provider }))
            .catch((err) => {
                if (isAbortError(err)) return;
                setState(getHttpStatus(err) === 404 || getHttpStatus(err) === 400
                    ? { status: "missing" }
                    : { status: "error", message: getLoadErrorMessage(err, "Não foi possível carregar o prestador.") });
            });
        return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const back = <SP.BackLink as={Link} to={`/servicos${from}`}>Todos os serviços</SP.BackLink>;

    if (state.status === "loading") return <SP.Container>{back}<SP.Status role="status">Carregando...</SP.Status></SP.Container>;
    if (state.status === "missing") {
        return (
            <SP.Container>
                {back}
                <SP.Notice>
                    <h1>Este prestador não está disponível</h1>
                    <p>O endereço pode estar errado ou o perfil saiu da vitrine. Veja os outros serviços.</p>
                </SP.Notice>
            </SP.Container>
        );
    }
    if (state.status === "error") {
        return (
            <SP.Container>
                {back}
                <SP.Notice role="alert">
                    <h1>A página não carregou</h1>
                    <p>{state.message}</p>
                    <SP.SecondaryButton type="button" onClick={() => setReload((n) => n + 1)}>Tentar de novo</SP.SecondaryButton>
                </SP.Notice>
            </SP.Container>
        );
    }

    const p = state.provider;
    const place = formatPlace(null, p.city, p.state);
    const price = formatProviderPrice(p.startingPrice, p.startingPriceUnit);

    return (
        <SP.Container>
            {back}

            {p.preview && (
                <S.PreviewNote role="status">
                    Só você está vendo esta página: o perfil ainda não está na vitrine. <Link to="/meu-negocio">Voltar ao Meu negócio</Link>
                </S.PreviewNote>
            )}

            <S.Layout>
                <S.Main>
                    <S.Header>
                        <S.Categories>{p.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}</S.Categories>
                        <S.Name>{p.name}</S.Name>
                        <S.Facts>
                            {place && <li>{place}{p.serviceMode !== "STUDIO" && `, até ${p.serviceRadiusKm} km`}</li>}
                            <li>{SERVICE_MODE_LABELS[p.serviceMode]}</li>
                            {price && <li>a partir de <strong>{price}</strong></li>}
                        </S.Facts>
                        {p.recommendedBy.length > 0 && (
                            <S.Recommended>
                                Indicado por {p.recommendedBy.map((s, i) => (
                                    <span key={s.slug}>{i > 0 && (i === p.recommendedBy.length - 1 ? " e " : ", ")}<Link to={`/s/${s.slug}`}>{s.name}</Link></span>
                                ))}
                            </S.Recommended>
                        )}
                    </S.Header>

                    <VenueGallery venueName={p.name} photos={p.photos} />

                    {p.description && (
                        <section aria-labelledby="about">
                            <SP.SectionTitle id="about">Sobre o trabalho</SP.SectionTitle>
                            <S.Description>{p.description}</S.Description>
                        </section>
                    )}

                    {p.packages.length > 0 && (
                        <section aria-labelledby="packages">
                            <SP.SectionTitle id="packages">Pacotes</SP.SectionTitle>
                            <S.Packages>
                                {p.packages.map((k) => (
                                    <li key={k.id}>
                                        <div>
                                            <h3>{k.name}</h3>
                                            {k.description && <p>{k.description}</p>}
                                        </div>
                                        <S.PackagePrice>
                                            <strong>{formatPrice(k.price)}</strong>
                                            <span>{PRICE_UNIT_LABELS[k.priceUnit]}</span>
                                        </S.PackagePrice>
                                    </li>
                                ))}
                            </S.Packages>
                        </section>
                    )}

                    {p.instagram && (
                        <S.Instagram href={instagramUrl(p.instagram)} target="_blank" rel="noopener noreferrer">
                            Mais trabalhos no Instagram: @{p.instagram}
                        </S.Instagram>
                    )}
                </S.Main>

                <S.Aside>
                    <QuoteForm provider={p} search={search} returnPath={`${location.pathname}${location.search}`} />
                </S.Aside>
            </S.Layout>
        </SP.Container>
    );
}

interface QuoteFormProps {
    provider: ProviderDetail;
    search: URLSearchParams;
    returnPath: string;
}

function QuoteForm({ provider, search, returnPath }: QuoteFormProps) {
    const { user, isAuthenticated } = useAuth();
    const [eventDate, setEventDate] = useState(search.get("data") ?? "");
    const [guests, setGuests] = useState(search.get("convidados") ?? "");
    const [eventType, setEventType] = useState(search.get("tipo") ?? "");
    const [packageId, setPackageId] = useState(search.get("pacote") ?? "");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState<CustomerQuote | null>(null);
    const reservationId = search.get("reserva");
    const busy = useMemo(() => provider.busyDates.map((d) => new Date(`${d}T12:00:00`)), [provider.busyDates]);
    const dateIsBusy = provider.busyDates.includes(eventDate);

    if (isAuthenticated && isManagerRole(user?.role)) {
        return (
            <S.QuoteBox aria-labelledby="quote-title">
                <h2 id="quote-title">Pedir orçamento</h2>
                <p>Você está com a conta do salão. Para pedir orçamento, entre com uma conta de cliente.</p>
            </S.QuoteBox>
        );
    }

    if (sent) {
        return (
            <S.QuoteBox aria-labelledby="quote-title" role="status">
                <h2 id="quote-title">Pedido enviado</h2>
                <p>
                    {provider.name} recebeu o seu pedido para {formatEventDate(sent.eventDate)}. Quando responder, você recebe o valor e o
                    WhatsApp para combinar os detalhes.
                </p>
                <S.QuotePrimary as={Link} to={`/orcamentos?id=${sent.id}`}>Ver meus orçamentos</S.QuotePrimary>
            </S.QuoteBox>
        );
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!eventDate) return setError("Escolha a data da festa.");
        if (dateIsBusy) return setError(`${provider.name} não atende nessa data. Escolha outra.`);
        if (!eventType) return setError("Escolha o tipo de festa.");
        if (message.trim().length < 10) return setError("Conte um pouco do que você precisa (ao menos 10 letras).");
        try {
            setSending(true);
            setSent(await requestQuote(provider.slug, {
                eventDate, eventType, message: message.trim(),
                guests: guests ? Number(guests) : null,
                packageId: packageId || null,
                reservationId: reservationId || null,
            }));
        } catch (err) {
            setError(getApiErrorCode(err) === "QUOTE_ALREADY_OPEN"
                ? "Você já tem um pedido em andamento com esse prestador para essa data. Veja em Meus orçamentos."
                : getErrorMessage(err, "Não foi possível enviar o pedido."));
        } finally {
            setSending(false);
        }
    }

    return (
        <S.QuoteBox as="form" onSubmit={submit} noValidate aria-labelledby="quote-title">
            <h2 id="quote-title">Pedir orçamento</h2>
            <p>Grátis e sem compromisso. O prestador responde com o valor pelo Festário.</p>

            {error && <S.QuoteError role="alert">{error}</S.QuoteError>}

            <DatePickerInput
                label="Data da festa"
                value={eventDate}
                minDate={localToday()}
                excludeDates={busy}
                onChange={(e) => setEventDate(e.target.value)}
                error={dateIsBusy ? "Data ocupada na agenda do prestador." : undefined}
            />

            <S.Field>
                <label htmlFor="quote-type">Tipo de festa</label>
                <select id="quote-type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option value="">Escolha</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </S.Field>

            <S.Field>
                <label htmlFor="quote-guests">Convidados (aproximado)</label>
                <input id="quote-guests" inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Ex.: 80" />
            </S.Field>

            {provider.packages.length > 0 && (
                <S.Field>
                    <label htmlFor="quote-package">Pacote de interesse</label>
                    <select id="quote-package" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
                        <option value="">Ainda não sei</option>
                        {provider.packages.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                </S.Field>
            )}

            <S.Field>
                <label htmlFor="quote-message">O que você precisa</label>
                <textarea
                    id="quote-message"
                    rows={4}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ex.: Mesa de doces para aniversário de 15 anos, tema jardim, no salão às 19h."
                />
            </S.Field>

            {isAuthenticated ? (
                <S.QuotePrimary type="submit" disabled={sending} aria-busy={sending}>{sending ? "Enviando..." : "Enviar pedido"}</S.QuotePrimary>
            ) : (
                <S.QuotePrimary as={Link} to={withReturn("/login", returnPath)}>Entrar para enviar o pedido</S.QuotePrimary>
            )}
        </S.QuoteBox>
    );
}
