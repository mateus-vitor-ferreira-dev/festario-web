import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import PaymentMeter from "../../components/PaymentMeter";
import { getReservation } from "../../services/reservation";
import { getReservationPayment } from "../../services/payment";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import { packageLabel, formatDate, formatDateFull, formatTime, formatCents, calcDuration } from "../../utils/reservationFormat";
import { METHOD_LABELS, formatDeadline, instagramLink, whatsappLink } from "../../utils/paymentFormat";
import { animateFadeInUp } from "../../utils/animations";
import type { Reservation, ReservationPayment } from "../../types";
import * as S from "./styles";

/** Mensagem pronta para o WhatsApp do salão. */
function whatsappMessage(reservation: Reservation, payment: ReservationPayment): string {
    const what = payment.reservationStatus === "PENDING"
        ? `pagar ${payment.depositCents != null ? `o sinal de ${formatCents(payment.depositCents)}` : formatCents(payment.summary.totalCents)}`
        : `pagar o restante de ${formatCents(payment.summary.balanceCents)}`;
    return `Olá! Quero ${what} da minha reserva no ${reservation.venue?.name ?? "salão"} em ${formatDate(reservation.startDate)} (${packageLabel(reservation)}). Código: ${reservation.id.slice(0, 8)}.`;
}

/** O que a pessoa precisa saber primeiro, pelo estado do dinheiro da reserva. */
function headline(p: ReservationPayment): { title: string; text: string; tone: "pending" | "paid" | "neutral" } {
    const { summary } = p;
    if (p.reservationStatus === "PENDING") {
        const amount = formatCents(summary.missingToConfirmCents);
        return {
            title: "Combine o pagamento com o salão",
            text: summary.netCents > 0
                ? `O salão já registrou ${formatCents(summary.netCents)}. Faltam ${amount} para confirmar a reserva.`
                : `Para confirmar a reserva, o salão precisa receber ${amount}${p.depositCents != null ? " de sinal" : ""}.`,
            tone: "pending",
        };
    }
    if (p.reservationStatus === "PAID") {
        return summary.balanceCents > 0
            ? { title: "Reserva confirmada", text: `O salão recebeu o sinal. Falta o restante: ${formatCents(summary.balanceCents)}${p.balanceDueAt ? `, até ${formatDate(p.balanceDueAt)}` : ""}.`, tone: "paid" }
            : { title: "Reserva confirmada e quitada", text: "O salão recebeu o valor total. Até a festa!", tone: "paid" };
    }
    if (p.reservationStatus === "CANCELLED") {
        const due = p.refundDueCents ?? 0;
        if (summary.paidCents === 0) return { title: "Reserva cancelada", text: "Nada foi pago, então não há o que devolver.", tone: "neutral" };
        if (due === 0) return { title: "Reserva cancelada", text: "Pela política de cancelamento desta reserva, não há devolução.", tone: "neutral" };
        return summary.refundedCents >= due
            ? { title: "Reserva cancelada", text: `O salão registrou a devolução de ${formatCents(summary.refundedCents)}.`, tone: "neutral" }
            : { title: "Reserva cancelada", text: `Pela política, você recebe ${formatCents(due)} de volta (${p.refundPercentage}%). O salão faz a devolução${summary.refundedCents > 0 ? `; já devolveu ${formatCents(summary.refundedCents)}` : ""}.`, tone: "neutral" };
    }
    return { title: "Reserva expirada", text: "O pagamento não foi registrado no prazo e a data voltou a ficar livre.", tone: "neutral" };
}

/**
 * Pagamento da reserva. Não há cobrança online: o cliente paga direto ao salão, que registra o que
 * recebeu. A tela mostra quanto confirma a reserva (o sinal ou o total), o prazo, como pagar (o texto do
 * salão e os contatos) e os pagamentos já registrados.
 *
 * @see GET /reservations/:id
 * @see GET /payments/reservation/:id
 * @component
 */
export default function Checkout() {
    const { reservationId } = useParams<{ reservationId: string }>();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [payment, setPayment] = useState<ReservationPayment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                setIsLoading(true);
                const [r, p] = await Promise.all([
                    getReservation(reservationId!, controller.signal),
                    getReservationPayment(reservationId!, null, controller.signal),
                ]);
                setReservation(r);
                setPayment(p);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error(getErrorMessage(error, "Erro ao carregar a reserva."));
                navigate("/reservations");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }
        if (reservationId) load();
        return () => controller.abort();
    }, [reservationId, navigate]);

    useGSAP(() => {
        if (isLoading || !reservation || !containerRef.current) return;
        animateFadeInUp(containerRef.current.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [isLoading, reservation] });

    if (isLoading) {
        return (
            <S.Container>
                <S.LoadingState>
                    <S.Spinner />
                    <p>Carregando dados da reserva...</p>
                </S.LoadingState>
            </S.Container>
        );
    }

    if (!reservation || !payment) return null;

    const { summary } = payment;
    const head = headline(payment);
    const duration = calcDuration(reservation.startDate, reservation.endDate);
    const contacts = payment.instructions;
    const wa = contacts?.whatsapp ? whatsappLink(contacts.whatsapp, whatsappMessage(reservation, payment)) : null;
    const open = payment.reservationStatus === "PENDING" || (payment.reservationStatus === "PAID" && summary.balanceCents > 0);
    const hasContact = Boolean(wa || contacts?.instagram || contacts?.phone || contacts?.email);

    return (
        <S.Container ref={containerRef}>
            <S.PageHeader className="anim-header">
                <S.PageTitle>Pagamento da reserva</S.PageTitle>
                <S.PageDescription>
                    O pagamento é combinado direto com {payment.tenant?.name ?? "o salão"}. Assim que o salão registrar o que recebeu, a reserva é confirmada e você recebe o aviso por e-mail e WhatsApp.
                </S.PageDescription>
            </S.PageHeader>

            <S.Grid>
                <S.Column>
                    <S.SummaryCard>
                        <S.SummaryHeader>
                            <S.VenueName>{reservation.venue?.name}</S.VenueName>
                            <S.StatusBadge status={reservation.status}>
                                {{ PENDING: "Aguardando pagamento", PAID: "Confirmada", CANCELLED: "Cancelada", EXPIRED: "Expirada" }[reservation.status] ?? reservation.status}
                            </S.StatusBadge>
                        </S.SummaryHeader>

                        <S.Divider />

                        <S.DetailList>
                            <S.DetailItem>
                                <S.DetailLabel>Pacote</S.DetailLabel>
                                <S.DetailValue>{packageLabel(reservation)}</S.DetailValue>
                            </S.DetailItem>
                            <S.DetailItem>
                                <S.DetailLabel>Data do evento</S.DetailLabel>
                                <S.DetailValue>{formatDateFull(reservation.startDate)}</S.DetailValue>
                            </S.DetailItem>
                            <S.DetailItem>
                                <S.DetailLabel>Horário</S.DetailLabel>
                                <S.DetailValue>{formatTime(reservation.startDate)} às {formatTime(reservation.endDate)} ({duration}h)</S.DetailValue>
                            </S.DetailItem>
                            {reservation.guestCount ? (
                                <S.DetailItem>
                                    <S.DetailLabel>Convidados</S.DetailLabel>
                                    <S.DetailValue>{reservation.guestCount}</S.DetailValue>
                                </S.DetailItem>
                            ) : null}
                            <S.DetailItem>
                                <S.DetailLabel>Código da reserva</S.DetailLabel>
                                <S.DetailValue>{reservation.id.slice(0, 8)}</S.DetailValue>
                            </S.DetailItem>
                        </S.DetailList>

                        <S.Divider />

                        <S.TotalRow>
                            <S.TotalLabel>Valor da reserva</S.TotalLabel>
                            <S.TotalValue>{formatCents(summary.totalCents)}</S.TotalValue>
                        </S.TotalRow>
                    </S.SummaryCard>

                    <S.SummaryCard as="section" aria-labelledby="entries-title">
                        <S.SectionTitle id="entries-title">Pagamentos registrados pelo salão</S.SectionTitle>
                        {payment.entries.length === 0 ? (
                            <S.Muted>Nenhum ainda. Depois de pagar, o salão registra aqui e a reserva é atualizada.</S.Muted>
                        ) : (
                            <S.EntryList>
                                {payment.entries.map((e) => (
                                    <S.EntryItem key={e.id} $refund={e.kind === "REFUND"}>
                                        <div>
                                            <strong>{e.kind === "REFUND" ? "Devolução" : "Pagamento"} · {METHOD_LABELS[e.method]}</strong>
                                            <span>{formatDate(e.paidAt)}{e.note ? ` — ${e.note}` : ""}</span>
                                        </div>
                                        <S.EntryAmount $refund={e.kind === "REFUND"}>{e.kind === "REFUND" ? "−" : ""}{formatCents(e.amountCents)}</S.EntryAmount>
                                    </S.EntryItem>
                                ))}
                            </S.EntryList>
                        )}
                    </S.SummaryCard>
                </S.Column>

                <S.PaymentCard aria-labelledby="pay-title">
                    <S.Headline $tone={head.tone}>
                        <S.PaymentTitle id="pay-title">{head.title}</S.PaymentTitle>
                        <p>{head.text}</p>
                    </S.Headline>

                    <PaymentMeter totalCents={summary.totalCents} netCents={summary.netCents} requiredCents={summary.requiredCents} />

                    <S.AmountList>
                        {payment.depositCents != null && (
                            <div><dt>Sinal (confirma a reserva)</dt><dd>{formatCents(payment.depositCents)}</dd></div>
                        )}
                        <div><dt>Recebido pelo salão</dt><dd>{formatCents(summary.netCents)}</dd></div>
                        {payment.reservationStatus !== "CANCELLED" && payment.reservationStatus !== "EXPIRED" && (
                            <div><dt>Falta pagar</dt><dd>{formatCents(summary.balanceCents)}</dd></div>
                        )}
                        {payment.balanceDueAt && summary.balanceCents > 0 && payment.reservationStatus !== "CANCELLED" && (
                            <div><dt>Restante até</dt><dd>{formatDate(payment.balanceDueAt)}</dd></div>
                        )}
                    </S.AmountList>

                    {payment.confirmBy && (
                        <S.Deadline role="note">
                            <strong>Prazo: {formatDeadline(payment.confirmBy)}</strong>
                            <span>Se o salão não registrar o pagamento até lá, a reserva expira e a data volta a ficar livre.</span>
                        </S.Deadline>
                    )}

                    {open && (
                        <S.HowToPay aria-labelledby="how-title">
                            <S.SectionTitle as="h3" id="how-title">Como pagar</S.SectionTitle>
                            {contacts?.text
                                ? <S.Instructions>{contacts.text}</S.Instructions>
                                : <S.Muted>O salão combina a forma de pagamento com você. Fale com ele pelos contatos abaixo.</S.Muted>}
                            {hasContact && (
                                <S.ContactActions>
                                    {wa && <S.PrimaryAction href={wa} target="_blank" rel="noopener noreferrer">Combinar pelo WhatsApp</S.PrimaryAction>}
                                    {contacts?.instagram && <S.SecondaryAction href={instagramLink(contacts.instagram)} target="_blank" rel="noopener noreferrer">Instagram {contacts.instagram}</S.SecondaryAction>}
                                    {contacts?.phone && <S.SecondaryAction href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}>Ligar {contacts.phone}</S.SecondaryAction>}
                                    {contacts?.email && <S.SecondaryAction href={`mailto:${contacts.email}`}>E-mail</S.SecondaryAction>}
                                </S.ContactActions>
                            )}
                        </S.HowToPay>
                    )}

                    <S.CancelLink onClick={() => navigate("/reservations")}>
                        Voltar para minhas reservas
                    </S.CancelLink>
                </S.PaymentCard>
            </S.Grid>
        </S.Container>
    );
}
