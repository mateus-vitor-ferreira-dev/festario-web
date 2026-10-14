import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { createReferral, listReferrals } from "../../services/referral";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useApiData } from "../../hooks/useApiData";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página do programa de indicações.
 *
 * Exibe o histórico de indicações do usuário e permite indicar novos amigos por e-mail.
 * Quando o indicado faz sua primeira reserva, o indicador recebe um desconto
 * conforme a campanha de tipo `REFERRAL_NEXT_BOOKING` ativa.
 *
 * @see GET /referrals
 * @see POST /referrals
 * @component
 */
const STATUS_LABELS = {
    PENDING: "Aguardando",
    QUALIFIED: "Qualificado",
    REWARDED: "Recompensado",
    EXPIRED: "Expirado",
    CANCELLED: "Cancelado",
};

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR");
}

export default function Referrals() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [noCampaign, setNoCampaign] = useState(false);

    const { data: referrals, isLoading, refresh } = useApiData(listReferrals, {
        initialData: [],
        errorMessage: "Erro ao carregar indicações.",
    });

    async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setIsSending(true);
            setNoCampaign(false);
            await createReferral(email.trim());
            toast.success("Indicação enviada com sucesso!");
            setEmail("");
            refresh();
        } catch (error) {
            const e = error as { response?: { data?: { error?: { code?: string } } } };
            if (e.response?.data?.error?.code === "NO_ACTIVE_REFERRAL_CAMPAIGN") {
                setNoCampaign(true);
            } else {
                toast.error(getErrorMessage(error, "Erro ao enviar indicação."));
            }
        } finally {
            setIsSending(false);
        }
    }

    useGSAP(() => {
        if (!containerRef.current) return;
        animateFadeInUp(containerRef.current.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [] });

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.Title>Indicações</S.Title>
                <S.Description>
                    Indique amigos e ganhe descontos na sua próxima reserva quando eles fizerem a primeira deles.
                </S.Description>
            </S.Header>

            <S.InviteCard>
                <S.InviteTitle>Convidar um amigo</S.InviteTitle>

                {noCampaign && (
                    <S.NoCampaignBanner>
                        Não há uma campanha de indicação ativa no momento. Fique de olho — em breve novas promoções estarão disponíveis!
                    </S.NoCampaignBanner>
                )}

                <form onSubmit={handleInvite}>
                    <S.InviteRow>
                        <S.EmailInput
                            type="email"
                            placeholder="E-mail do amigo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSending}
                            required
                        />
                        <S.InviteButton type="submit" disabled={isSending || !email.trim()}>
                            {isSending ? "Enviando..." : "Indicar"}
                        </S.InviteButton>
                    </S.InviteRow>
                </form>
            </S.InviteCard>

            {isLoading ? (
                <S.LoadingCard>
                    <h2>Carregando indicações...</h2>
                    <p>Aguarde um momento.</p>
                </S.LoadingCard>
            ) : (
                <>
                    <S.ListTitle>Suas indicações</S.ListTitle>

                    {(referrals ?? []).length === 0 ? (
                        <S.EmptyState>
                            <p>Você ainda não fez nenhuma indicação. Digite o e-mail de um amigo no formulário acima e toque em “Indicar”.</p>
                        </S.EmptyState>
                    ) : (
                        <S.List>
                            {(referrals ?? []).map((ref) => (
                                <S.ReferralCard key={ref.id}>
                                    <S.ReferralInfo>
                                        <strong>{ref.referredEmail}</strong>
                                        <span>
                                            {ref.campaign?.name} · Indicado em {formatDate(ref.createdAt)}
                                        </span>
                                    </S.ReferralInfo>

                                    <S.StatusBadge $status={ref.status}>
                                        {STATUS_LABELS[ref.status as keyof typeof STATUS_LABELS] ?? ref.status}
                                    </S.StatusBadge>
                                </S.ReferralCard>
                            ))}
                        </S.List>
                    )}
                </>
            )}
        </S.Container>
    );
}
