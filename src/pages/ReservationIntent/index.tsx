import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import Input from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import { getVenue } from "../../services/venue";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import { formatCents } from "../../utils/reservationFormat";
import type { Venue } from "../../types";

import { useReservationForm } from "./useReservationForm";
import { ContractSection } from "./components/ContractSection";
import { KidsMonitorInput } from "./components/KidsMonitorInput";
import { PlanSelector } from "./components/PlanSelector";
import { ReservationSummary } from "./components/ReservationSummary";
import * as S from "./styles";

export default function ReservationIntent() {
    const { venueId } = useParams();
    const { user } = useAuth();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadVenue() {
            try {
                setLoading(true);
                const data = await getVenue(venueId!, controller.signal);
                setVenue(data);
            } catch (error) {
                if ((error as {name?: string})?.name === "CanceledError" || (error as {name?: string})?.name === "AbortError") return;
                toast.error(getErrorMessage(error, "Erro ao carregar os dados do salão."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        if (venueId) loadVenue();
        return () => controller.abort();
    }, [venueId]);

    const form = useReservationForm({ venueId, hasKidsArea: venue?.hasKidsArea ?? false });

    useGSAP(() => {
        if (loading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-top"));
        animateStagger(el.querySelectorAll(".anim-card"), { delay: 0.15 });
    }, { scope: containerRef, dependencies: [loading] });

    if (loading) {
        return (
            <S.Container>
                <S.Content>
                    <S.PageTitle>Intenção de reserva</S.PageTitle>
                    <S.PageDescription>Carregando dados do salão...</S.PageDescription>
                </S.Content>
            </S.Container>
        );
    }

    if (!venue) {
        return (
            <S.Container>
                <S.Content>
                    <S.PageTitle>Intenção de reserva</S.PageTitle>
                    <S.PageDescription>Salão não encontrado.</S.PageDescription>
                </S.Content>
            </S.Container>
        );
    }

    const today = new Date().toISOString().split("T")[0];

    const contratoProps = {
        locatario: user?.name ?? "",
        data: form.eventDate
            ? new Date(`${form.eventDate}T00:00:00`).toLocaleDateString("pt-BR")
            : "a definir",
        horarioInicio: form.startTime || "—",
        horarioFim: form.endTime || "—",
        comKids: Boolean(venue.hasKidsArea),
        comPiscina: form.planCode === "COMPLETA",
        planCode: form.planCode || "ESSENCIAL",
        totalCents: form.normalizedQuote?.totalCents ?? form.selectedPlan?.priceCents ?? undefined,
    };

    function handleOpenRoutes() {
        if (!venue!.location) {
            toast.info("Endereço do salão não disponível.");
            return;
        }
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue!.location)}`,
            "_blank"
        );
    }

    return (
        <S.Container ref={containerRef}>
            <S.Content>
                <S.TopSection className="anim-top">
                    <div>
                        <S.PageTitle>Intenção de reserva</S.PageTitle>
                        <S.PageDescription>
                            Escolha a data do evento, selecione a modalidade disponível e veja o valor da sua reserva.
                        </S.PageDescription>
                    </div>

                    <S.EstimatedCard>
                        <span>Valor estimado</span>
                        <strong>
                            {form.quoteLoading
                                ? "Calculando..."
                                : form.normalizedQuote
                                    ? formatCents(form.normalizedQuote.totalCents)
                                    : form.selectedPlan
                                        ? formatCents(form.selectedPlan.priceCents)
                                        : "—"}
                        </strong>
                        <small>{form.selectedPlan ? form.selectedPlan.label : "Selecione um plano"}</small>
                    </S.EstimatedCard>
                </S.TopSection>

                <S.Grid>
                    <S.LeftColumn>
                        <S.Card className="anim-card">
                            <S.CardTitle>{venue.name}</S.CardTitle>
                            <S.CardDescription>
                                {venue.description || "Salão principal para eventos e reservas"}
                            </S.CardDescription>
                            <S.InfoGrid>
                                <S.InfoBox>
                                    <span>Capacidade</span>
                                    <strong>{venue.capacity || 0} pessoas</strong>
                                </S.InfoBox>
                                <S.InfoBox>
                                    <span>Localização</span>
                                    <strong>{venue.location || "Endereço não informado"}</strong>
                                </S.InfoBox>
                            </S.InfoGrid>
                            <S.RouteButton type="button" onClick={handleOpenRoutes}>
                                Rotas
                            </S.RouteButton>
                        </S.Card>

                        <S.Card className="anim-card">
                            <S.CardTitle>Data e horário</S.CardTitle>
                            <S.CardDescription>
                                Selecione a data do evento no calendário. Datas em laranja já estão reservadas e datas em roxo estão bloqueadas.
                            </S.CardDescription>
                            <AvailabilityCalendar
                                venueId={venueId ?? ""}
                                selectedDate={form.eventDate}
                                onChange={form.handleDateChange}
                                minDate={today}
                            />
                            <S.FormRow style={{ marginTop: "16px" }}>
                                <Input
                                    id="startTime"
                                    label="Início"
                                    type="time"
                                    min="08:00"
                                    max="22:00"
                                    value={form.startTime}
                                    onChange={(e) => form.setStartTime(e.target.value)}
                                />
                                <Input
                                    id="endTime"
                                    label="Término"
                                    type="time"
                                    min="08:00"
                                    max="23:59"
                                    value={form.endTime}
                                    onChange={(e) => form.setEndTime(e.target.value)}
                                />
                            </S.FormRow>
                        </S.Card>

                        <PlanSelector
                            eventDate={form.eventDate}
                            planCode={form.planCode}
                            onPlanClick={form.handlePlanClick}
                        />

                        {venue.hasKidsArea && (
                            <KidsMonitorInput
                                kidsMonitorHours={form.kidsMonitorHours}
                                minimumKidsHours={form.minimumKidsHours}
                                onChange={form.setKidsMonitorHours}
                            />
                        )}

                        <S.Card className="anim-card">
                            <S.CardTitle>Observações</S.CardTitle>
                            <S.CardDescription>
                                Informe qualquer detalhe adicional para a sua reserva (opcional).
                            </S.CardDescription>
                            <S.NotesField
                                placeholder="Ex: festa infantil, decoração temática..."
                                value={form.notes}
                                onChange={(e) => form.setNotes(e.target.value)}
                                rows={3}
                            />
                        </S.Card>
                    </S.LeftColumn>

                    <S.RightColumn>
                        <ReservationSummary
                            venue={venue}
                            selectedPlan={form.selectedPlan}
                            eventDate={form.eventDate}
                            startTime={form.startTime}
                            endTime={form.endTime}
                            kidsMonitorHours={form.kidsMonitorHours}
                            normalizedQuote={form.normalizedQuote}
                            quoteLoading={form.quoteLoading}
                        />

                        <S.ActionCard className="anim-card">
                            <S.ConfirmButton
                                type="button"
                                onClick={form.handleConfirmReservation}
                                disabled={form.submitting || form.planIsIncompatible || !form.acceptedContract}
                            >
                                {form.submitting ? "Confirmando reserva..." : "Confirmar e ir para pagamento"}
                            </S.ConfirmButton>

                            <ContractSection
                                planCode={form.planCode}
                                eventDate={form.eventDate}
                                contratoProps={contratoProps}
                                acceptedContract={form.acceptedContract}
                                onAcceptedChange={form.setAcceptedContract}
                            />
                        </S.ActionCard>
                    </S.RightColumn>
                </S.Grid>
            </S.Content>
        </S.Container>
    );
}
