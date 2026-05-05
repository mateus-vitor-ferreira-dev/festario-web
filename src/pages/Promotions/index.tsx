import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { listPromotionStatus, listMyGrants } from "../../services/promotion";
import { createReferral, listReferrals } from "../../services/referral";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import type { PromotionGrant, PromotionStatusItem, Referral } from "../../types";
import * as S from "./styles";

const CAMPAIGN_CONFIGS = {
    REFERRAL_NEXT_BOOKING: {
        icon: "🎁",
        typeLabel: "Indicação",
        title: "Indique e Ganhe",
        description:
            "Indique um amigo pelo e-mail. Quando ele fizer a primeira reserva no Recanto Vila Rica, você recebe automaticamente um desconto na sua próxima reserva.",
        cta: "invite",
    },
    LOYALTY_ALWAYS_HERE: {
        icon: "⭐",
        typeLabel: "Fidelidade",
        title: "Programa de Fidelidade",
        description:
            "Clientes que retornam ao Recanto Vila Rica recebem descontos exclusivos automaticamente. Quanto mais você reserva, maiores os benefícios.",
        cta: null,
    },
    RAFFLE_VIP: {
        icon: "🎰",
        typeLabel: "Sorteio VIP",
        title: "Sorteio VIP",
        description:
            "Publique um stories no Instagram marcando @recanto.vilarica e concorra a uma reserva gratuita. Ganhadores são sorteados ao final da campanha.",
        cta: "instagram",
    },
};

const CAMPAIGN_TYPES = ["REFERRAL_NEXT_BOOKING", "LOYALTY_ALWAYS_HERE", "RAFFLE_VIP"];

const REFERRAL_STATUS_LABELS = {
    PENDING: "Aguardando reserva do amigo",
    QUALIFIED: "Amigo reservou — desconto a caminho",
    REWARDED: "Desconto concedido",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
};

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR");
}

function formatExpiry(date: string | null | undefined): string {
    if (!date) return "Sem data de expiração";
    return `Válido até ${formatDate(date)}`;
}

export default function Promotions() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [campaignStatus, setCampaignStatus] = useState<PromotionStatusItem[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [grants, setGrants] = useState<PromotionGrant[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [noCampaign, setNoCampaign] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function load() {
            try {
                setIsLoading(true);
                const [campaignsData, grantsData, referralsData] = await Promise.allSettled([
                    listPromotionStatus(signal),
                    listMyGrants(signal),
                    listReferrals(signal),
                ]);

                if (signal.aborted) return;

                if (campaignsData.status === "fulfilled") setCampaignStatus(campaignsData.value);
                if (grantsData.status === "fulfilled") setGrants(grantsData.value ?? []);
                if (referralsData.status === "fulfilled") setReferrals(referralsData.value ?? []);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error("Erro ao carregar promoções.");
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, []);

    useGSAP(() => {
        if (isLoading || !containerRef.current) return;
        animateFadeInUp(containerRef.current.querySelector(".anim-header"));
        animateStagger(containerRef.current.querySelectorAll(".anim-card"), { delay: 0.08 });
    }, { scope: containerRef, dependencies: [isLoading] });

    async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        try {
            setIsSending(true);
            setNoCampaign(false);
            await createReferral(inviteEmail.trim());
            toast.success("Indicação enviada com sucesso!");
            setInviteEmail("");
            const updated = await listReferrals();
            setReferrals(updated ?? []);
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

    const statusByType = Object.fromEntries(
        campaignStatus.map((s) => [s.type, s])
    );

    function getUnavailableReason(entry: PromotionStatusItem | undefined): string {
        if (!entry || entry.status === "not_configured") {
            return "Esta promoção ainda não foi configurada. Fique atento às novidades!";
        }
        if (entry.status === "disabled") {
            return "Esta campanha foi temporariamente desativada.";
        }
        if (entry.status === "scheduled") {
            return `Esta campanha ainda não começou. Disponível a partir de ${entry.campaign ? formatDate(entry.campaign.startsAt) : "—"}.`;
        }
        if (entry.status === "ended") {
            return `Esta campanha encerrou em ${entry.campaign ? formatDate(entry.campaign.endsAt) : "—"}. Aguarde a próxima edição!`;
        }
        return "Esta promoção não está disponível no momento.";
    }

    function toggleExpand(type: string) {
        setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));
    }

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.Title>Promoções</S.Title>
                <S.Description>
                    Confira as campanhas disponíveis, seus descontos conquistados e o histórico de indicações.
                </S.Description>
            </S.Header>

            {isLoading ? (
                <S.Spinner />
            ) : (
                <>
                    <div>
                        <S.SectionTitle>Campanhas</S.SectionTitle>
                        <S.CampaignGrid>
                            {CAMPAIGN_TYPES.map((type) => {
                                const config = CAMPAIGN_CONFIGS[type as keyof typeof CAMPAIGN_CONFIGS];
                                const entry = statusByType[type];
                                const isActive = entry?.status === "active";
                                const isOpen = !!expanded[type];

                                return (
                                    <S.CampaignCard
                                        key={type}
                                        $inactive={!isActive}
                                        className="anim-card"
                                        onClick={!isActive ? () => toggleExpand(type) : undefined}
                                    >
                                        <S.CampaignTop>
                                            <S.CampaignLeft>
                                                <S.CampaignIcon>{config.icon}</S.CampaignIcon>
                                                <S.CampaignMeta>
                                                    <S.CampaignName>{config.title}</S.CampaignName>
                                                    <S.CampaignType>{config.typeLabel}</S.CampaignType>
                                                </S.CampaignMeta>
                                            </S.CampaignLeft>
                                            <S.StatusBadge $active={isActive}>
                                                {isActive ? "Ativa" : "Indisponível"}
                                            </S.StatusBadge>
                                        </S.CampaignTop>

                                        <S.CampaignDesc>{config.description}</S.CampaignDesc>

                                        {isActive && entry.campaign?.startsAt && entry.campaign?.endsAt && (
                                            <S.CampaignDates>
                                                {formatDate(entry.campaign.startsAt)} → {formatDate(entry.campaign.endsAt)}
                                            </S.CampaignDates>
                                        )}

                                        {!isActive && (
                                            <>
                                                <S.ExpandHint>
                                                    {isOpen ? "▲" : "▼"} {isOpen ? "Ocultar detalhes" : "Ver motivo"}
                                                </S.ExpandHint>
                                                <S.UnavailableReason $open={isOpen}>
                                                    <S.UnavailableText>
                                                        {getUnavailableReason(entry)}
                                                    </S.UnavailableText>
                                                </S.UnavailableReason>
                                            </>
                                        )}

                                        {isActive && config.cta === "invite" && (
                                            <>
                                                {noCampaign && (
                                                    <S.NoCampaignBanner>
                                                        Nenhuma campanha de indicação ativa no momento.
                                                    </S.NoCampaignBanner>
                                                )}
                                                <S.InviteForm onSubmit={handleInvite}>
                                                    <S.InviteInput
                                                        type="email"
                                                        placeholder="E-mail do amigo"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                        disabled={isSending}
                                                        required
                                                    />
                                                    <S.InviteButton type="submit" disabled={isSending || !inviteEmail.trim()}>
                                                        {isSending ? "Enviando..." : "Indicar"}
                                                    </S.InviteButton>
                                                </S.InviteForm>
                                            </>
                                        )}

                                        {isActive && config.cta === "instagram" && (
                                            <S.InstagramLink
                                                href="https://www.instagram.com/recanto.vilarica"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Ir para o Instagram →
                                            </S.InstagramLink>
                                        )}
                                    </S.CampaignCard>
                                );
                            })}
                        </S.CampaignGrid>
                    </div>

                    <div>
                        <S.SectionTitle>Meus descontos</S.SectionTitle>
                        {grants.length === 0 ? (
                            <S.EmptyGrants>
                                Você ainda não tem descontos disponíveis. Indique amigos para ganhar!
                            </S.EmptyGrants>
                        ) : (
                            <S.GrantsGrid>
                                {grants.map((grant) => (
                                    <S.GrantCard key={grant.id} className="anim-card">
                                        <S.GrantPercent>{grant.percentOff}% OFF</S.GrantPercent>
                                        <S.GrantCampaign>{grant.campaign?.name}</S.GrantCampaign>
                                        <S.GrantExpiry>{formatExpiry(grant.validUntil)}</S.GrantExpiry>
                                    </S.GrantCard>
                                ))}
                            </S.GrantsGrid>
                        )}
                    </div>

                    <div>
                        <S.SectionTitle>Minhas indicações</S.SectionTitle>
                        {referrals.length === 0 ? (
                            <S.EmptyReferrals>
                                Você ainda não indicou ninguém. Use o formulário acima para começar!
                            </S.EmptyReferrals>
                        ) : (
                            <S.ReferralList>
                                {referrals.map((ref) => (
                                    <S.ReferralCard key={ref.id} className="anim-card">
                                        <S.ReferralInfo>
                                            <strong>{ref.referredEmail}</strong>
                                            <span>Indicado em {formatDate(ref.createdAt)}</span>
                                        </S.ReferralInfo>
                                        <S.ReferralBadge $status={ref.status}>
                                            {REFERRAL_STATUS_LABELS[ref.status as keyof typeof REFERRAL_STATUS_LABELS] ?? ref.status}
                                        </S.ReferralBadge>
                                    </S.ReferralCard>
                                ))}
                            </S.ReferralList>
                        )}
                    </div>
                </>
            )}
        </S.Container>
    );
}
