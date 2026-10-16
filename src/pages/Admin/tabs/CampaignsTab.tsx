import { useEffect, useState } from "react";
import { getSalonContact } from "../../../services/contact";
import { toast } from "react-toastify";
import {
    createCampaign,
    drawRaffleWinner,
    listCampaigns,
    updateCampaign,
} from "../../../services/admin";
import { DatePickerInput } from "../../../components";
import { useAuth } from "../../../contexts/AuthContext";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { Campaign, RaffleWinnerResult } from "../../../types";
import {
    buildWinnerMessage,
    CAMPAIGN_STATUS_LABELS,
    CAMPAIGN_TYPE_OPTIONS,
    CAMPAIGN_TYPE_LABELS,
    getCampaignDateDisplay,
    getCampaignStatus,
} from "./constants";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

export function CampaignsTab() {
    const { tenant } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [drawingId, setDrawingId] = useState<string | null>(null);
    const [winnerResult, setWinnerResult] = useState<RaffleWinnerResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [instagram, setInstagram] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        getSalonContact(controller.signal).then((c) => setInstagram(c.instagram?.display ?? null)).catch(() => setInstagram(null));
        return () => controller.abort();
    }, []);
    const [form, setForm] = useState({ code: "", type: "REFERRAL_NEXT_BOOKING", name: "", startsAt: "", endsAt: "" });
    const [isSaving, setIsSaving] = useState(false);

    async function load() {
        try {
            setIsLoading(true);
            const data = await listCampaigns();
            setCampaigns(data ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao carregar campanhas."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleToggle(campaign: Campaign) {
        try {
            setTogglingId(campaign.id);
            await updateCampaign(campaign.id, { isActive: !campaign.isActive });
            toast.success(`Campanha ${!campaign.isActive ? "ativada" : "desativada"} com sucesso.`);
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao atualizar campanha."));
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDrawWinner(campaign: Campaign) {
        try {
            setDrawingId(campaign.id);
            const result = await drawRaffleWinner(campaign.id);
            setWinnerResult(result);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao realizar sorteio."));
        } finally {
            setDrawingId(null);
        }
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSaving(true);
            await createCampaign({
                ...form,
                startsAt: new Date(form.startsAt).toISOString(),
                endsAt: new Date(form.endsAt + "T23:59:59").toISOString(),
            } as Campaign);
            toast.success("Campanha criada com sucesso.");
            setShowCreateModal(false);
            setForm({ code: "", type: "REFERRAL_NEXT_BOOKING", name: "", startsAt: "", endsAt: "" });
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao criar campanha."));
        } finally {
            setIsSaving(false);
        }
    }

    function handleCopyMessage(message: string) {
        navigator.clipboard.writeText(message).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Campanhas promocionais</S.SectionTitle>
                <S.PrimaryButton onClick={() => setShowCreateModal(true)}>+ Nova campanha</S.PrimaryButton>
            </S.SectionHeader>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : campaigns.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhuma campanha cadastrada</h3>
                    <p>Crie a primeira campanha clicando no botão acima.</p>
                </S.EmptyState>
            ) : (
                <S.CardList>
                    {campaigns.map((c) => {
                        const status = getCampaignStatus(c);
                        return (
                            <S.CampaignCard key={c.id}>
                                <S.CampaignInfo>
                                    <strong>{c.name}</strong>
                                    <span>{CAMPAIGN_TYPE_LABELS[c.type] ?? c.type} · Código: <strong>{c.code}</strong></span>
                                    <span>{getCampaignDateDisplay(c)}</span>
                                </S.CampaignInfo>
                                <S.CampaignActions>
                                    <S.CampaignStatusBadge $status={status}>
                                        {CAMPAIGN_STATUS_LABELS[status]}
                                    </S.CampaignStatusBadge>
                                    {c.type === "RAFFLE_VIP" && status === "active" && (
                                        <S.RaffleButton onClick={() => handleDrawWinner(c)} disabled={drawingId === c.id}>
                                            {drawingId === c.id ? "Sorteando..." : "Realizar sorteio"}
                                        </S.RaffleButton>
                                    )}
                                    <S.SecondaryButton $size="sm" onClick={() => handleToggle(c)} disabled={togglingId === c.id}>
                                        {togglingId === c.id ? "Salvando..." : c.isActive ? "Desativar" : "Ativar"}
                                    </S.SecondaryButton>
                                </S.CampaignActions>
                            </S.CampaignCard>
                        );
                    })}
                </S.CardList>
            )}

            {showCreateModal && (
                <S.ModalOverlay onClick={() => setShowCreateModal(false)}>
                    <S.ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ModalHeader onClose={() => setShowCreateModal(false)} disabled={isSaving}>Nova campanha</ModalHeader>
                        <S.Form onSubmit={handleCreate}>
                            <S.FormGroup>
                                <label>Nome</label>
                                <S.TextInput required value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Indique um amigo" />
                            </S.FormGroup>
                            <S.FormRow>
                                <S.FormGroup>
                                    <label>Código</label>
                                    <S.TextInput required value={form.code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Ex: REFERRAL_2026" />
                                </S.FormGroup>
                                <S.FormGroup>
                                    <label>Tipo</label>
                                    <S.Select value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, type: e.target.value }))}>
                                        {CAMPAIGN_TYPE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </S.Select>
                                </S.FormGroup>
                            </S.FormRow>
                            <S.FormRow>
                                <S.FormGroup>
                                    <label>Início</label>
                                    <DatePickerInput
                                        value={form.startsAt}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                                    />
                                </S.FormGroup>
                                <S.FormGroup>
                                    <label>Encerramento</label>
                                    <DatePickerInput
                                        value={form.endsAt}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                                        minDate={form.startsAt}
                                    />
                                </S.FormGroup>
                            </S.FormRow>
                            <S.ModalActions>
                                <S.SecondaryButton type="button" onClick={() => setShowCreateModal(false)} disabled={isSaving}>Cancelar</S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Criando..." : "Criar campanha"}</S.PrimaryButton>
                            </S.ModalActions>
                        </S.Form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}

            {winnerResult && (
                <S.ModalOverlay onClick={() => { setWinnerResult(null); setCopied(false); }}>
                    <S.ModalBox onClick={(e: React.MouseEvent) => e.stopPropagation()} $maxWidth={520}>
                        <ModalHeader onClose={() => { setWinnerResult(null); setCopied(false); }}>Ganhador do sorteio</ModalHeader>
                        <S.WinnerCard>
                            <strong>{winnerResult.winner.name}</strong>
                            <span>{winnerResult.winner.email}</span>
                            {winnerResult.winner.phone && <span>{winnerResult.winner.phone}</span>}
                            <S.WinnerMeta>
                                Sorteado entre {winnerResult.totalEntries} {winnerResult.totalEntries === 1 ? "participante" : "participantes"}
                            </S.WinnerMeta>
                        </S.WinnerCard>
                        <S.MessageBlock>
                            <S.SummaryLabel>Mensagem para enviar ao ganhador</S.SummaryLabel>
                            <S.MessagePreview>{buildWinnerMessage(winnerResult.winner, winnerResult.campaignName, tenant?.name, instagram)}</S.MessagePreview>
                            <S.CopyButton onClick={() => handleCopyMessage(buildWinnerMessage(winnerResult.winner, winnerResult.campaignName, tenant?.name, instagram))}>
                                {copied ? "Copiado!" : "Copiar mensagem"}
                            </S.CopyButton>
                        </S.MessageBlock>
                        <S.ModalActions>
                            <S.PrimaryButton onClick={() => { setWinnerResult(null); setCopied(false); }}>Fechar</S.PrimaryButton>
                        </S.ModalActions>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
