import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    INCLUDED_KIDS_HOURS_BY_PLAN,
    PLANS,
    getBlockedPlanMessage,
    isPlanAvailableForDate,
} from "../../constants/reservation";
import { createReservation, quoteReservation } from "../../services/reservation";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import type { QuoteResult, PlanCode } from "../../types";

/** Items da cotação com campos extras retornados pela API */
interface QuoteItem {
    description: string;
    amountCents: number;
    type?: string;
    totalAmountCents?: number;
    totalCents?: number;
    unitAmountCents?: number;
}

interface ExtendedQuoteResult extends Omit<QuoteResult, "items"> {
    items: QuoteItem[];
}

export interface UseReservationFormReturn {
    planCode: PlanCode | "";
    eventDate: string;
    startTime: string;
    setStartTime: Dispatch<SetStateAction<string>>;
    endTime: string;
    setEndTime: Dispatch<SetStateAction<string>>;
    kidsMonitorHours: number;
    setKidsMonitorHours: Dispatch<SetStateAction<number>>;
    notes: string;
    setNotes: Dispatch<SetStateAction<string>>;
    acceptedContract: boolean;
    setAcceptedContract: Dispatch<SetStateAction<boolean>>;
    selectedPlan: typeof PLANS[number] | null;
    normalizedQuote: ExtendedQuoteResult | null;
    quoteLoading: boolean;
    submitting: boolean;
    minimumKidsHours: number;
    kidsMonitorExtraHours: number;
    planIsIncompatible: boolean;
    handlePlanClick: (code: PlanCode) => void;
    handleDateChange: (newDate: string) => void;
    handleConfirmReservation: () => Promise<void>;
}

/**
 * Gerencia todo o estado do formulário de intenção de reserva e a cotação automática.
 *
 * @param {{ venueId: string, hasKidsArea: boolean }} params
 */
export function useReservationForm({ venueId, hasKidsArea }: { venueId: string | undefined; hasKidsArea: boolean }): UseReservationFormReturn {
    const navigate = useNavigate();

    const [planCode, setPlanCode] = useState<PlanCode | "">("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [kidsMonitorHours, setKidsMonitorHours] = useState(0);
    const [notes, setNotes] = useState("");
    const [acceptedContract, setAcceptedContract] = useState(false);

    const [quote, setQuote] = useState<ExtendedQuoteResult | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!hasKidsArea) return;
        const includedHours = planCode ? INCLUDED_KIDS_HOURS_BY_PLAN[planCode] : 0;
        setKidsMonitorHours((current) => {
            if (!planCode) return 0;
            return current < includedHours ? includedHours : current;
        });
    }, [planCode, hasKidsArea]);

    const minimumKidsHours = planCode ? INCLUDED_KIDS_HOURS_BY_PLAN[planCode] : 0;
    const kidsMonitorExtraHours = Math.max(0, kidsMonitorHours - minimumKidsHours);

    useEffect(() => {
        if (!planCode || !eventDate || !startTime || !endTime || !venueId) {
            setQuote(null);
            return;
        }

        const controller = new AbortController();
        if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);

        quoteTimerRef.current = setTimeout(async () => {
            const startDate = new Date(`${eventDate}T${startTime}:00`);
            const endDate = new Date(`${eventDate}T${endTime}:00`);

            if (endDate <= startDate) {
                setQuote(null);
                return;
            }

            try {
                setQuoteLoading(true);
                const result = await quoteReservation(
                    {
                        venueId,
                        planCode,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        ...(kidsMonitorExtraHours > 0 && { kidsMonitorExtraHours }),
                    },
                    controller.signal
                );
                if (!controller.signal.aborted) setQuote(result);
            } catch (error) {
                if (isAbortError(error)) return;
                if (!controller.signal.aborted) {
                    toast.error(getErrorMessage(error, "Erro ao calcular orçamento."));
                    setQuote(null);
                }
            } finally {
                if (!controller.signal.aborted) setQuoteLoading(false);
            }
        }, 600);

        return () => {
            if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
            controller.abort();
        };
    }, [planCode, eventDate, startTime, endTime, kidsMonitorExtraHours, venueId]);

    const selectedPlan = PLANS.find((p) => p.code === planCode) ?? null;

    // O plano COMPLETA tem preço base fixo de R$ 1.000 — normaliza caso a API retorne
    // valor diferente por desconto ou promoção ativa no plano base.
    const normalizedQuote = (() => {
        if (!quote || planCode !== "COMPLETA") return quote;
        const TARGET_BASE_CENTS = 100000;
        const planBaseItem = quote.items?.find((item) => item.type === "PLAN_BASE");
        const currentBase =
            planBaseItem?.totalAmountCents ?? planBaseItem?.totalCents ?? selectedPlan?.priceCents ?? TARGET_BASE_CENTS;
        const diff = TARGET_BASE_CENTS - currentBase;
        if (diff === 0) return quote;
        return {
            ...quote,
            items: (quote.items ?? []).map((item) =>
                item.type === "PLAN_BASE"
                    ? { ...item, unitAmountCents: TARGET_BASE_CENTS, totalAmountCents: TARGET_BASE_CENTS }
                    : item
            ),
            subtotalCents: Number(quote.subtotalCents ?? 0) + diff,
            totalCents: Number(quote.totalCents ?? 0) + diff,
        };
    })();

    const planIsIncompatible = Boolean(planCode && eventDate && !isPlanAvailableForDate(planCode, eventDate));

    function handlePlanClick(code: PlanCode) {
        if (eventDate && !isPlanAvailableForDate(code, eventDate)) {
            toast.warning(getBlockedPlanMessage(code, eventDate));
            return;
        }
        setPlanCode(code);
    }

    function handleDateChange(newDate: string) {
        setEventDate(newDate);
        if (planCode && !isPlanAvailableForDate(planCode, newDate)) {
            setPlanCode("");
            toast.info("A data alterada não é compatível com o plano anterior. Selecione uma modalidade.");
        }
    }

    async function handleConfirmReservation() {
        if (!venueId) return;
        if (!planCode) { toast.warning("Selecione um plano."); return; }
        if (!eventDate) { toast.warning("Selecione a data do evento."); return; }
        if (!startTime) { toast.warning("Selecione o horário de início."); return; }
        if (!endTime) { toast.warning("Selecione o horário de término."); return; }

        const startDate = new Date(`${eventDate}T${startTime}:00`);
        const endDate = new Date(`${eventDate}T${endTime}:00`);

        if (endDate <= startDate) { toast.warning("O horário de término deve ser posterior ao de início."); return; }
        if (!isPlanAvailableForDate(planCode, eventDate)) { toast.warning(getBlockedPlanMessage(planCode, eventDate)); return; }
        if (!acceptedContract) { toast.warning("Aceite o contrato para continuar."); return; }

        try {
            setSubmitting(true);
            const reservation = await createReservation({
                venueId,
                planCode,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                termsAccepted: true,
                ...(notes.trim() && { notes: notes.trim() }),
                ...(kidsMonitorExtraHours > 0 && { kidsMonitorExtraHours }),
            });
            toast.success("Reserva criada com sucesso! Redirecionando para o pagamento...");
            navigate(`/checkout/${reservation.id}`);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao confirmar a reserva."));
        } finally {
            setSubmitting(false);
        }
    }

    return {
        planCode,
        eventDate,
        startTime, setStartTime,
        endTime, setEndTime,
        kidsMonitorHours, setKidsMonitorHours,
        notes, setNotes,
        acceptedContract, setAcceptedContract,
        selectedPlan,
        normalizedQuote,
        quoteLoading,
        submitting,
        minimumKidsHours,
        kidsMonitorExtraHours,
        planIsIncompatible,
        handlePlanClick,
        handleDateChange,
        handleConfirmReservation,
    };
}
