import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { getReservation } from "../../services/reservation";
import { createCheckoutSession, getPaymentStatus } from "../../services/payment";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { PLAN_LABELS, formatDateFull, formatTime, formatCurrency, calcDuration } from "../../utils/reservationFormat";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import type { Reservation, PixChargeResult } from "../../types";
import * as S from "./styles";

/**
 * Página de checkout para uma reserva pendente de pagamento.
 *
 * Carrega os detalhes da reserva pelo `reservationId` da URL e oferece duas opções:
 * - **Stripe** (cartão): chama `createCheckoutSession` e redireciona para o Stripe Checkout
 * - **PIX** (Mercado Pago): chama `createPixCharge`, exibe QR Code e faz polling do status
 *   até PAID ou CANCELLED com `getPaymentStatus`
 *
 * @see GET /reservations/:id
 * @see POST /payment/checkout-session
 * @see POST /payment/pix
 * @see GET /payment/status/:paymentId
 * @component
 */
export default function Checkout() {
    const { reservationId } = useParams<{ reservationId: string }>();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [pixData, setPixData] = useState<PixChargeResult | null>(null);
    const [pixStep, setPixStep] = useState("select");
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadReservation() {
            try {
                setIsLoading(true);
                const data = await getReservation(reservationId!, controller.signal);
                setReservation(data);
            } catch (error) {
                if ((error as { name?: string })?.name === "CanceledError" || (error as { name?: string })?.name === "AbortError") return;
                toast.error(getErrorMessage(error, "Erro ao carregar a reserva."));
                navigate("/reservations");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        if (reservationId) {
            loadReservation();
        }

        return () => controller.abort();
    }, [reservationId, navigate]);

    // Restaura o QR Code se o usuário recarregar a página com um PIX pendente
    useEffect(() => {
        if (!reservation) return;
        const p = reservation.payment;
        if (
            reservation.status === "PENDING" &&
            p?.status === "PENDING" &&
            p?.pixTxId &&
            p?.pixQrCode &&
            p?.pixExpiresAt &&
            new Date(p.pixExpiresAt) > new Date()
        ) {
            setPixData({
                txid: p.pixTxId,
                qrCode: p.pixQrCode,
                copyPaste: p.pixCopyPaste ?? "",
                expiresAt: p.pixExpiresAt,
            });
            setPixStep("qr");
        }
    }, [reservation]);

    // Polling de status quando QR Code está sendo exibido.
    // Para automaticamente na expiração do PIX, após 5 erros consecutivos,
    // ou quando o status muda para PAID/EXPIRED/CANCELLED.
    useEffect(() => {
        if (pixStep !== "qr" || !pixData || !reservationId) return;

        const controller = new AbortController();
        let consecutiveErrors = 0;
        const MAX_ERRORS = 5;
        const expiresAt = pixData.expiresAt ? new Date(pixData.expiresAt).getTime() : Infinity;

        const interval = setInterval(async () => {
            if (Date.now() >= expiresAt) {
                clearInterval(interval);
                toast.info("O código PIX expirou. Volte para suas reservas e tente novamente.");
                navigate("/reservations");
                return;
            }

            try {
                const result = await getPaymentStatus(reservationId, controller.signal);
                consecutiveErrors = 0;

                if (result?.payment?.status === "PAID") {
                    clearInterval(interval);
                    navigate("/payment/success");
                    return;
                }
                if (["EXPIRED", "CANCELLED"].includes(result?.reservationStatus)) {
                    clearInterval(interval);
                    navigate("/reservations");
                }
            } catch (err) {
                if ((err as { name?: string })?.name === "CanceledError" || (err as { name?: string })?.name === "AbortError") return;
                consecutiveErrors += 1;
                if (consecutiveErrors >= MAX_ERRORS) {
                    clearInterval(interval);
                    toast.error("Não foi possível verificar o status do pagamento. Acesse 'Minhas reservas' para confirmar.");
                }
            }
        }, 7000);

        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [pixStep, pixData, reservationId, navigate]);

    async function handleProceedToPayment() {
        if (!reservation) return;
        try {
            setIsRedirecting(true);

            if (reservation.checkoutUrl) {
                window.location.href = reservation.checkoutUrl;
                return;
            }

            const session = await createCheckoutSession(reservationId!);
            window.location.href = session.url;
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;

            if (status === 409) {
                toast.error("Já existe uma sessão de pagamento ativa para esta reserva. Verifique seu e-mail ou aguarde a expiração.");
            } else {
                toast.error(getErrorMessage(error, "Erro ao iniciar o pagamento."));
            }

            setIsRedirecting(false);
        }
    }

    async function handleCopyCopyPaste() {
        if (!pixData) return;
        try {
            await navigator.clipboard.writeText(pixData.copyPaste);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch {
            toast.error("Não foi possível copiar o código.");
        }
    }

    useGSAP(() => {
        if (isLoading || !reservation || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-header"));
        animateStagger(el.querySelectorAll(".anim-card"), { delay: 0.15 });
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

    if (!reservation) {
        return null;
    }

    const isPendingPayment = reservation.status === "PENDING";
    const duration = calcDuration(reservation.startDate, reservation.endDate);

    return (
        <S.Container ref={containerRef}>
            <S.PageHeader className="anim-header">
                <S.PageTitle>Finalizar pagamento</S.PageTitle>
                <S.PageDescription>
                    Revise os detalhes da sua reserva antes de prosseguir para o pagamento seguro.
                </S.PageDescription>
            </S.PageHeader>

            <S.Grid>
                <S.SummaryCard className="anim-card">
                    <S.SummaryHeader>
                        <S.VenueName>{reservation.venue?.name}</S.VenueName>
                        <S.StatusBadge status={reservation.status}>
                            {reservation.status === "PENDING" ? "Aguardando pagamento" : reservation.status}
                        </S.StatusBadge>
                    </S.SummaryHeader>

                    <S.Divider />

                    <S.DetailList>
                        {reservation.planCode && (
                            <S.DetailItem>
                                <S.DetailLabel>Plano</S.DetailLabel>
                                <S.DetailValue>{PLAN_LABELS[reservation.planCode] || reservation.planCode}</S.DetailValue>
                            </S.DetailItem>
                        )}

                        <S.DetailItem>
                            <S.DetailLabel>Data do evento</S.DetailLabel>
                            <S.DetailValue>{formatDateFull(reservation.startDate)}</S.DetailValue>
                        </S.DetailItem>

                        <S.DetailItem>
                            <S.DetailLabel>Início</S.DetailLabel>
                            <S.DetailValue>{formatTime(reservation.startDate)}</S.DetailValue>
                        </S.DetailItem>

                        <S.DetailItem>
                            <S.DetailLabel>Término</S.DetailLabel>
                            <S.DetailValue>{formatTime(reservation.endDate)}</S.DetailValue>
                        </S.DetailItem>

                        <S.DetailItem>
                            <S.DetailLabel>Duração</S.DetailLabel>
                            <S.DetailValue>{duration} hora{duration !== 1 ? "s" : ""}</S.DetailValue>
                        </S.DetailItem>
                    </S.DetailList>

                    <S.Divider />

                    <S.TotalRow>
                        <S.TotalLabel>Total a pagar</S.TotalLabel>
                        <S.TotalValue>{formatCurrency(reservation.totalPrice)}</S.TotalValue>
                    </S.TotalRow>
                </S.SummaryCard>

                <S.PaymentCard className="anim-card">
                    <S.PaymentTitle>Pagamento seguro</S.PaymentTitle>

                    {isPendingPayment && pixStep === "select" && (
                        <>
                            <S.PaymentDescription>
                                Pague com segurança via cartão de crédito.
                            </S.PaymentDescription>

                            <S.SecurityBadges>
                                <S.SecurityItem>
                                    <S.SecurityDot />
                                    Criptografia SSL de ponta a ponta
                                </S.SecurityItem>
                                <S.SecurityItem>
                                    <S.SecurityDot />
                                    Pagamento processado pelo Stripe
                                </S.SecurityItem>
                            </S.SecurityBadges>

                            <S.AmountSummary>
                                <span>Total</span>
                                <strong>{formatCurrency(reservation.totalPrice)}</strong>
                            </S.AmountSummary>

                            <S.PayButton onClick={handleProceedToPayment} disabled={isRedirecting}>
                                {isRedirecting ? "Redirecionando..." : "Pagar com Cartão"}
                            </S.PayButton>
                        </>
                    )}

                    {isPendingPayment && pixStep === "qr" && pixData && (
                        <>
                            <S.PaymentDescription>
                                Escaneie o QR Code ou copie o código PIX abaixo. O pagamento é confirmado automaticamente.
                            </S.PaymentDescription>

                            <S.AmountSummary>
                                <span>Total</span>
                                <strong>{formatCurrency(reservation.totalPrice)}</strong>
                            </S.AmountSummary>

                            <S.PixContainer>
                                <S.PixQrImage
                                    src={`data:image/png;base64,${pixData.qrCode}`}
                                    alt="QR Code PIX"
                                />

                                <S.PixCopyPasteBox>
                                    <S.PixCopyPasteLabel>Código Copia e Cola</S.PixCopyPasteLabel>
                                    <S.PixCopyPasteValue>{pixData.copyPaste}</S.PixCopyPasteValue>
                                    <S.CopyButton onClick={handleCopyCopyPaste}>
                                        {isCopied ? "Copiado!" : "Copiar código"}
                                    </S.CopyButton>
                                </S.PixCopyPasteBox>

                                <S.PixStatus>Aguardando confirmação do pagamento...</S.PixStatus>

                                <S.PixExpiry>
                                    Expira em: {new Date(pixData.expiresAt).toLocaleTimeString("pt-BR")}
                                </S.PixExpiry>
                            </S.PixContainer>
                        </>
                    )}

                    {!isPendingPayment && (
                        <S.InfoBox>
                            Esta reserva não está disponível para pagamento (status: {reservation.status}).
                        </S.InfoBox>
                    )}

                    <S.CancelLink onClick={() => navigate("/reservations")}>
                        Voltar para minhas reservas
                    </S.CancelLink>

                    <S.StripeBadge>
                        Pagamento processado com segurança
                    </S.StripeBadge>
                </S.PaymentCard>
            </S.Grid>
        </S.Container>
    );
}
