import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listAdminUsers } from "../../../services/admin";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { formatDate } from "./constants";
import type { User } from "../../../types";
import * as S from "../styles";

export function UsersTab() {
    const [users, setUsers] = useState<(User & { _count?: { reservations: number }; createdAt?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const limit = 20;

    async function load(currentPage = 1, currentSearch = search) {
        try {
            setIsLoading(true);
            const result = await listAdminUsers({ page: currentPage, limit, search: currentSearch || undefined });
            const list = (result ?? []) as (User & { _count?: { reservations: number }; createdAt?: string })[];
            setUsers(list);
            setHasMore(list.length === limit);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao carregar usuários."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setPage(1);
        load(1);
    // `load` é recriada a cada render; incluí-la recarregaria a lista em loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSearch(searchInput);
    }

    function handlePageChange(next: number) {
        setPage(next);
        load(next);
    }

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Usuários</S.SectionTitle>
            </S.SectionHeader>

            <S.FiltersRow as="form" onSubmit={handleSearch}>
                <S.SearchInput
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <S.SecondaryButton type="submit">Buscar</S.SecondaryButton>
                {search && (
                    <S.SecondaryButton type="button" onClick={() => { setSearchInput(""); setSearch(""); }}>
                        Limpar
                    </S.SecondaryButton>
                )}
            </S.FiltersRow>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : users.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum usuário encontrado</h3>
                    <p>Tente ajustar a busca.</p>
                </S.EmptyState>
            ) : (
                <>
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

                    <S.Pagination>
                        <S.PageButton onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Anterior</S.PageButton>
                        <S.PageInfo>Página {page}</S.PageInfo>
                        <S.PageButton onClick={() => handlePageChange(page + 1)} disabled={!hasMore}>Próxima</S.PageButton>
                    </S.Pagination>
                </>
            )}
        </S.Section>
    );
}
