import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import api from "../../services/api";
import { listMyGrants } from "../../services/promotion";
import { listReservations } from "../../services/reservation";
import { listVenues } from "../../services/venue";
import { STATUS_MAP } from "../../constants/reservation";
import { isAbortError } from "../../utils/errors";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import type { Venue, Reservation, PromotionGrant, User } from "../../types";
import * as S from "./styles";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatLongDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

function formatDay(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit" });
}

function formatMonth(dateStr: string) {
    return new Date(dateStr)
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "");
}

function formatCurrency(value: number | string) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

interface Dashboard {
    user: User | null;
    venues: Venue[];
    reservations: Reservation[];
    grants: PromotionGrant[];
}

/**
 * Dashboard inicial do usuário autenticado.
 *
 * Carrega em paralelo: perfil do usuário, lista de espaços, reservas recentes e
 * grants de desconto disponíveis. Usa `Promise.allSettled` para exibir dados parciais
 * mesmo que uma requisição falhe.
 *
 * @see GET /users/me
 * @see GET /venues
 * @see GET /reservations
 * @see GET /promotions/my-grants
 * @component
 */
export default function Home() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dashboard, setDashboard] = useState<Dashboard>({
        user: null,
        venues: [],
        reservations: [],
        grants: [],
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function loadDashboard() {
            try {
                setIsLoading(true);

                const [userResult, venuesResult, reservationsResult, grantsResult] = await Promise.allSettled([
                    api.get("/users/me", { signal }),
                    listVenues(signal),
                    listReservations(signal),
                    listMyGrants(signal),
                ]);

                if (signal.aborted) return;

                const anyFailed = [userResult, venuesResult, reservationsResult].some(
                    (r) => r.status === "rejected" && !isAbortError(r.reason)
                );
                if (anyFailed) {
                    toast.error("Erro ao carregar os dados da Home.");
                }

                setDashboard({
                    user: userResult.status === "fulfilled" ? userResult.value.data.data : null,
                    venues: venuesResult.status === "fulfilled" ? venuesResult.value : [],
                    reservations: reservationsResult.status === "fulfilled" ? reservationsResult.value : [],
                    grants: grantsResult.status === "fulfilled" ? grantsResult.value || [] : [],
                });
            } catch (error) {
                if (!isAbortError(error)) {
                    toast.error("Erro ao carregar os dados da Home.");
                }
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }

        loadDashboard();

        return () => controller.abort();
    }, []);

    const upcomingReservations = useMemo(() => {
        return dashboard.reservations
            .filter((r) => new Date(r.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [dashboard.reservations]);

    const userName = dashboard.user?.name?.split(" ")[0] || "Usuário";

    useGSAP(() => {
        if (isLoading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-header"));
        animateStagger(el.querySelectorAll(".anim-panel"), { delay: 0.1 });
    }, { scope: containerRef, dependencies: [isLoading] });

    if (isLoading) {
        return (
            <S.Container>
                <S.LoadingState>
                    <S.Spinner />
                    <p>Carregando seu painel...</p>
                </S.LoadingState>
            </S.Container>
        );
    }

    return (
        <S.Container ref={containerRef}>
            <S.PageHeader className="anim-header">
                <S.HeaderLeft>
                    <S.Greeting>
                        {getGreeting()}, {userName}.
                    </S.Greeting>
                    <S.Subgreeting>
                        Seus eventos e os espaços disponíveis no Recanto Vila Rica.
                    </S.Subgreeting>
                </S.HeaderLeft>

                <S.NewReservationButton as={Link} to="/venues">
                    Nova reserva
                </S.NewReservationButton>
            </S.PageHeader>

            <S.Facts>
                <S.Fact>
                    <S.FactLabel>Total de reservas</S.FactLabel>
                    <S.FactValue>{dashboard.reservations.length}</S.FactValue>
                </S.Fact>
                <S.Fact>
                    <S.FactLabel>Eventos marcados</S.FactLabel>
                    <S.FactValue>{upcomingReservations.length}</S.FactValue>
                </S.Fact>
                <S.Fact>
                    <S.FactLabel>Espaços para reservar</S.FactLabel>
                    <S.FactValue>{dashboard.venues.length}</S.FactValue>
                </S.Fact>
            </S.Facts>

            <S.ContentGrid>
                <S.Panel className="anim-panel">
                    <S.PanelHeader>
                        <S.PanelTitle>Próximas reservas</S.PanelTitle>
                        <S.PanelLink as={Link} to="/reservations">
                            Ver todas
                        </S.PanelLink>
                    </S.PanelHeader>

                    {upcomingReservations.length === 0 ? (
                        <S.EmptyState>
                            <span>Nenhuma reserva futura encontrada.</span>
                            <S.PanelLink as={Link} to="/venues">
                                Ver datas livres
                            </S.PanelLink>
                        </S.EmptyState>
                    ) : (
                        <S.List>
                            {upcomingReservations.slice(0, 5).map((r, index) => {
                                const status = STATUS_MAP[r.status] ?? { label: r.status, color: "gray" };
                                const venueName = r.venue?.name || "Reserva";

                                if (index === 0) {
                                    return (
                                        <S.FeaturedItem key={r.id}>
                                            <S.FeaturedDate dateTime={r.startDate}>
                                                {formatLongDate(r.startDate)}
                                            </S.FeaturedDate>
                                            <S.FeaturedVenue>{venueName}</S.FeaturedVenue>
                                            <S.StatusChip $color={status.color}>
                                                {status.label}
                                            </S.StatusChip>
                                        </S.FeaturedItem>
                                    );
                                }

                                return (
                                    <S.ListItem key={r.id}>
                                        <S.DateBlock dateTime={r.startDate} aria-label={formatDate(r.startDate)}>
                                            <strong>{formatDay(r.startDate)}</strong>
                                            <span>{formatMonth(r.startDate)}</span>
                                        </S.DateBlock>
                                        <S.ListItemMain>
                                            <S.ListItemTitle>{venueName}</S.ListItemTitle>
                                            <S.ListItemSub>
                                                {formatDate(r.startDate)}
                                            </S.ListItemSub>
                                        </S.ListItemMain>
                                        <S.StatusChip $color={status.color}>
                                            {status.label}
                                        </S.StatusChip>
                                    </S.ListItem>
                                );
                            })}
                        </S.List>
                    )}
                </S.Panel>

                <S.Panel className="anim-panel">
                    <S.PanelHeader>
                        <S.PanelTitle>Espaços</S.PanelTitle>
                        <S.PanelLink as={Link} to="/venues">
                            Ver todos
                        </S.PanelLink>
                    </S.PanelHeader>

                    {dashboard.venues.length === 0 ? (
                        <S.EmptyState>
                            <span>Nenhum espaço encontrado.</span>
                        </S.EmptyState>
                    ) : (
                        <S.VenueList>
                            {dashboard.venues.slice(0, 3).map((v) => (
                                <S.VenueCard key={v.id}>
                                    <S.VenueCardTop>
                                        <S.VenueCardName>{v.name}</S.VenueCardName>
                                        {v.basePrice != null && (
                                            <S.PriceChip>
                                                A partir de {formatCurrency(v.basePrice)}
                                            </S.PriceChip>
                                        )}
                                    </S.VenueCardTop>
                                    <S.VenueCardLocation>
                                        {v.location || "Localização não informada"}
                                    </S.VenueCardLocation>
                                    <S.VenueCardBottom>
                                        <S.VenueAmenities>
                                            {v.capacity && (
                                                <S.AmenityChip>{v.capacity} pessoas</S.AmenityChip>
                                            )}
                                            {v.hasPool && (
                                                <S.AmenityChip>Piscina</S.AmenityChip>
                                            )}
                                            {v.hasKidsArea && (
                                                <S.AmenityChip>Área Kids</S.AmenityChip>
                                            )}
                                        </S.VenueAmenities>
                                        <S.VenueReserveBtn
                                            type="button"
                                            onClick={() => navigate(`/reservation-intent/${v.id}`)}
                                        >
                                            Reservar
                                        </S.VenueReserveBtn>
                                    </S.VenueCardBottom>
                                </S.VenueCard>
                            ))}
                        </S.VenueList>
                    )}
                </S.Panel>
            </S.ContentGrid>

            {dashboard.grants.length > 0 && (
                <S.Panel className="anim-panel">
                    <S.PanelHeader>
                        <S.PanelTitle>Seus descontos disponíveis</S.PanelTitle>
                        <S.PanelLink as={Link} to="/referrals">
                            Ver indicações
                        </S.PanelLink>
                    </S.PanelHeader>

                    <S.List>
                        {dashboard.grants.map((grant) => (
                            <S.ListItem key={grant.id}>
                                <S.ListItemMain>
                                    <S.ListItemTitle>{grant.campaign?.name}</S.ListItemTitle>
                                    <S.ListItemSub>
                                        {grant.validUntil
                                            ? `Válido até ${formatDate(grant.validUntil)}`
                                            : "Sem data de expiração"}
                                    </S.ListItemSub>
                                </S.ListItemMain>
                                <S.DiscountChip>{grant.percentOff}% OFF</S.DiscountChip>
                            </S.ListItem>
                        ))}
                    </S.List>
                </S.Panel>
            )}
        </S.Container>
    );
}
