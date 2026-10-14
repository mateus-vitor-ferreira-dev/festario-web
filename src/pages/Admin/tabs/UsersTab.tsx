import { useMemo, useRef } from "react";
import { listAdminUsersPage } from "../../../services/admin";
import { ActiveFilterChips, FilterBar, NoResults, Pagination, SelectField, TextField } from "../../../components";
import { useListParams } from "../../../hooks/useListParams";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { formatDate } from "./constants";
import type { User } from "../../../types";
import * as S from "../styles";

type AdminUser = User & { _count?: { reservations: number }; createdAt?: string };

export const ADMIN_USERS_PAGE_SIZE = 20;

const USER_FILTER_KEYS = ["q", "role"] as const;
type UserFilterKey = (typeof USER_FILTER_KEYS)[number];

const ROLE_OPTIONS = [
    { value: "", label: "Todos os perfis" },
    { value: "USER", label: "Cliente" },
    { value: "ADMIN", label: "Administrador" },
];

export function UsersTab() {
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams<UserFilterKey>(USER_FILTER_KEYS);

    // a API usa `search` (e aceita `q`); a URL usa `q`, como nas outras listas
    const params = useMemo(
        () => ({ search: values.q, role: values.role, page, limit: ADMIN_USERS_PAGE_SIZE }),
        [values, page],
    );
    const { data, meta, isLoading, isFetching } = usePaginatedQuery(listAdminUsersPage, params, {
        errorMessage: "Erro ao carregar usuários.",
        onPageOutOfRange: setPage,
    });
    const users = data as AdminUser[];

    const chips = activeKeys.map((key) => ({
        key,
        label: key === "q"
            ? `Busca: ${values.q}`
            : `Perfil: ${ROLE_OPTIONS.find((o) => o.value === values.role)?.label ?? values.role}`,
    }));

    return (
        <S.Section>
            <S.ScrollAnchor ref={topRef} tabIndex={-1}>
                <S.SectionHeader>
                    <S.SectionTitle>Usuários</S.SectionTitle>
                    {meta?.total !== undefined && (
                        <S.ResultCount aria-live="polite">
                            {meta.total.toLocaleString("pt-BR")} usuário{meta.total === 1 ? "" : "s"}
                        </S.ResultCount>
                    )}
                </S.SectionHeader>
            </S.ScrollAnchor>

            <FilterBar
                label="Filtrar usuários"
                activeCount={activeKeys.length}
                footer={<ActiveFilterChips chips={chips} onRemove={(k) => setFilter(k as UserFilterKey, "")} onClearAll={clearFilters} />}
            >
                <TextField
                    label="Buscar"
                    placeholder="Buscar por nome ou e-mail"
                    value={values.q}
                    onChange={(v) => setFilter("q", v, { replace: true })}
                    wide
                />
                <SelectField label="Perfil" value={values.role} onChange={(v) => setFilter("role", v)} options={ROLE_OPTIONS} />
            </FilterBar>

            {isLoading ? (
                <S.LoadingSpinner role="status" aria-label="Carregando usuários" />
            ) : users.length === 0 ? (
                activeKeys.length > 0 ? (
                    <NoResults title="Nenhum usuário com esses filtros" onClear={clearFilters} />
                ) : (
                    <S.EmptyState>
                        <h3>Nenhum usuário encontrado</h3>
                        <p>Os clientes cadastrados aparecem aqui.</p>
                    </S.EmptyState>
                )
            ) : (
                <S.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <S.TableWrapper>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th>Nome</S.Th>
                                    <S.Th>E-mail</S.Th>
                                    <S.Th>Telefone</S.Th>
                                    <S.Th>Perfil</S.Th>
                                    <S.Th $num>Reservas</S.Th>
                                    <S.Th>Cadastro</S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <S.Tr key={u.id}>
                                        <S.Td><strong>{u.name}</strong></S.Td>
                                        <S.Td>{u.email}</S.Td>
                                        <S.Td>{u.phone ?? "—"}</S.Td>
                                        <S.Td>
                                            <S.RoleBadge $role={u.role}>{u.role}</S.RoleBadge>
                                        </S.Td>
                                        <S.Td $num>{u._count?.reservations ?? 0}</S.Td>
                                        <S.Td>{formatDate(u.createdAt)}</S.Td>
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
                            count={users.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação dos usuários"
                        />
                    )}
                </S.ListRegion>
            )}
        </S.Section>
    );
}
