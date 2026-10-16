import { CSSProperties, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import SalonMark from "../../components/SalonMark";
import VenueCover from "../../components/VenueCover";
import { useAuth } from "../../contexts/AuthContext";
import { useSalonOrigin } from "../../hooks/useSalonOrigin";
import { getSalon } from "../../services/salon";
import { getHttpStatus, isAbortError } from "../../utils/errors";
import { getLoadErrorMessage } from "../../utils/getErrorMessage";
import { isManagerRole } from "../../utils/roles";
import { withReturn } from "../../utils/returnPath";
import { AMENITY_LABELS, sortAmenities } from "../../constants/amenities";
import { formatCapacityRange, formatDistance, formatPlace, formatPrice } from "../../utils/salonFormat";
import type { SalonDetail, SalonVenue } from "../../types";
import * as S from "./styles";

/** WhatsApp guardado como "(35) 99999-0000": o link precisa do DDI e só dos números. */
function whatsappUrl(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) return null;
    return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
}

function instagramUrl(raw: string): string {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://instagram.com/${raw.replace(/^@/, "").trim()}`;
}

function priceText(salon: SalonDetail): string | null {
    if (!salon.priceRange) return null;
    const { min, max } = salon.priceRange;
    return min === max ? `a partir de ${formatPrice(min)}` : `de ${formatPrice(min)} a ${formatPrice(max)}`;
}

type LoadState = { status: "loading" } | { status: "ready"; salon: SalonDetail } | { status: "missing" } | { status: "error"; message: string };

/**
 * Página pública de um salão: apresentação, contatos e os espaços, cada um com "Reservar".
 * Para o cliente, abrir a página passa a enviar o `X-Tenant-Slug` deste salão: o header mostra a
 * marca dele e a reserva vai para ele. Donos e a equipe continuam no próprio salão (só leem a página).
 * É pública: sem login, "Reservar" leva ao login e volta aqui com `?reservar=<espaço>`, que segue
 * direto para a reserva daquele espaço.
 *
 * @see GET /salons/:slug
 */
export default function SalonPage() {
    const { slug = "" } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, tenant, setTenant, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const pendingVenueId = searchParams.get("reservar");
    const origin = useSalonOrigin();
    const [state, setState] = useState<LoadState>({ status: "loading" });
    const [reload, setReload] = useState(0);
    const canReserve = !isManagerRole(user?.role);
    const from = (location.state as { from?: string } | null)?.from ?? "";

    useEffect(() => {
        const controller = new AbortController();
        setState({ status: "loading" });
        getSalon(slug, origin.params, controller.signal)
            .then((salon) => setState({ status: "ready", salon }))
            .catch((err) => {
                if (isAbortError(err)) return;
                setState(getHttpStatus(err) === 404 || getHttpStatus(err) === 400
                    ? { status: "missing" }
                    : { status: "error", message: getLoadErrorMessage(err, "Não foi possível carregar o salão.") });
            });
        return () => controller.abort();
    }, [slug, origin.params, reload]);

    const salon = state.status === "ready" ? state.salon : null;

    useEffect(() => {
        if (!salon || !isAuthenticated || !canReserve || tenant?.slug === salon.slug) return;
        setTenant({ slug: salon.slug, name: salon.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salon?.slug, canReserve, isAuthenticated]);

    function reserve(venue: SalonVenue, { replace = false } = {}) {
        if (!salon) return;
        if (!isAuthenticated) {
            navigate(withReturn("/login", `/s/${salon.slug}?reservar=${venue.id}`));
            return;
        }
        if (tenant?.slug !== salon.slug) setTenant({ slug: salon.slug, name: salon.name });
        navigate(`/reservation-intent/${venue.id}`, { replace });
    }

    // Voltou do login para reservar um espaço: segue direto para a reserva dele.
    useEffect(() => {
        if (!salon || !isAuthenticated || !canReserve || !pendingVenueId) return;
        const venue = salon.venues.find((v) => v.id === pendingVenueId);
        if (venue) reserve(venue, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salon?.slug, isAuthenticated, pendingVenueId]);

    const back = <S.BackLink as={Link} to={`/saloes${from}`}>Todos os salões</S.BackLink>;

    if (state.status === "loading") {
        return <S.Container>{back}<S.Status role="status">Carregando o salão...</S.Status></S.Container>;
    }
    if (state.status === "missing") {
        return (
            <S.Container>
                {back}
                <S.Notice>
                    <h1>Este salão não está disponível</h1>
                    <p>O endereço pode estar errado ou o salão deixou de receber reservas. Veja os outros salões na vitrine.</p>
                </S.Notice>
            </S.Container>
        );
    }
    if (state.status === "error") {
        return (
            <S.Container>
                {back}
                <S.Notice role="alert">
                    <h1>O salão não carregou</h1>
                    <p>{state.message}</p>
                    <S.SecondaryButton type="button" onClick={() => setReload((n) => n + 1)}>Tentar de novo</S.SecondaryButton>
                </S.Notice>
            </S.Container>
        );
    }

    const s = state.salon;
    const place = formatPlace(s.neighborhood, s.city, s.state);
    const distance = formatDistance(s.distanceKm);
    const price = priceText(s);
    const contact = s.contact;
    const whatsapp = contact?.contactWhatsapp ? whatsappUrl(contact.contactWhatsapp) : null;
    const accent = {
        "--card-salon": s.primaryColor ?? undefined,
        "--card-salon-dark": s.primaryColorDark ?? s.primaryColor ?? undefined,
    } as CSSProperties;

    return (
        <S.Container style={accent}>
            {back}

            <S.Hero>
                <SalonMark name={s.name} logoVariants={s.logoVariants} logoUrl={s.logoUrl} size="lg" decorative />
                <S.HeroText>
                    <S.Name>{s.name}</S.Name>
                    {(place || distance) && (
                        <S.Place>
                            {place}
                            {distance && <S.Distance>{distance}{origin.label ? ` ${origin.label}` : ""}</S.Distance>}
                        </S.Place>
                    )}
                    <S.Facts>
                        {price && <li>{price}</li>}
                        <li>{formatCapacityRange(s.capacity)}</li>
                        <li>{s.venueCount === 1 ? "1 espaço" : `${s.venueCount} espaços`}</li>
                    </S.Facts>
                </S.HeroText>
            </S.Hero>

            {contact && (whatsapp || contact.contactPhone || contact.contactEmail || contact.instagram) && (
                <S.Contacts aria-label="Contatos do salão">
                    {whatsapp && <li><a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
                    {contact.contactPhone && <li><a href={`tel:${contact.contactPhone.replace(/[^\d+]/g, "")}`}>{contact.contactPhone}</a></li>}
                    {contact.contactEmail && <li><a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a></li>}
                    {contact.instagram && <li><a href={instagramUrl(contact.instagram)} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
                </S.Contacts>
            )}

            {!canReserve && (
                <S.ManagerNote>
                    Você está vendo a página como dono ou equipe. Para reservar, entre com uma conta de cliente.
                </S.ManagerNote>
            )}

            {s.bookable === false ? (
                <S.Notice as="section" aria-labelledby="closed-title">
                    <h2 id="closed-title">Este salão ainda não abriu a agenda</h2>
                    <p>Os pacotes e os preços ainda estão sendo cadastrados. Fale com o salão pelos contatos acima ou veja outros salões enquanto isso.</p>
                    <S.SecondaryButton as={Link} to={`/saloes${from}`}>Ver outros salões</S.SecondaryButton>
                </S.Notice>
            ) : (
                <>
                    <S.SectionTitle>Espaços para reservar</S.SectionTitle>
                    <S.Venues>
                        {s.venues.map((venue, i) => {
                            const venueDistance = formatDistance(venue.distanceKm);
                            const venuePrice = formatPrice(venue.startingPrice);
                            const venuePlace = formatPlace(venue.neighborhood, venue.city, venue.state) || venue.location;
                            return (
                                <S.Venue key={venue.id}>
                                    <S.VenueCoverSlot>
                                        <VenueCover
                                            venueName={venue.name}
                                            photo={venue.photos[0]}
                                            sizes="(max-width: 768px) 100vw, 480px"
                                            priority={i === 0}
                                        />
                                    </S.VenueCoverSlot>
                                    <S.VenueBody>
                                        <S.VenueName>{venue.name}</S.VenueName>
                                        {venuePlace && (
                                            <S.VenuePlace>
                                                {venuePlace}
                                                {venueDistance && s.venues.length > 1 && <> ({venueDistance})</>}
                                            </S.VenuePlace>
                                        )}
                                        {venue.description && <S.VenueDescription>{venue.description}</S.VenueDescription>}
                                        <S.Facts>
                                            {venuePrice && <li>a partir de <strong>{venuePrice}</strong></li>}
                                            <li>até {venue.capacity} convidados</li>
                                        </S.Facts>
                                        {(() => {
                                            const list = sortAmenities(venue.amenities ?? [...(venue.hasPool ? ["POOL"] : []), ...(venue.hasKidsArea ? ["KIDS_AREA"] : [])]);
                                            return list.length > 0 && (
                                                <S.Amenities aria-label={`O que ${venue.name} oferece`}>
                                                    {list.map((a) => <li key={a}>{AMENITY_LABELS[a]}</li>)}
                                                </S.Amenities>
                                            );
                                        })()}
                                        <S.VenueActions>
                                            {venue.mapsUrl && (
                                                <S.SecondaryButton as="a" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
                                                    Ver no mapa
                                                </S.SecondaryButton>
                                            )}
                                            {canReserve && (
                                                <S.PrimaryButton type="button" onClick={() => reserve(venue)}>
                                                    Reservar {s.venues.length > 1 ? "este espaço" : "uma data"}
                                                </S.PrimaryButton>
                                            )}
                                        </S.VenueActions>
                                    </S.VenueBody>
                                </S.Venue>
                            );
                        })}
                    </S.Venues>
                </>
            )}
        </S.Container>
    );
}
