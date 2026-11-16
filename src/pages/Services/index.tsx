import { useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import { ActiveFilterChips, DateField, FilterBar, NoResults, Pagination, SelectField, TextField } from "../../components";
import { parseMoney } from "../../components/FilterBar";
import CategoryBunting from "../../components/Marketplace/CategoryBunting";
import ProviderCardItem from "../../components/Marketplace/ProviderCardItem";
import { CATEGORY_LABELS } from "../../constants/providers";
import { useAuth } from "../../contexts/AuthContext";
import { useListParams } from "../../hooks/useListParams";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { useSalonOrigin } from "../../hooks/useSalonOrigin";
import { listProviders } from "../../services/provider";
import type { ProviderCategory } from "../../types";
import { formatEventDate } from "../../utils/providerFormat";
import { isManagerRole } from "../../utils/roles";
import { formatPrice } from "../../utils/salonFormat";
import OriginBar from "../Salons/OriginBar";
import * as SS from "../Salons/styles";
import * as S from "./styles";

export const SERVICES_PAGE_SIZE = 12;

const KEYS = ["category", "q", "city", "date", "maxPrice", "sort"] as const;
type Key = (typeof KEYS)[number];

const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Vitrine de serviços de festa: buffet, decoração, maquiagem e o resto, com as categorias em
 * bandeirinhas. Com a data da festa, some quem não atende no dia; com a localização, só aparece quem
 * atende ali. Filtros e página ficam na URL; a localização é a mesma da vitrine de salões.
 *
 * @see GET /providers
 */
export default function Services() {
    const location = useLocation();
    const listTopRef = useRef<HTMLDivElement | null>(null);
    const origin = useSalonOrigin();
    const hasOrigin = origin.choice.kind !== "none";
    const { user, isAuthenticated } = useAuth();

    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<Key>(KEYS, { nonFilterKeys: ["sort"] });
    const params = useMemo(() => ({ ...values, ...origin.params, page, limit: SERVICES_PAGE_SIZE }), [values, origin.params, page]);
    const { data: providers, meta, isLoading, isFetching } = usePaginatedQuery(listProviders, params, {
        errorMessage: "Não foi possível carregar os serviços.",
        onPageOutOfRange: setPage,
    });

    const category = (values.category || "") as ProviderCategory | "";
    const chipLabel: Record<Exclude<Key, "sort">, () => string> = {
        category: () => CATEGORY_LABELS[category as ProviderCategory] ?? values.category,
        q: () => `Busca: ${values.q}`,
        city: () => `Cidade: ${values.city}`,
        date: () => `Livre em ${formatEventDate(values.date, { weekday: false })}`,
        maxPrice: () => `Até ${formatPrice(Number(values.maxPrice))}`,
    };
    const chips = activeKeys.map((key) => ({ key, label: chipLabel[key as Exclude<Key, "sort">]() }));

    const sortOptions = hasOrigin
        ? [{ value: "", label: "Mais perto" }, { value: "price", label: "Menor preço" }, { value: "name", label: "Nome (A a Z)" }, { value: "relevance", label: "Mais procurados" }]
        : [{ value: "", label: "Mais procurados" }, { value: "price", label: "Menor preço" }, { value: "name", label: "Nome (A a Z)" }];
    const sortValue = !hasOrigin && values.sort === "distance" ? "" : values.sort;

    const total = meta?.total ?? providers.length;
    const isEmptyPlatform = !isLoading && providers.length === 0 && activeKeys.length === 0 && page === 1 && !hasOrigin;
    // A data escolhida vai junto para o pedido de orçamento já sair com ela.
    const quoteSearch = values.date ? `?data=${values.date}` : "";
    const canOffer = !isAuthenticated || !isManagerRole(user?.role);

    return (
        <SS.Container>
            <SS.PageHeader>
                <SS.Title>Serviços para a festa</SS.Title>
                <SS.Lead>Buffet, decoração, maquiagem, doces e o que mais a festa pedir. Escolha a data e peça o orçamento aqui mesmo.</SS.Lead>
            </SS.PageHeader>

            <CategoryBunting value={category} onChange={(c) => setFilter("category", c)} />

            <OriginBar
                origin={origin}
                copy={{
                    title: "Veja quem atende onde vai ser a festa",
                    hint: "Use a sua localização ou digite o CEP do local. Sem isso, a lista mostra todos.",
                    activeHint: "Só aparece quem atende essa região, o mais perto primeiro.",
                }}
            />

            <SS.FiltersSlot ref={listTopRef} tabIndex={-1}>
                <FilterBar
                    label="Filtrar serviços"
                    activeCount={activeKeys.filter((k) => k !== "category").length}
                    footer={<ActiveFilterChips chips={chips} onRemove={(k) => setFilter(k as Key, "")} onClearAll={clearFilters} />}
                >
                    <DateField label="Data da festa" value={values.date} minDate={todayKey()} onChange={(v) => setFilter("date", v)} />
                    <TextField label="Nome" placeholder="Ex.: Doces da Ana" value={values.q} onChange={(v) => setFilter("q", v)} />
                    <TextField label="Cidade" placeholder="Ex.: Lavras" type="text" value={values.city} onChange={(v) => setFilter("city", v)} />
                    <TextField
                        label="Preço máximo (R$)"
                        placeholder="Ex.: 800"
                        type="text"
                        inputMode="decimal"
                        value={values.maxPrice}
                        onChange={(v) => setFilter("maxPrice", parseMoney(v))}
                        debounceMs={500}
                    />
                    <SelectField label="Ordenar por" value={sortValue} onChange={(v) => setFilter("sort", v)} options={sortOptions} />
                </FilterBar>
            </SS.FiltersSlot>

            {isLoading ? (
                <SS.Status role="status">Carregando serviços...</SS.Status>
            ) : isEmptyPlatform ? (
                <S.Empty>
                    <h2>Os primeiros prestadores estão chegando</h2>
                    <p>Ainda não há serviços publicados. Se você trabalha com festas, crie o seu perfil e apareça aqui para quem está organizando a festa.</p>
                    {canOffer && <S.OfferLink to={isAuthenticated ? "/meu-negocio" : "/cadastro"}>Oferecer meus serviços</S.OfferLink>}
                </S.Empty>
            ) : providers.length === 0 ? (
                <NoResults
                    title="Nenhum serviço com esses filtros"
                    description={hasOrigin
                        ? "Ninguém dessa categoria atende onde você está nessa data. Tente outra data, outra categoria ou tire a localização."
                        : "Tente outra data, outra categoria ou um preço máximo maior."}
                    onClear={clearFilters}
                />
            ) : (
                <>
                    <SS.Count aria-live="polite">{total} {total === 1 ? "serviço" : "serviços"}</SS.Count>
                    <SS.Grid aria-busy={isFetching} $busy={isFetching}>
                        {providers.map((p, i) => (
                            <SS.CardItem key={p.slug}>
                                <ProviderCardItem provider={p} from={location.search} quoteSearch={quoteSearch} priority={i === 0} />
                            </SS.CardItem>
                        ))}
                    </SS.Grid>
                </>
            )}

            {meta && providers.length > 0 && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    count={providers.length}
                    hasNext={meta.hasNext}
                    onChange={setPage}
                    scrollTargetRef={listTopRef}
                    disabled={isFetching}
                    label="Paginação dos serviços"
                />
            )}

            {canOffer && !isEmptyPlatform && (
                <S.OfferBand>
                    <p>Trabalha com festas? Mostre o seu trabalho para quem está organizando uma.</p>
                    <S.OfferLink as={Link} to={isAuthenticated ? "/meu-negocio" : "/cadastro"}>Oferecer meus serviços</S.OfferLink>
                </S.OfferBand>
            )}
        </SS.Container>
    );
}
