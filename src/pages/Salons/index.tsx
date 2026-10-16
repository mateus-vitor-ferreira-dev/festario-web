import { useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import { ActiveFilterChips, FilterBar, MultiSelectField, NoResults, Pagination, SelectField, TextField } from "../../components";
import { AMENITY_GROUPS, AMENITY_LABELS, sortAmenities } from "../../constants/amenities";
import { parseMoney } from "../../components/FilterBar";
import { useListParams } from "../../hooks/useListParams";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { useSalonOrigin } from "../../hooks/useSalonOrigin";
import { listSalons } from "../../services/salon";
import { formatPrice } from "../../utils/salonFormat";
import OriginBar from "./OriginBar";
import SalonCardItem from "./SalonCardItem";
import * as S from "./styles";

export const SALONS_PAGE_SIZE = 12;

const SALON_KEYS = ["q", "city", "minCapacity", "maxPrice", "amenities", "sort"] as const;
type SalonKey = (typeof SALON_KEYS)[number];

const onlyDigits = (v: string) => v.replace(/\D/g, "").replace(/^0+/, "");

/**
 * Vitrine do Festário: os salões da plataforma, com os mais perto primeiro quando há uma origem
 * (perfil, navegador ou CEP). Filtros, ordem e página ficam na URL; a origem fica na sessão.
 * A distância só ordena: nenhum salão some por estar longe.
 *
 * @see GET /salons
 */
export default function Salons() {
    const location = useLocation();
    const listTopRef = useRef<HTMLDivElement | null>(null);
    const origin = useSalonOrigin();
    const hasOrigin = origin.choice.kind !== "none";

    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<SalonKey>(SALON_KEYS, { nonFilterKeys: ["sort"] });
    const params = useMemo(
        () => ({ ...values, ...origin.params, page, limit: SALONS_PAGE_SIZE }),
        [values, origin.params, page],
    );
    const { data: salons, meta, isLoading, isFetching } = usePaginatedQuery(listSalons, params, {
        errorMessage: "Não foi possível carregar os salões.",
        onPageOutOfRange: setPage,
    });

    // Comodidades na URL como lista: amenities=POOL,BUFFET.
    const amenities = sortAmenities(values.amenities ? values.amenities.split(",") : []);
    const setAmenities = (next: string[]) => setFilter("amenities", sortAmenities(next).join(","));

    const chipLabel: Record<Exclude<SalonKey, "sort" | "amenities">, () => string> = {
        q: () => `Busca: ${values.q}`,
        city: () => `Cidade: ${values.city}`,
        minCapacity: () => `Para ${values.minCapacity}+ convidados`,
        maxPrice: () => `Até ${formatPrice(Number(values.maxPrice))}`,
    };
    // Cada comodidade é um chip próprio: dá para tirar uma sem perder as outras.
    const chips = activeKeys.flatMap((key) => key === "amenities"
        ? amenities.map((a) => ({ key: `amenities:${a}`, label: AMENITY_LABELS[a] }))
        : [{ key, label: chipLabel[key as Exclude<SalonKey, "sort" | "amenities">]() }]);
    function removeChip(key: string) {
        if (key.startsWith("amenities:")) setAmenities(amenities.filter((a) => `amenities:${a}` !== key));
        else setFilter(key as SalonKey, "");
    }

    // Sem origem, "mais perto" não tem como ordenar; a ordem padrão vira a dos mais procurados.
    const sortOptions = hasOrigin
        ? [
            { value: "", label: "Mais perto" },
            { value: "price", label: "Menor preço" },
            { value: "name", label: "Nome (A a Z)" },
            { value: "relevance", label: "Mais procurados" },
        ]
        : [
            { value: "", label: "Mais procurados" },
            { value: "price", label: "Menor preço" },
            { value: "name", label: "Nome (A a Z)" },
        ];
    const sortValue = !hasOrigin && values.sort === "distance" ? "" : values.sort;
    const total = meta?.total ?? salons.length;
    const isEmptyPlatform = !isLoading && salons.length === 0 && activeKeys.length === 0 && page === 1;

    return (
        <S.Container>
            <S.PageHeader>
                <S.Title>Salões de festa</S.Title>
                <S.Lead>Compare os salões, veja os espaços e reserve a data com a mesma conta.</S.Lead>
            </S.PageHeader>

            <OriginBar origin={origin} />

            <S.FiltersSlot ref={listTopRef} tabIndex={-1}>
                <FilterBar
                    label="Filtrar salões"
                    activeCount={activeKeys.length}
                    footer={<ActiveFilterChips chips={chips} onRemove={removeChip} onClearAll={clearFilters} />}
                >
                    <TextField label="Nome do salão" placeholder="Ex.: Jardim" value={values.q} onChange={(v) => setFilter("q", v)} />
                    <TextField label="Cidade" placeholder="Ex.: Lavras" type="text" value={values.city} onChange={(v) => setFilter("city", v)} />
                    <TextField
                        label="Convidados"
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
                    <SelectField label="Ordenar por" value={sortValue} onChange={(v) => setFilter("sort", v)} options={sortOptions} />
                    <MultiSelectField label="Comodidades" value={amenities} onChange={setAmenities} groups={AMENITY_GROUPS} wide />
                </FilterBar>
            </S.FiltersSlot>

            {isLoading ? (
                <S.Status role="status">Carregando salões...</S.Status>
            ) : isEmptyPlatform ? (
                <S.Status role="status">Ainda não há salões abertos para reserva.</S.Status>
            ) : salons.length === 0 ? (
                <NoResults
                    title="Nenhum salão com esses filtros"
                    description="Tente outra cidade, menos convidados, um preço máximo maior ou menos comodidades."
                    onClear={clearFilters}
                />
            ) : (
                <>
                    <S.Count aria-live="polite">{total} {total === 1 ? "salão" : "salões"}</S.Count>
                    <S.Grid aria-busy={isFetching} $busy={isFetching}>
                        {salons.map((salon, i) => (
                            <SalonCardItem key={salon.slug} salon={salon} from={location.search} priority={i === 0} />
                        ))}
                    </S.Grid>
                </>
            )}

            {meta && salons.length > 0 && (
                <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    limit={meta.limit}
                    count={salons.length}
                    hasNext={meta.hasNext}
                    onChange={setPage}
                    scrollTargetRef={listTopRef}
                    disabled={isFetching}
                    label="Paginação dos salões"
                />
            )}
        </S.Container>
    );
}
