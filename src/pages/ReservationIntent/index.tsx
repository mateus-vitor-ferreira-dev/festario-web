import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import Input from "../../components/Input";
import { getVenue } from "../../services/venue";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import { animateFadeInUp } from "../../utils/animations";
import { formatCents } from "../../utils/reservationFormat";
import { describeWindow, formatBRL, formatHours } from "../../utils/packageFormat";
import type { Venue, VenuePackage } from "../../types";

import { bookingDateRange, choosableItems, useReservationForm } from "./useReservationForm";
import { AddonsSelector } from "./components/AddonsSelector";
import { ContractSection } from "./components/ContractSection";
import { PackageSelector } from "./components/PackageSelector";
import { ReservationSummary } from "./components/ReservationSummary";
import * as S from "./styles";

/** "48 horas", "3 dias". */
function leadText(hours: number): string {
    return hours % 24 === 0 ? `${hours / 24} dia${hours === 24 ? "" : "s"}` : `${hours} horas`;
}

/** Regras de horário do pacote em uma frase: "Das 10:00 às 18:00, de 2h a 5h de festa." */
function scheduleText(pkg: VenuePackage): string {
    const { minDurationMinutes: min, maxDurationMinutes: max } = pkg;
    const duration = min && max ? `de ${formatHours(min)} a ${formatHours(max)} de festa`
        : max ? `até ${formatHours(max)} de festa`
            : min ? `pelo menos ${formatHours(min)} de festa` : null;
    return `${describeWindow(pkg.earliestStartMinute, pkg.latestEndMinute)}${duration ? `, ${duration}` : ""}.`;
}

export default function ReservationIntent() {
    const { venueId } = useParams();
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
                if (isAbortError(error)) return;
                toast.error(getErrorMessage(error, "Erro ao carregar os dados do salão."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        if (venueId) loadVenue();
        return () => controller.abort();
    }, [venueId]);

    const form = useReservationForm({ venueId });

    useGSAP(() => {
        if (loading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-top"));
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

    const range = bookingDateRange(form.tenant);
    const pkg = form.selectedPackage;
    const guestLimit = Math.min(pkg?.maxGuests ?? Infinity, venue.capacity || Infinity);

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
                            Escolha a data, o pacote, o horário e os convidados. O orçamento sai na hora, com tudo o que está incluso.
                        </S.PageDescription>
                    </div>

                    <S.EstimatedCard>
                        <span>{form.quote ? "Valor da reserva" : "Valor estimado"}</span>
                        <strong>
                            {form.quoteLoading
                                ? "Calculando..."
                                : form.quote
                                    ? formatCents(form.quote.totalCents)
                                    : pkg
                                        ? `a partir de ${formatBRL(pkg.basePriceAmount)}`
                                        : "—"}
                        </strong>
                        <small>{pkg ? pkg.name : "Escolha um pacote"}</small>
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
                            <S.CardTitle>Data do evento</S.CardTitle>
                            <S.CardDescription>
                                Escolha um dia disponível no calendário. Dias reservados ou bloqueados não podem ser selecionados — veja a legenda abaixo.
                            </S.CardDescription>
                            <AvailabilityCalendar
                                venueId={venueId ?? ""}
                                selectedDate={form.eventDate}
                                onChange={form.handleDateChange}
                                minDate={range.min}
                                maxDate={range.max}
                            />
                            {form.tenant?.minLeadHours ? (
                                <S.Hint>Este salão recebe reservas com pelo menos {leadText(form.tenant.minLeadHours)} de antecedência.</S.Hint>
                            ) : null}
                        </S.Card>

                        <PackageSelector
                            packages={form.packages}
                            loading={form.packagesLoading}
                            eventDate={form.eventDate}
                            isHoliday={form.isHoliday}
                            selectedId={pkg?.id ?? null}
                            onSelect={form.selectPackage}
                        />

                        <S.Card className="anim-card">
                            <S.CardTitle>Horário e convidados</S.CardTitle>
                            <S.CardDescription>
                                {pkg ? scheduleText(pkg) : "O horário permitido depende do pacote escolhido."}
                            </S.CardDescription>
                            <S.FormRow>
                                <Input
                                    id="startTime"
                                    label="Início"
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) => form.setStartTime(e.target.value)}
                                />
                                <Input
                                    id="endTime"
                                    label="Término"
                                    type="time"
                                    value={form.endTime}
                                    onChange={(e) => form.setEndTime(e.target.value)}
                                />
                                <Input
                                    id="guestCount"
                                    label="Convidados"
                                    type="number"
                                    inputMode="numeric"
                                    min={pkg?.minGuests ?? 1}
                                    max={Number.isFinite(guestLimit) ? guestLimit : undefined}
                                    value={form.guests}
                                    onChange={(e) => form.setGuests(e.target.value.replace(/\D/g, ""))}
                                    placeholder={Number.isFinite(guestLimit) ? `até ${guestLimit}` : "quantas pessoas"}
                                />
                            </S.FormRow>
                            {form.endsNextDay && <S.Hint>O término é no dia seguinte: a festa passa da meia-noite.</S.Hint>}
                        </S.Card>

                        <AddonsSelector items={choosableItems(pkg)} addons={form.addons} onChange={form.setAddon} />

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
                            selectedPackage={pkg}
                            eventDate={form.eventDate}
                            startTime={form.startTime}
                            endTime={form.endTime}
                            endsNextDay={form.endsNextDay}
                            guests={form.guests}
                            quote={form.quote}
                            quoteError={form.quoteError}
                            quoteLoading={form.quoteLoading}
                            missing={form.missing}
                        />

                        <S.ActionCard className="anim-card">
                            <S.ConfirmButton
                                type="button"
                                onClick={form.handleConfirmReservation}
                                disabled={form.submitting || !form.quote || Boolean(form.quoteError) || !form.acceptedContract}
                            >
                                {form.submitting ? "Confirmando reserva..." : "Confirmar e ir para pagamento"}
                            </S.ConfirmButton>

                            <ContractSection
                                payload={form.quotePayload}
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
