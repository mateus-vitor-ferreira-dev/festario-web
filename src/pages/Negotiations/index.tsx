import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { createNegotiation } from "../../services/negotiation";
import { useNegotiations } from "../../hooks/useNegotiations";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página de listagem das negociações do usuário.
 *
 * Permite criar uma nova negociação (botão "Nova Negociação") e ver o histórico.
 * Clicar em uma negociação navega para `/negociacoes/:id` (NegotiationChat).
 *
 * @see GET /negotiations
 * @see POST /negotiations
 * @component
 */
const STATUS_LABELS = {
    OPEN: "Aberta",
    PENDING_APPROVAL: "Proposta enviada",
    ACCEPTED: "Aceita",
    REJECTED: "Recusada",
    CLOSED: "Encerrada",
};

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function Negotiations() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { negotiations, isLoading } = useNegotiations();
    const [isSending, setIsSending] = useState(false);

    useGSAP(() => {
        if (!containerRef.current) return;
        animateFadeInUp(containerRef.current.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [] });

    async function handleCreate() {
        if (isSending) return;

        try {
            setIsSending(true);
            const negotiation = await createNegotiation();
            navigate(`/negociacoes/${negotiation.id}`);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao iniciar negociação."));
        } finally {
            setIsSending(false);
        }
    }

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.HeaderText>
                    <S.Title>Negociações</S.Title>
                    <S.Description>
                        Acompanhe suas conversas de negociação. Clique em uma para continuar.
                    </S.Description>
                </S.HeaderText>

                <S.NewButton onClick={handleCreate} disabled={isSending}>
                    {isSending ? "Iniciando..." : "Nova negociação"}
                </S.NewButton>
            </S.Header>

            {isLoading ? (
                <S.LoadingCard>
                    <p>Carregando negociações...</p>
                </S.LoadingCard>
            ) : negotiations.length === 0 ? (
                <S.EmptyState>
                    <p>Você ainda não possui negociações.<br />Use "Nova negociação" para conversar com a equipe sobre datas, convidados ou condições especiais.</p>
                </S.EmptyState>
            ) : (
                <S.List>
                    {negotiations.map((neg) => (
                        <S.NegotiationCard
                            key={neg.id}
                            onClick={() => navigate(`/negociacoes/${neg.id}`)}
                        >
                            <S.NegotiationInfo>
                                <S.NegotiationSubject>{neg.subject}</S.NegotiationSubject>
                                <S.NegotiationMeta>
                                    {neg.user?.name} · {formatDate(neg.createdAt)}
                                </S.NegotiationMeta>
                                {neg.messages?.[0] && (
                                    <S.LastMessage>{neg.messages[0].content}</S.LastMessage>
                                )}
                            </S.NegotiationInfo>
                            <S.StatusBadge $status={neg.status}>
                                {STATUS_LABELS[neg.status] ?? neg.status}
                            </S.StatusBadge>
                        </S.NegotiationCard>
                    ))}
                </S.List>
            )}
        </S.Container>
    );
}
