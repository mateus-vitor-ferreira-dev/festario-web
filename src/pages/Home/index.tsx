import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { useAuth } from "../../contexts/AuthContext";
import { useSalonOrigin } from "../../hooks/useSalonOrigin";
import { PANEL_PATH, PLATFORM_PATH, SALONS_PATH } from "../../utils/roles";
import { listMyGrants } from "../../services/promotion";
import { listReservationsPaginated } from "../../services/reservation";
import { listSalons } from "../../services/salon";
import { STATUS_MAP } from "../../constants/reservation";
import { isAbortError } from "../../utils/errors";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import SalonCardItem from "../Salons/SalonCardItem";
import { Grid as SalonGrid } from "../Salons/styles";
import type { PromotionGrant, Reservation, SalonCard } from "../../types";
import * as S from "./styles";

/** Quantas reservas olhar: as próximas festas estão entre as mais recentes. */
const RESERVATIONS_LIMIT = 100;
const SUGGESTED_SALONS = 3;

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const formatLongDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const formatDay = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit" });
const formatMonth = (d: string) => new Date(d).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

/** Nome do salão quando acrescenta algo: espaço com o mesmo nome do salão não repete. */
function salonOf(r: Reservation): string | null {
    const salon = r.tenant?.name?.trim();
    return salon && salon.toLowerCase() !== r.venue?.name?.trim().toLowerCase() ? salon : null;
}

/** Onde a pessoa resolve cada festa: pagar a pendente, ou ver as reservas. */
const reservationLink = (r: Reservation) => (r.status === "PENDING" ? `/checkout/${r.id}` : "/reservations");

interface Dashboard {
    reservations: Reservation[];
    grants: PromotionGrant[];
    salons: SalonCard[];
    /** Quando os dados chegaram: separa as festas que ainda vão acontecer. */
    loadedAt: number;
}

/**
 * Início do cliente: as próximas festas em todos os salões, a reserva que espera pagamento, os
 * descontos (cada um com o salão onde vale) e salões para a próxima festa, perto do endereço do perfil
 * quando houver. Cada bloco carrega à parte: um que falhe não esconde os outros.
 *
 * @see GET /reservations
 * @see GET /promotions/my-grants
 * @see GET /salons
 * @component
 */
export default function Home() {
    const { user } = useAuth();
    const role = user?.role;
    const origin = useSalonOrigin();
    const hasOrigin = origin.choice.kind !== "none";
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dashboard, setDashboard] = useState<Dashboard>({ reservations: [], grants: [], salons: [], loadedAt: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        (async () => {
            setIsLoading(true);
            const [reservations, grants, salons] = await Promise.allSettled([
                listReservationsPaginated({ limit: RESERVATIONS_LIMIT }, signal),
                listMyGrants(signal),
                listSalons({ limit: SUGGESTED_SALONS, ...origin.params }, signal),
            ]);
            if (signal.aborted) return;
            if (reservations.status === "rejected" && !isAbortError(reservations.reason)) {
                toast.error("Não foi possível carregar as suas reservas.");
            }
            setDashboard({
                reservations: reservations.status === "fulfilled" ? reservations.value.data : [],
                grants: grants.status === "fulfilled" ? grants.value ?? [] : [],
                salons: salons.status === "fulfilled" ? salons.value.data : [],
                loadedAt: Date.now(),
            });
            setIsLoading(false);
        })();

        return () => controller.abort();
    }, [origin.params]);

    const upcoming = useMemo(() => {
        return dashboard.reservations
            .filter((r) => new Date(r.startDate).getTime() > dashboard.loadedAt && (r.status === "PENDING" || r.status === "PAID"))
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [dashboard.reservations, dashboard.loadedAt]);

    const pending = upcoming.find((r) => r.status === "PENDING");
    const firstName = user?.name?.split(" ")[0] || "Usuário";

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
                    <S.Greeting>{getGreeting()}, {firstName}.</S.Greeting>
                    <S.Subgreeting>
                        {role === "ADMIN"
                            ? "A plataforma e o painel de cada espaço estão nos atalhos ao lado."
                            : role === "OWNER"
                                ? "Reservas, clientes e configurações do seu espaço ficam no painel."
                                : "Suas festas em todos os salões do Festário."}
                    </S.Subgreeting>
                </S.HeaderLeft>

                <S.HeaderActions>
                    {role === "ADMIN" && <S.ShortcutLink as={Link} to={PLATFORM_PATH}>Abrir plataforma</S.ShortcutLink>}
                    {(role === "OWNER" || role === "ADMIN") && <S.ShortcutLink as={Link} to={PANEL_PATH}>Abrir painel do espaço</S.ShortcutLink>}
                    <S.NewReservationButton as={Link} to={SALONS_PATH}>Encontrar um salão</S.NewReservationButton>
                </S.HeaderActions>
            </S.PageHeader>

            {pending && (
                <S.PendingCallout className="anim-panel" aria-labelledby="pending-title">
                    <div>
                        <h2 id="pending-title">Reserva esperando pagamento</h2>
                        <p>
                            {pending.venue?.name ?? "Reserva"}{salonOf(pending) ? `, ${salonOf(pending)}` : ""}, em {formatDate(pending.startDate)}.
                            {" "}Sem o pagamento no prazo do salão, a data volta a ficar livre.
                        </p>
                    </div>
                    <S.NewReservationButton as={Link} to={`/checkout/${pending.id}`}>Ver pagamento</S.NewReservationButton>
                </S.PendingCallout>
            )}

            <S.ContentGrid>
                <S.Panel className="anim-panel">
                    <S.PanelHeader>
                        <S.PanelTitle>Próximas festas</S.PanelTitle>
                        <S.PanelLink as={Link} to="/reservations">Ver todas</S.PanelLink>
                    </S.PanelHeader>

                    {upcoming.length === 0 ? (
                        <S.EmptyState>
                            <span>Nenhuma festa marcada.</span>
                            <S.PanelLink as={Link} to={SALONS_PATH}>Encontrar um salão</S.PanelLink>
                        </S.EmptyState>
                    ) : (
                        <S.List>
                            {upcoming.slice(0, 5).map((r, index) => {
                                const status = STATUS_MAP[r.status as keyof typeof STATUS_MAP] ?? { label: r.status, color: "gray" };
                                const venueName = r.venue?.name || "Reserva";
                                if (index === 0) {
                                    return (
                                        <S.FeaturedItem key={r.id}>
                                            <S.FeaturedDate dateTime={r.startDate}>{formatLongDate(r.startDate)}</S.FeaturedDate>
                                            <S.FeaturedVenue>{venueName}</S.FeaturedVenue>
                                            {salonOf(r) && <S.SalonName>{salonOf(r)}</S.SalonName>}
                                            <S.StatusChip $color={status.color}>{status.label}</S.StatusChip>
                                            <S.PanelLink as={Link} to={reservationLink(r)}>{r.status === "PENDING" ? "Ver pagamento" : "Ver reserva"}</S.PanelLink>
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
                                            <S.ListItemSub>{salonOf(r) ?? formatDate(r.startDate)}</S.ListItemSub>
                                        </S.ListItemMain>
                                        <S.StatusChip $color={status.color}>{status.label}</S.StatusChip>
                                    </S.ListItem>
                                );
                            })}
                        </S.List>
                    )}
                </S.Panel>

                <S.Panel className="anim-panel">
                    <S.PanelHeader>
                        <S.PanelTitle>Seus descontos</S.PanelTitle>
                        <S.PanelLink as={Link} to="/referrals">Indicações</S.PanelLink>
                    </S.PanelHeader>
                    {dashboard.grants.length === 0 ? (
                        <S.EmptyState>
                            <span>Nenhum desconto disponível agora. Indique amigos para ganhar cupons.</span>
                        </S.EmptyState>
                    ) : (
                        <S.List>
                            {dashboard.grants.map((grant) => (
                                <S.ListItem key={grant.id}>
                                    <S.ListItemMain>
                                        <S.ListItemTitle>{grant.campaign?.name}</S.ListItemTitle>
                                        <S.ListItemSub>
                                            {grant.tenant?.name ? `Vale em ${grant.tenant.name}` : "Vale no salão que concedeu"}
                                            {" · "}
                                            {grant.validUntil ? `até ${formatDate(grant.validUntil)}` : "sem data de expiração"}
                                        </S.ListItemSub>
                                    </S.ListItemMain>
                                    <S.DiscountChip>{grant.percentOff}% OFF</S.DiscountChip>
                                </S.ListItem>
                            ))}
                        </S.List>
                    )}
                </S.Panel>
            </S.ContentGrid>

            {dashboard.salons.length > 0 && (
                <S.Suggestions className="anim-panel" aria-labelledby="suggested-title">
                    <S.PanelHeader>
                        <S.PanelTitle id="suggested-title">
                            {hasOrigin ? `Salões perto ${origin.label ?? "de você"}` : "Salões em destaque"}
                        </S.PanelTitle>
                        <S.PanelLink as={Link} to={SALONS_PATH}>Ver todos os salões</S.PanelLink>
                    </S.PanelHeader>
                    <SalonGrid>
                        {dashboard.salons.map((salon) => <SalonCardItem key={salon.slug} salon={salon} from="" />)}
                    </SalonGrid>
                </S.Suggestions>
            )}
        </S.Container>
    );
}
