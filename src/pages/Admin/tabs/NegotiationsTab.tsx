import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listNegotiations } from "../../../services/negotiation";
import { useApiData } from "../../../hooks/useApiData";
import { formatDate, NEG_STATUS_LABELS, NEG_STATUS_OPTIONS } from "./constants";
import type { Negotiation, NegotiationStatus } from "../../../types";
import * as S from "../styles";

export function NegotiationsTab() {
    const navigate = useNavigate();
    const { data: negotiations, isLoading } = useApiData<Negotiation[]>(listNegotiations, {
        initialData: [],
        errorMessage: "Erro ao carregar negociações.",
    });
    const [statusFilter, setStatusFilter] = useState<NegotiationStatus | "">("");

    const filtered = statusFilter
        ? (negotiations ?? []).filter((n) => n.status === statusFilter)
        : negotiations ?? [];

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Todas as negociações</S.SectionTitle>
            </S.SectionHeader>

            <S.FiltersRow>
                <S.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as NegotiationStatus | "")}>
                    {NEG_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </S.Select>
            </S.FiltersRow>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : filtered.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhuma negociação encontrada</h3>
                    <p>Tente ajustar os filtros.</p>
                </S.EmptyState>
            ) : (
                <S.TableWrapper>
                    <S.Table>
                        <thead>
                            <tr>
                                <S.Th>Assunto</S.Th>
                                <S.Th>Cliente</S.Th>
                                <S.Th>E-mail</S.Th>
                                <S.Th>Status</S.Th>
                                <S.Th>Criada em</S.Th>
                                <S.Th>Ação</S.Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((neg) => (
                                <S.Tr key={neg.id}>
                                    <S.Td>{neg.subject}</S.Td>
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
                                            style={{ height: "32px", padding: "0 12px", fontSize: "13px" }}
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
            )}
        </S.Section>
    );
}
