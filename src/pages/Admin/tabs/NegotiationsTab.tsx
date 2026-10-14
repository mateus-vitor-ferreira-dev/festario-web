import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listNegotiationsPage } from "../../../services/negotiation";
import { ActiveFilterChips, FilterBar, NoResults, Pagination, SelectField, TextField } from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { formatDate, NEG_STATUS_LABELS, NEG_STATUS_OPTIONS } from "./constants";
import * as S from "../styles";

export const ADMIN_NEGOTIATIONS_PAGE_SIZE = 20;

const NEG_FILTER_KEYS = ["q", "status"] as const;
type NegFilterKey = (typeof NEG_FILTER_KEYS)[number];

export function NegotiationsTab() {
    const navigate = useNavigate();
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<NegFilterKey>(NEG_FILTER_KEYS);

    const params = useMemo(() => ({ ...values, page, limit: ADMIN_NEGOTIATIONS_PAGE_SIZE }), [values, page]);
    const { data: negotiations, meta, isLoading, isFetching } = usePaginatedQuery(listNegotiationsPage, params, {
        errorMessage: "Erro ao carregar negociações.",
        onPageOutOfRange: setPage,
    });

    const chips = activeKeys.map((key) => ({
        key,
        label: key === "q"
            ? `Busca: ${values.q}`
            : `Status: ${NEG_STATUS_OPTIONS.find((o) => o.value === values.status)?.label ?? values.status}`,
    }));

    return (
        <S.Section>
            <S.ScrollAnchor ref={topRef} tabIndex={-1}>
                <S.SectionHeader>
                    <S.SectionTitle>Todas as negociações</S.SectionTitle>
                    {meta?.total !== undefined && (
                        <S.ResultCount aria-live="polite">
                            {meta.total.toLocaleString("pt-BR")} negociaç{meta.total === 1 ? "ão" : "ões"}
                        </S.ResultCount>
                    )}
                </S.SectionHeader>
            </S.ScrollAnchor>

            <FilterBar
                label="Filtrar negociações"
                activeCount={activeKeys.length}
                footer={<ActiveFilterChips chips={chips} onRemove={(k) => setFilter(k as NegFilterKey, "")} onClearAll={clearFilters} />}
            >
                <TextField
                    label="Buscar"
                    placeholder="Assunto ou nome do cliente"
                    value={values.q}
                    onChange={(v) => setFilter("q", v)}
                    wide
                />
                <SelectField
                    label="Status"
                    value={values.status}
                    onChange={(v) => setFilter("status", v)}
                    options={NEG_STATUS_OPTIONS}
                />
            </FilterBar>

            {isLoading ? (
                <S.LoadingSpinner role="status" aria-label="Carregando negociações" />
            ) : negotiations.length === 0 ? (
                activeKeys.length > 0 ? (
                    <NoResults title="Nenhuma negociação com esses filtros" onClear={clearFilters} />
                ) : (
                    <S.EmptyState>
                        <h3>Nenhuma negociação encontrada</h3>
                        <p>As conversas abertas pelos clientes aparecem aqui.</p>
                    </S.EmptyState>
                )
            ) : (
                <S.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <S.TableWrapper>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th>Assunto</S.Th>
                                    <S.Th>Cliente</S.Th>
                                    <S.Th>E-mail</S.Th>
                                    <S.Th>Status</S.Th>
                                    <S.Th>Criada em</S.Th>
                                    <S.Th><S.VisuallyHidden>Ação</S.VisuallyHidden></S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {negotiations.map((neg) => (
                                    <S.Tr key={neg.id}>
                                        <S.Td><strong>{neg.subject}</strong></S.Td>
                                        <S.Td>{neg.user?.name ?? "—"}</S.Td>
                                        <S.Td>{neg.user?.email ?? "—"}</S.Td>
                                        <S.Td>
                                            <S.NegStatusBadge $status={neg.status}>
                                                {NEG_STATUS_LABELS[neg.status] ?? neg.status}
                                            </S.NegStatusBadge>
                                        </S.Td>
                                        <S.Td>{formatDate(neg.createdAt)}</S.Td>
                                        <S.Td>
                                            <S.SecondaryButton
                                                $size="sm"
                                                onClick={() => navigate(`/negociacoes/${neg.id}`)}
                                            >
                                                Abrir chat
                                            </S.SecondaryButton>
                                        </S.Td>
                                    </S.Tr>
                                ))}
                            </tbody>
                        </S.Table>
                    </S.TableWrapper>

                    {meta && (
                        <Pagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            count={negotiations.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação das negociações"
                        />
                    )}
                </S.ListRegion>
            )}
        </S.Section>
    );
}
