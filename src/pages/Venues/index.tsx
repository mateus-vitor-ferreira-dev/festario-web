import { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";

import { listVenuesPage } from "../../services/venue";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { useListParams } from "../../hooks/useListParams";
import { ActiveFilterChips, FilterBar, NoResults, Pagination, TextField } from "../../components";
import { parseMoney } from "../../components/FilterBar";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página de listagem dos espaços disponíveis para reserva.
 *
 * Carrega os venues via `listVenuesPage` (filtros `minCapacity` e `maxPrice`
 * na URL, ex.: `/venues?minCapacity=80`) e exibe cards com informações de
 * capacidade e amenidades. Clicar em um card navega para `/reservation-intent/:venueId`.
 *
 * @see GET /venues
 * @component
 */
export const VENUES_PAGE_SIZE = 12;

/** `city` está reservado no contrato da API para um filtro futuro de endereço/cidade. */
const VENUE_FILTER_KEYS = ["minCapacity", "maxPrice"] as const;
type VenueFilterKey = (typeof VENUE_FILTER_KEYS)[number];

const onlyDigits = (v: string) => v.replace(/\D/g, "").replace(/^0+/, "");

export default function Venues() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const listTopRef = useRef<HTMLDivElement | null>(null);

    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<VenueFilterKey>(VENUE_FILTER_KEYS);
    const params = useMemo(() => ({ ...values, page, limit: VENUES_PAGE_SIZE }), [values, page]);
    const { data: venues, meta, isLoading, isFetching } = usePaginatedQuery(listVenuesPage, params, {
        errorMessage: "Erro ao carregar os espaços.",
        onPageOutOfRange: setPage,
    });
    const hasFilters = activeKeys.length > 0;

    const chips = activeKeys.map((key) => ({
        key,
        label: key === "minCapacity"
            ? `Para ${values.minCapacity}+ pessoas`
            : `Até ${Number(values.maxPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    }));

    useGSAP(() => {
        if (isLoading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [isLoading] });

    if (isLoading) {
        return (
            <S.Container>
                <S.Header>
                    <S.HeaderContent>
                        <S.Title>Espaços disponíveis</S.Title>
                        <S.Description>
                            Carregando os ambientes disponíveis para reserva.
                        </S.Description>
                    </S.HeaderContent>
                </S.Header>

                <S.LoadingCard>
                    <h2>Carregando espaços...</h2>
                    <p>Estamos buscando os ambientes disponíveis.</p>
                </S.LoadingCard>
            </S.Container>
        );
    }

    if (!venues.length && !hasFilters && page === 1) {
        return (
            <S.Container>
                <S.Header>
                    <S.HeaderContent>
                        <S.Title>Espaços disponíveis</S.Title>
                        <S.Description>
                            Consulte os ambientes cadastrados para eventos e reservas.
                        </S.Description>
                    </S.HeaderContent>
                </S.Header>

                <S.EmptyState>
                    <h2>Nenhum espaço encontrado</h2>
                    <p>Ainda não há espaços abertos para reserva. Fale com a gente para combinar seu evento.</p>
                    <S.EmptyLink as={Link} to="/contate-nos">Entrar em contato</S.EmptyLink>
                </S.EmptyState>
            </S.Container>
        );
    }

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.HeaderContent>
                    <S.Title>Espaços disponíveis</S.Title>
                    <S.Description>
                        Consulte os ambientes cadastrados para eventos e reservas.
                    </S.Description>
                </S.HeaderContent>

                <S.Counter aria-live="polite">
                    {meta?.total ?? venues.length} espaço{(meta?.total ?? venues.length) === 1 ? "" : "s"}
                </S.Counter>
            </S.Header>

            <S.FiltersSlot ref={listTopRef} tabIndex={-1}>
                <FilterBar
                    label="Filtrar espaços"
                    activeCount={activeKeys.length}
                    footer={<ActiveFilterChips chips={chips} onRemove={(k) => setFilter(k as VenueFilterKey, "")} onClearAll={clearFilters} />}
                >
                    <TextField
                        label="Número de convidados"
                        placeholder="Ex.: 80"
                        type="text"
                        inputMode="numeric"
                        value={values.minCapacity}
                        onChange={(v) => setFilter("minCapacity", onlyDigits(v))}
                    />
                    <TextField
                        label="Preço máximo (R$)"
                        placeholder="Ex.: 1.500"
                        type="text"
                        inputMode="decimal"
                        value={values.maxPrice}
                        onChange={(v) => setFilter("maxPrice", parseMoney(v))}
                        debounceMs={500}
                    />
                </FilterBar>
            </S.FiltersSlot>

            {venues.length === 0 && (
                <NoResults
                    title="Nenhum espaço com esses filtros"
                    description="Tente menos convidados ou um preço máximo maior."
                    onClear={clearFilters}
                />
            )}

            <S.Grid aria-busy={isFetching} $busy={isFetching}>
                {venues.map((venue) => (
                    <S.Card className="anim-card" key={venue.id}>
                        <S.CardContent>
                            <S.CardHeader>
                                <S.CardTitle>{venue.name}</S.CardTitle>

                                {venue.startingPrice != null && (
                                    <S.PlansTag>
                                        <span>A partir de</span>
                                        <strong>
                                            {Number(venue.startingPrice).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                                maximumFractionDigits: 0,
                                            })}
                                        </strong>
                                    </S.PlansTag>
                                )}
                            </S.CardHeader>

                            <S.CardDescription>
                                {venue.description || "Sem descrição cadastrada para este espaço."}
                            </S.CardDescription>

                            <S.InfoList>
                                <li>
                                    <strong>Capacidade</strong>
                                    {venue.capacity ? `${venue.capacity} pessoas` : "Não informada"}
                                </li>

                                <li>
                                    <strong>Localização</strong>
                                    {venue.location || "Não informada"}
                                </li>

                            </S.InfoList>

                            <S.Amenities aria-label="Comodidades">
                                <S.Amenity $available={Boolean(venue.hasKidsArea)}>
                                    <strong>Área Kids</strong>
                                    {venue.hasKidsArea ? "Disponível" : "Não disponível"}
                                </S.Amenity>

                                <S.Amenity $available={Boolean(venue.hasPool)}>
                                    <strong>Piscina</strong>
                                    {venue.hasPool ? "Disponível" : "Não disponível"}
                                </S.Amenity>
                            </S.Amenities>
                        </S.CardContent>

                        <S.Actions>
                            {venue.mapsUrl ? (
                                <S.ActionLink
                                    href={venue.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Rotas
                                </S.ActionLink>
                            ) : (
                                <S.ActionButton type="button" disabled>
                                    Rotas
                                </S.ActionButton>
                            )}

                            <S.PrimaryButton
                                type="button"
                                onClick={() => navigate(`/reservation-intent/${venue.id}`)}
                            >
                                Reservar
                            </S.PrimaryButton>
                        </S.Actions>
                    </S.Card>
                ))}
            </S.Grid>

            {meta && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    count={venues.length}
                    hasNext={meta.hasNext}
                    onChange={setPage}
                    scrollTargetRef={listTopRef}
                    disabled={isFetching}
                    label="Paginação dos espaços"
                />
            )}
        </S.Container>
    );
}
