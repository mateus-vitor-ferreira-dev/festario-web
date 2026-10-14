import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActiveFilterChips, FilterBar, NoResults, Pagination, SelectField, TextField } from "../../components";
import { useListParams } from "../../hooks/useListParams";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { listTenantsPage } from "../../services/platform";
import { formatCurrency } from "../Admin/tabs/constants";
import * as A from "../Admin/styles";
import { CreateTenantModal, ToggleActiveModal } from "./components";
import { PLAN_LABELS, TENANT_STATUS_OPTIONS, TENANTS_PAGE_SIZE } from "./constants";
import type { Tenant } from "../../types";
import * as S from "./styles";

const FILTER_KEYS = ["q", "status"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const STATUS_TO_PARAM: Record<string, string> = { active: "true", inactive: "false" };

function count(n: number | undefined) {
    return (n ?? 0).toLocaleString("pt-BR");
}

/**
 * Área da plataforma (`/plataforma`, só ADMIN): lista de estabelecimentos com as
 * contagens, cadastro e ativação. O detalhe de cada um (convites do dono) fica em
 * `/plataforma/espacos/:slug`.
 *
 * @see GET /platform/tenants
 */
export default function Platform() {
    const navigate = useNavigate();
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<FilterKey>(FILTER_KEYS);
    const [showCreate, setShowCreate] = useState(false);
    const [toggling, setToggling] = useState<Tenant | null>(null);

    const params = useMemo(
        () => ({ q: values.q, isActive: STATUS_TO_PARAM[values.status] ?? "", page, limit: TENANTS_PAGE_SIZE }),
        [values, page],
    );
    const { data: tenants, meta, isLoading, isFetching, refresh } = usePaginatedQuery(listTenantsPage, params, {
        errorMessage: "Erro ao carregar os estabelecimentos.",
        onPageOutOfRange: setPage,
    });

    const chips = activeKeys.map((key) => ({
        key,
        label: key === "q"
            ? `Busca: ${values.q}`
            : `Situação: ${TENANT_STATUS_OPTIONS.find((o) => o.value === values.status)?.label ?? values.status}`,
    }));

    return (
        <A.Container>
            <S.HeaderRow>
                <A.PageHeader>
                    <A.Title>Plataforma</A.Title>
                    <A.Description>Cadastre estabelecimentos, convide os donos e acompanhe os números de cada um.</A.Description>
                </A.PageHeader>
                <A.PrimaryButton type="button" onClick={() => setShowCreate(true)}>+ Novo estabelecimento</A.PrimaryButton>
            </S.HeaderRow>

            <A.Section>
                <A.ScrollAnchor ref={topRef} tabIndex={-1}>
                    <A.SectionHeader>
                        <A.SectionTitle>Estabelecimentos</A.SectionTitle>
                        {meta?.total !== undefined && (
                            <A.ResultCount aria-live="polite">
                                {count(meta.total)} estabelecimento{meta.total === 1 ? "" : "s"}
                            </A.ResultCount>
                        )}
                    </A.SectionHeader>
                </A.ScrollAnchor>

                <FilterBar
                    label="Filtrar estabelecimentos"
                    activeCount={activeKeys.length}
                    footer={<ActiveFilterChips chips={chips} onRemove={(k) => setFilter(k as FilterKey, "")} onClearAll={clearFilters} />}
                >
                    <TextField
                        label="Buscar"
                        placeholder="Nome ou endereço (slug)"
                        value={values.q}
                        onChange={(v) => setFilter("q", v)}
                        wide
                    />
                    <SelectField label="Situação" value={values.status} onChange={(v) => setFilter("status", v)} options={TENANT_STATUS_OPTIONS} />
                </FilterBar>

                {isLoading ? (
                    <A.LoadingSpinner role="status" aria-label="Carregando estabelecimentos" />
                ) : tenants.length === 0 ? (
                    activeKeys.length > 0 ? (
                        <NoResults title="Nenhum estabelecimento com esses filtros" onClear={clearFilters} />
                    ) : (
                        <A.EmptyState>
                            <h3>Nenhum estabelecimento cadastrado</h3>
                            <p>Use “+ Novo estabelecimento” para cadastrar o primeiro e depois convide o dono.</p>
                        </A.EmptyState>
                    )
                ) : (
                    <A.ListRegion $busy={isFetching} aria-busy={isFetching}>
                        <A.TableWrapper>
                            <A.Table>
                                <thead>
                                    <tr>
                                        <A.Th>Estabelecimento</A.Th>
                                        <A.Th>Plano</A.Th>
                                        <A.Th>Situação</A.Th>
                                        <A.Th $num>Espaços</A.Th>
                                        <A.Th $num>Donos</A.Th>
                                        <A.Th $num>Reservas</A.Th>
                                        <A.Th $num>Convites pendentes</A.Th>
                                        <A.Th $num>Receita paga</A.Th>
                                        <A.Th><A.VisuallyHidden>Ações</A.VisuallyHidden></A.Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((t) => (
                                        <A.Tr key={t.id}>
                                            <A.Td>
                                                <S.NameCell>
                                                    <Link to={`/plataforma/espacos/${t.slug}`}>{t.name}</Link>
                                                    <span>{t.slug}</span>
                                                </S.NameCell>
                                            </A.Td>
                                            <A.Td>{PLAN_LABELS[t.plan] ?? t.plan}</A.Td>
                                            <A.Td>
                                                <A.ActiveBadge $active={t.isActive}>{t.isActive ? "Ativo" : "Desativado"}</A.ActiveBadge>
                                            </A.Td>
                                            <A.Td $num>{count(t.stats?.venues)}</A.Td>
                                            <A.Td $num>{count(t.stats?.owners)}</A.Td>
                                            <A.Td $num>{count(t.stats?.reservations)}</A.Td>
                                            <A.Td $num>{count(t.stats?.pendingInvites)}</A.Td>
                                            <A.Td $num>{formatCurrency(t.stats?.paidRevenue ?? 0)}</A.Td>
                                            <A.Td>
                                                <S.RowActions>
                                                    <A.SecondaryButton
                                                        type="button"
                                                        $size="sm"
                                                        onClick={() => navigate(`/plataforma/espacos/${t.slug}`)}
                                                        aria-label={`Convites e detalhes de ${t.name}`}
                                                    >
                                                        Detalhes
                                                    </A.SecondaryButton>
                                                    {t.isActive ? (
                                                        <A.DangerButton type="button" $size="sm" onClick={() => setToggling(t)} aria-label={`Desativar ${t.name}`}>
                                                            Desativar
                                                        </A.DangerButton>
                                                    ) : (
                                                        <A.SecondaryButton type="button" $size="sm" onClick={() => setToggling(t)} aria-label={`Reativar ${t.name}`}>
                                                            Reativar
                                                        </A.SecondaryButton>
                                                    )}
                                                </S.RowActions>
                                            </A.Td>
                                        </A.Tr>
                                    ))}
                                </tbody>
                            </A.Table>
                        </A.TableWrapper>

                        {meta && (
                            <Pagination
                                page={meta.page}
                                totalPages={meta.totalPages}
                                total={meta.total}
                                limit={meta.limit}
                                count={tenants.length}
                                hasNext={meta.hasNext}
                                onChange={setPage}
                                scrollTargetRef={topRef}
                                disabled={isFetching}
                                label="Paginação dos estabelecimentos"
                            />
                        )}
                    </A.ListRegion>
                )}
            </A.Section>

            {showCreate && (
                <CreateTenantModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(tenant) => {
                        setShowCreate(false);
                        navigate(`/plataforma/espacos/${tenant.slug}`);
                    }}
                />
            )}

            {toggling && (
                <ToggleActiveModal
                    tenant={toggling}
                    onClose={() => setToggling(null)}
                    onDone={() => {
                        setToggling(null);
                        refresh();
                    }}
                />
            )}
        </A.Container>
    );
}
