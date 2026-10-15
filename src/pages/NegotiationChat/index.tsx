import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readTenant } from "../../config/tenantStorage";
import { isManagerRole, PANEL_PATH } from "../../utils/roles";
import { toast } from "react-toastify";

/**
 * @module pages/NegotiationChat
 * @description Chat de negociação entre usuário e administrador para condições especiais.
 *
 * Faz polling a cada 5 s para atualizar mensagens. O admin pode enviar propostas
 * (preço + datas customizadas) e o usuário aceita ou recusa via botões inline.
 * Admins veem controles extras: formulário de proposta, calendário e botão de fechar/rejeitar.
 *
 * @see GET /negotiations/:id
 * @see POST /negotiations/:id/messages
 * @see POST /negotiations/:id/proposal
 * @see POST /negotiations/:id/proposal/respond
 * @see PATCH /negotiations/:id/status
 */
import {
    getNegotiation,
    respondToProposal,
    sendMessage,
    sendProposal,
    updateNegotiationStatus,
} from "../../services/negotiation";
import { listVenues } from "../../services/venue";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import { readSession } from "../../config/authStorage";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import type { Negotiation, NegotiationMessage, Venue, NegotiationStatus, ProposalMetadata } from "../../types";
import * as S from "./styles";

const STATUS_LABELS: Record<NegotiationStatus, string> = {
    OPEN: "Aberta",
    PENDING_APPROVAL: "Proposta enviada",
    ACCEPTED: "Aceita",
    REJECTED: "Recusada",
    CLOSED: "Encerrada",
};

function formatTime(date: string): string {
    return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatDateTimeFull(date: string): string {
    return new Date(date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
    );
}

/** Conversas antigas traziam um código PIX vencido no fim da mensagem; o pagamento agora é combinado com o salão (#48). */
function withoutLegacyPix(content: string): string {
    return content.replace(/\n\nPIX copia e cola:\n.+/s, "");
}

interface ProposalMessageProps {
    msg: NegotiationMessage;
    metadata: ProposalMetadata;
    canRespond: boolean;
    onAccept: () => void;
    onDecline: () => void;
    isResponding: boolean;
}

function ProposalMessage({ msg, metadata: p, canRespond, onAccept, onDecline, isResponding }: ProposalMessageProps) {

    return (
        <>
            <S.BubbleText $isOwn={false} $isSystem>{msg.content}</S.BubbleText>
            <S.ProposalCard>
                <S.ProposalTitle>Proposta de reserva</S.ProposalTitle>
                <S.ProposalPrice>
                    <S.ProposalLabel>Valor proposto</S.ProposalLabel>
                    <S.ProposalPriceValue>{formatCurrency(p.customPriceCents)}</S.ProposalPriceValue>
                </S.ProposalPrice>
                <S.ProposalDetail>
                    {p.venueName && (
                        <S.ProposalRow>
                            <S.ProposalLabel>Espaço</S.ProposalLabel>
                            <S.ProposalValue>{p.venueName}</S.ProposalValue>
                        </S.ProposalRow>
                    )}
                    <S.ProposalRow>
                        <S.ProposalLabel>Início</S.ProposalLabel>
                        <S.ProposalValue>{formatDateTimeFull(p.startDate)}</S.ProposalValue>
                    </S.ProposalRow>
                    <S.ProposalRow>
                        <S.ProposalLabel>Fim</S.ProposalLabel>
                        <S.ProposalValue>{formatDateTimeFull(p.endDate)}</S.ProposalValue>
                    </S.ProposalRow>
                    {p.notes && (
                        <S.ProposalRow>
                            <S.ProposalLabel>Obs.</S.ProposalLabel>
                            <S.ProposalValue>{p.notes}</S.ProposalValue>
                        </S.ProposalRow>
                    )}
                </S.ProposalDetail>
                {canRespond && (
                    <S.ProposalActions>
                        <S.AcceptButton type="button" onClick={onAccept} disabled={isResponding}>
                            {isResponding ? "..." : "Aceitar"}
                        </S.AcceptButton>
                        <S.DeclineButton type="button" onClick={onDecline} disabled={isResponding}>
                            Recusar
                        </S.DeclineButton>
                    </S.ProposalActions>
                )}
            </S.ProposalCard>
        </>
    );
}

export default function NegotiationChat() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const messagesAreaRef = useRef<HTMLDivElement | null>(null);

    const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isResponding, setIsResponding] = useState(false);

    // Admin proposal form
    const [venues, setVenues] = useState<Venue[]>([]);
    const [proposalForm, setProposalForm] = useState({
        venueId: "",
        date: "",
        startTime: "",
        endTime: "",
        customPrice: "",
        notes: "",
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSendingProposal, setIsSendingProposal] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const session = readSession();
    const currentUserId = session?.user?.id ?? null;
    // nome mostrado nas mensagens da equipe: o do espaço guardado; sem ele, um rótulo
    // neutro (a equipe é do salão, não da plataforma)
    const teamName = readTenant()?.name || "Equipe do espaço";
    // equipe do espaço: dono (OWNER) ou equipe da plataforma (ADMIN)
    const isAdmin = isManagerRole(session?.user?.role);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();

        async function load() {
            try {
                setIsLoading(true);
                const [neg, venueList] = await Promise.all([
                    getNegotiation(id!, controller.signal),
                    isAdmin ? listVenues(controller.signal) : Promise.resolve([]),
                ]);
                setNegotiation(neg);
                if (isAdmin) setVenues(venueList ?? []);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error(getErrorMessage(error, "Erro ao carregar negociação."));
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, [id, isAdmin]);

    // Poll for new messages while the negotiation is active.
    // Starts at 5 s; backs off exponentially on consecutive errors (max 60 s).
    const negotiationRef = useRef<Negotiation | null>(null);
    negotiationRef.current = negotiation;

    useEffect(() => {
        if (!id) return;
        const negotiationId = id;
        const CLOSED_STATUSES = new Set<NegotiationStatus>(["CLOSED", "REJECTED", "ACCEPTED"]);
        const BASE_INTERVAL = 5_000;
        const MAX_INTERVAL = 60_000;
        let consecutiveErrors = 0;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function poll() {
            const current = negotiationRef.current;
            if (!current || CLOSED_STATUSES.has(current.status)) return;

            try {
                const fresh = await getNegotiation(negotiationId);
                consecutiveErrors = 0;
                setNegotiation((prev) => {
                    if (!prev) return fresh;
                    const prevIds = new Set(prev.messages.map((m) => m.id));
                    const hasNew = fresh.messages.some((m) => !prevIds.has(m.id));
                    const statusChanged = fresh.status !== prev.status;
                    return hasNew || statusChanged ? fresh : prev;
                });
            } catch {
                consecutiveErrors += 1;
            }

            const delay = Math.min(BASE_INTERVAL * 2 ** consecutiveErrors, MAX_INTERVAL);
            timeoutId = setTimeout(poll, delay);
        }

        timeoutId = setTimeout(poll, BASE_INTERVAL);
        return () => clearTimeout(timeoutId);
    }, [id]);

    useEffect(() => {
        // Rola só a área de mensagens — nunca a janela.
        const area = messagesAreaRef.current;
        if (area) area.scrollTop = area.scrollHeight;
    }, [negotiation?.messages]);

    async function submitMessage() {
        if (!text.trim() || isSending || !id) return;

        const content = text.trim();
        setText("");

        try {
            setIsSending(true);
            const message = await sendMessage(id, content);
            setNegotiation((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: [...prev.messages, message],
                };
            });
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao enviar mensagem."));
            setText(content);
        } finally {
            setIsSending(false);
        }
    }

    function handleSend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        submitMessage();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    }

    async function handleStatusUpdate(status: NegotiationStatus) {
        if (!id) return;
        try {
            setIsUpdatingStatus(true);
            await updateNegotiationStatus(id, status);
            const refetch = await getNegotiation(id);
            setNegotiation(refetch);
            toast.success("Status atualizado.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao atualizar status."));
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    async function handleSendProposal(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!id) return;
        const { venueId, date, startTime, endTime, customPrice, notes } = proposalForm;
        if (!venueId || !date || !startTime || !endTime || !customPrice) return;

        const customPriceCents = Math.round(parseFloat(customPrice.replace(",", ".")) * 100);
        if (isNaN(customPriceCents) || customPriceCents <= 0) {
            toast.error("Valor inválido.");
            return;
        }

        const startDate = new Date(`${date}T${startTime}`).toISOString();
        const endDate = new Date(`${date}T${endTime}`).toISOString();

        if (new Date(startDate) >= new Date(endDate)) {
            toast.error("O horário de término deve ser após o horário de início.");
            return;
        }

        try {
            setIsSendingProposal(true);
            await sendProposal(id, { venueId, startDate, endDate, customPriceCents, notes: notes || null });
            toast.success("Proposta enviada ao cliente!");
            const refetch = await getNegotiation(id);
            setNegotiation(refetch);
            setProposalForm({ venueId: "", date: "", startTime: "", endTime: "", customPrice: "", notes: "" });
            setShowCalendar(false);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao enviar proposta."));
        } finally {
            setIsSendingProposal(false);
        }
    }

    async function handleAcceptProposal() {
        if (!id) return;
        try {
            setIsResponding(true);
            const result = await respondToProposal(id, "ACCEPT");
            toast.success("Proposta aceita! Veja como pagar e combinar com o salão.");
            setTimeout(() => navigate(`/checkout/${result.reservation?.id}`), 1200);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao aceitar proposta."));
            setIsResponding(false);
        }
    }

    async function handleDeclineProposal() {
        if (!id) return;
        try {
            setIsResponding(true);
            await respondToProposal(id, "REJECT");
            toast.info("Proposta recusada. A negociação continua em aberto.");
            const refetch = await getNegotiation(id);
            setNegotiation(refetch);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao recusar proposta."));
        } finally {
            setIsResponding(false);
        }
    }

    // Admin: accept/decline on behalf of the client
    async function handleAdminAcceptProposal() {
        if (!id) return;
        try {
            setIsResponding(true);
            const result = await respondToProposal(id, "ACCEPT");
            toast.success("Reserva confirmada em nome do cliente!");
            const refetch = await getNegotiation(id);
            setNegotiation(refetch);
            // Optionally navigate to the reservation
            if (result?.reservation?.id) {
                setTimeout(() => navigate(isAdmin ? PANEL_PATH : "/reservations"), 1500);
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao confirmar proposta."));
        } finally {
            setIsResponding(false);
        }
    }

    async function handleAdminDeclineProposal() {
        if (!id) return;
        try {
            setIsResponding(true);
            await respondToProposal(id, "REJECT");
            toast.info("Proposta recusada. Negociação voltou para aberta.");
            const refetch = await getNegotiation(id);
            setNegotiation(refetch);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao recusar proposta."));
        } finally {
            setIsResponding(false);
        }
    }

    const isClosed = negotiation?.status === "CLOSED" || negotiation?.status === "REJECTED";
    const isPendingApproval = negotiation?.status === "PENDING_APPROVAL";

    const lastProposalIndex = negotiation?.messages
        ? [...negotiation.messages].map((m, i) => ({ m, i }))
            .filter(({ m }) => m.metadata?.type === "PROPOSAL")
            .at(-1)?.i ?? -1
        : -1;

    if (isLoading) {
        return <S.LoadingState>Carregando conversa...</S.LoadingState>;
    }

    if (!negotiation) return null;

    return (
        <div>
            <S.Wrapper>
                <S.TopBar>
                    <S.BackButton onClick={() => navigate("/negociacoes")} title="Voltar" aria-label="Voltar">
                        <BackIcon />
                    </S.BackButton>
                    <S.TopInfo>
                        <S.TopSubject>{negotiation.subject}</S.TopSubject>
                        <S.TopMeta>
                            {negotiation.user?.name}
                            {isAdmin && ` · ${negotiation.user?.email}`}
                        </S.TopMeta>
                    </S.TopInfo>
                    <S.StatusBadge $status={negotiation.status}>
                        {STATUS_LABELS[negotiation.status] ?? negotiation.status}
                    </S.StatusBadge>
                </S.TopBar>

                <S.MessagesArea ref={messagesAreaRef}>
                    {negotiation.messages.map((msg, idx) => {
                        const isOwn = !msg.isSystem && msg.author.id === currentUserId;
                        const meta = msg.metadata;
                        const isProposal = meta?.type === "PROPOSAL";
                        const displayContent = msg.isSystem && !isProposal ? withoutLegacyPix(msg.content) : msg.content;

                        return (
                            <S.MessageRow key={msg.id} $isOwn={isOwn} $isSystem={msg.isSystem}>
                                <S.Bubble $isOwn={isOwn} $isSystem={msg.isSystem} $isProposal={isProposal}>
                                    {!isOwn && !msg.isSystem && (
                                        <S.BubbleAuthor $isOwn={isOwn}>
                                            {isManagerRole(msg.author.role) ? teamName : msg.author.name}
                                        </S.BubbleAuthor>
                                    )}

                                    {isProposal && meta ? (
                                        <ProposalMessage
                                            msg={msg}
                                            metadata={meta}
                                            canRespond={!isAdmin && isPendingApproval === true && idx === lastProposalIndex}
                                            onAccept={handleAcceptProposal}
                                            onDecline={handleDeclineProposal}
                                            isResponding={isResponding}
                                        />
                                    ) : (
                                        <S.BubbleText $isOwn={isOwn} $isSystem={msg.isSystem}>
                                            {displayContent}
                                        </S.BubbleText>
                                    )}

                                    <S.BubbleTime $isOwn={isOwn} $isSystem={msg.isSystem}>
                                        {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                                    </S.BubbleTime>
                                </S.Bubble>
                            </S.MessageRow>
                        );
                    })}
                </S.MessagesArea>

                {isClosed ? (
                    <S.ClosedBanner>Esta negociação está encerrada.</S.ClosedBanner>
                ) : (
                    <S.InputBar onSubmit={handleSend}>
                        <S.MessageInput
                            placeholder="Digite uma mensagem..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            rows={1}
                        />
                        <S.SendButton type="submit" disabled={isSending || !text.trim()} aria-label="Enviar mensagem">
                            <SendIcon />
                        </S.SendButton>
                    </S.InputBar>
                )}
            </S.Wrapper>

            {/* Admin panel */}
            {isAdmin && !negotiation.reservationId && !isClosed && (
                <S.AdminPanel>
                    {isPendingApproval ? (
                        <>
                            <S.AdminPanelTitle>Proposta enviada</S.AdminPanelTitle>
                            <S.AdminWaiting>
                                Aguardando resposta do cliente. Você também pode confirmar ou recusar a proposta abaixo.
                            </S.AdminWaiting>
                            <S.AdminButtons>
                                <S.PrimaryButton
                                    type="button"
                                    onClick={handleAdminAcceptProposal}
                                    disabled={isResponding}
                                >
                                    {isResponding ? "..." : "Confirmar reserva"}
                                </S.PrimaryButton>
                                <S.SecondaryButton
                                    type="button"
                                    onClick={handleAdminDeclineProposal}
                                    disabled={isResponding}
                                >
                                    Recusar proposta
                                </S.SecondaryButton>
                                <S.DangerButton
                                    type="button"
                                    onClick={() => handleStatusUpdate("REJECTED")}
                                    disabled={isUpdatingStatus}
                                >
                                    Cancelar negociação
                                </S.DangerButton>
                            </S.AdminButtons>
                        </>
                    ) : (
                        <>
                            <S.AdminPanelTitle>Enviar proposta ao cliente</S.AdminPanelTitle>

                            <S.AdminForm onSubmit={handleSendProposal}>
                                <S.Field>
                                    <S.FieldLabel>Espaço</S.FieldLabel>
                                    <S.FieldInput
                                        as="select"
                                        value={proposalForm.venueId}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setProposalForm((f) => ({ ...f, venueId: e.target.value, date: "" }));
                                            setShowCalendar(false);
                                        }}
                                        disabled={isSendingProposal}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {venues.map((v) => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </S.FieldInput>
                                </S.Field>

                                {proposalForm.venueId && (
                                    <S.Field>
                                        <S.FieldLabel>
                                            Data do evento
                                            {proposalForm.date && (
                                                <S.SelectedDateBadge>
                                                    {new Date(`${proposalForm.date}T12:00:00`).toLocaleDateString("pt-BR", {
                                                        day: "2-digit", month: "long", year: "numeric",
                                                    })}
                                                </S.SelectedDateBadge>
                                            )}
                                        </S.FieldLabel>
                                        <S.CalendarToggle
                                            type="button"
                                            onClick={() => setShowCalendar((v) => !v)}
                                            disabled={isSendingProposal}
                                        >
                                            {showCalendar ? "Fechar calendário" : (proposalForm.date ? "Alterar data" : "Selecionar data")}
                                        </S.CalendarToggle>
                                        {showCalendar && (
                                            <S.CalendarWrapper>
                                                <AvailabilityCalendar
                                                    venueId={proposalForm.venueId}
                                                    selectedDate={proposalForm.date}
                                                    onChange={(d: string) => {
                                                        setProposalForm((f) => ({ ...f, date: d }));
                                                        setShowCalendar(false);
                                                    }}
                                                />
                                            </S.CalendarWrapper>
                                        )}
                                    </S.Field>
                                )}

                                <S.FieldRow>
                                    <S.Field>
                                        <S.FieldLabel>Horário de início</S.FieldLabel>
                                        <S.FieldInput
                                            type="time"
                                            value={proposalForm.startTime}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProposalForm((f) => ({ ...f, startTime: e.target.value }))}
                                            disabled={isSendingProposal}
                                            required
                                        />
                                    </S.Field>
                                    <S.Field>
                                        <S.FieldLabel>Horário de término</S.FieldLabel>
                                        <S.FieldInput
                                            type="time"
                                            value={proposalForm.endTime}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProposalForm((f) => ({ ...f, endTime: e.target.value }))}
                                            disabled={isSendingProposal}
                                            required
                                        />
                                    </S.Field>
                                    <S.Field>
                                        <S.FieldLabel>Valor (R$)</S.FieldLabel>
                                        <S.FieldInput
                                            type="text"
                                            placeholder="Ex: 750,00"
                                            value={proposalForm.customPrice}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProposalForm((f) => ({ ...f, customPrice: e.target.value }))}
                                            disabled={isSendingProposal}
                                            required
                                        />
                                    </S.Field>
                                </S.FieldRow>

                                <S.Field>
                                    <S.FieldLabel>Observações (opcional)</S.FieldLabel>
                                    <S.FieldInput
                                        as="textarea"
                                        placeholder="Condições do acordo..."
                                        value={proposalForm.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProposalForm((f) => ({ ...f, notes: e.target.value }))}
                                        disabled={isSendingProposal}
                                    />
                                </S.Field>

                                <S.AdminButtons>
                                    <S.PrimaryButton
                                        type="submit"
                                        disabled={isSendingProposal || !proposalForm.date}
                                    >
                                        {isSendingProposal ? "Enviando..." : "Enviar proposta"}
                                    </S.PrimaryButton>
                                    <S.DangerButton
                                        type="button"
                                        onClick={() => handleStatusUpdate("REJECTED")}
                                        disabled={isUpdatingStatus}
                                    >
                                        Recusar negociação
                                    </S.DangerButton>
                                </S.AdminButtons>
                            </S.AdminForm>
                        </>
                    )}
                </S.AdminPanel>
            )}
        </div>
    );
}
