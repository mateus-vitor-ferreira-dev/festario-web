import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { createReservation, quoteReservation } from "../../services/reservation";
import { getPublicTenant, getVenuePackages } from "../../services/venue";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import type { PublicTenant, QuotePayload, QuoteResult, VenuePackage, VenuePackageItem } from "../../types";

/** Escolha de um adicional: horas (item por hora) ou marcado/desmarcado (valor fixo ou por convidado). */
export type AddonChoice = number | boolean;

export interface UseReservationFormReturn {
    tenant: PublicTenant | null;
    packages: VenuePackage[];
    packagesLoading: boolean;
    /** O dia escolhido é feriado (nacional ou do salão). */
    isHoliday: boolean;
    selectedPackage: VenuePackage | null;
    eventDate: string;
    startTime: string;
    setStartTime: Dispatch<SetStateAction<string>>;
    endTime: string;
    setEndTime: Dispatch<SetStateAction<string>>;
    guests: string;
    setGuests: Dispatch<SetStateAction<string>>;
    addons: Record<string, AddonChoice>;
    setAddon: (itemId: string, value: AddonChoice) => void;
    notes: string;
    setNotes: Dispatch<SetStateAction<string>>;
    acceptedContract: boolean;
    setAcceptedContract: Dispatch<SetStateAction<boolean>>;
    /** Corpo do orçamento e da prévia do contrato; nulo enquanto falta pacote, data, horário ou convidados. */
    quotePayload: QuotePayload | null;
    /** O que ainda falta para o orçamento, em palavras. */
    missing: string[];
    quote: QuoteResult | null;
    quoteError: string | null;
    quoteLoading: boolean;
    submitting: boolean;
    endsNextDay: boolean;
    selectPackage: (pkg: VenuePackage) => void;
    handleDateChange: (newDate: string) => void;
    handleConfirmReservation: () => Promise<void>;
}

/** `YYYY-MM-DD` de hoje + `days`, no fuso do navegador. */
function dayFromToday(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Primeiro e último dia que o salão aceita (#45: antecedência mínima e horizonte). */
export function bookingDateRange(tenant: PublicTenant | null): { min: string; max?: string } {
    const leadDays = tenant?.minLeadHours ? Math.ceil(tenant.minLeadHours / 24) : 0;
    return {
        min: dayFromToday(leadDays),
        max: tenant?.maxAdvanceDays ? dayFromToday(tenant.maxAdvanceDays) : undefined,
    };
}

/** Adicionais do pacote que o cliente escolhe: os opcionais e as horas além das inclusas. */
export function choosableItems(pkg: VenuePackage | null): VenuePackageItem[] {
    if (!pkg) return [];
    return pkg.items.filter((it) => it.mode === "OPTIONAL" || (it.chargeType === "PER_HOUR" && it.includedQuantity != null));
}

/** Escolha inicial: horas inclusas (por hora) ou desmarcado. */
function initialAddons(pkg: VenuePackage): Record<string, AddonChoice> {
    return Object.fromEntries(choosableItems(pkg).map((it) => [it.itemId, it.chargeType === "PER_HOUR" ? (it.includedQuantity ?? 0) : false]));
}

/** Escolhas → `items` do orçamento. Em item por hora, `quantity` é o total de horas (com as inclusas). */
function itemsPayload(pkg: VenuePackage, addons: Record<string, AddonChoice>): QuotePayload["items"] {
    return choosableItems(pkg).flatMap((it) => {
        const choice = addons[it.itemId];
        if (it.chargeType === "PER_HOUR") {
            const hours = typeof choice === "number" ? choice : 0;
            return hours > 0 ? [{ itemId: it.itemId, quantity: hours }] : [];
        }
        return choice === true ? [{ itemId: it.itemId }] : [];
    });
}

/**
 * Estado da reserva (web#37): pacotes do espaço vindos da API, data, horário, convidados, adicionais e o
 * orçamento. Nenhum valor é calculado aqui: o total e as linhas são os do `POST /reservations/quote`, e as
 * regras (dias, horário, convidados, antecedência) quem confere é a API, com a mensagem do problema.
 */
export function useReservationForm({ venueId }: { venueId: string | undefined }): UseReservationFormReturn {
    const navigate = useNavigate();

    const [tenant, setTenant] = useState<PublicTenant | null>(null);
    const [packages, setPackages] = useState<VenuePackage[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [isHoliday, setIsHoliday] = useState(false);
    const [packageId, setPackageId] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [guests, setGuests] = useState("");
    const [addons, setAddons] = useState<Record<string, AddonChoice>>({});
    const [notes, setNotes] = useState("");
    const [acceptedContract, setAcceptedContract] = useState(false);

    const [quote, setQuote] = useState<QuoteResult | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        getPublicTenant(controller.signal)
            .then(setTenant)
            // sem as regras do salão o calendário só não limita o horizonte; a API confere ao reservar
            .catch(() => undefined);
        return () => controller.abort();
    }, []);

    // Pacotes do espaço; com data, cada um diz se vale no dia.
    useEffect(() => {
        if (!venueId) return;
        const controller = new AbortController();
        setPackagesLoading(true);
        getVenuePackages(venueId, eventDate || undefined, controller.signal)
            .then((res) => {
                setPackages(res.packages);
                setIsHoliday(Boolean(res.holiday));
            })
            .catch((error) => {
                if (!isAbortError(error)) toast.error(getErrorMessage(error, "Não foi possível carregar os pacotes do espaço."));
            })
            .finally(() => {
                if (!controller.signal.aborted) setPackagesLoading(false);
            });
        return () => controller.abort();
    }, [venueId, eventDate]);

    const selectedPackage = packages.find((p) => p.id === packageId) ?? null;

    // Pacote que deixou de valer na data nova sai da seleção.
    useEffect(() => {
        if (selectedPackage && selectedPackage.availableOnDate === false) {
            setPackageId("");
            toast.info(`O pacote ${selectedPackage.name} não vale nesta data. Escolha outro.`);
        }
    }, [selectedPackage]);

    function selectPackage(pkg: VenuePackage) {
        if (pkg.availableOnDate === false) return;
        if (pkg.id === packageId) return;
        setPackageId(pkg.id);
        setAddons(initialAddons(pkg));
    }

    function setAddon(itemId: string, value: AddonChoice) {
        setAddons((current) => ({ ...current, [itemId]: value }));
    }

    function handleDateChange(newDate: string) {
        setEventDate(newDate);
    }

    // Término antes (ou igual) do início = a festa passa da meia-noite.
    const endsNextDay = Boolean(startTime && endTime && endTime <= startTime);
    const guestCount = Number(guests);

    const missing: string[] = [];
    if (!eventDate) missing.push("a data");
    if (!selectedPackage) missing.push("o pacote");
    if (!startTime || !endTime) missing.push("o horário");
    if (!guests || !Number.isInteger(guestCount) || guestCount < 1) missing.push("o número de convidados");

    const quotePayload: QuotePayload | null = useMemo(() => {
        if (!venueId || !selectedPackage || !eventDate || !startTime || !endTime || !Number.isInteger(guestCount) || guestCount < 1) return null;
        const start = new Date(`${eventDate}T${startTime}:00`);
        const end = new Date(`${eventDate}T${endTime}:00`);
        if (end <= start) end.setDate(end.getDate() + 1);
        return {
            venueId,
            packageId: selectedPackage.id,
            guestCount,
            items: itemsPayload(selectedPackage, addons),
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    }, [venueId, selectedPackage, eventDate, startTime, endTime, guestCount, addons]);

    const payloadKey = quotePayload ? JSON.stringify(quotePayload) : "";

    useEffect(() => {
        if (!quotePayload) {
            setQuote(null);
            setQuoteError(null);
            return;
        }
        const controller = new AbortController();
        if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
        quoteTimerRef.current = setTimeout(async () => {
            try {
                setQuoteLoading(true);
                const result = await quoteReservation(quotePayload, controller.signal);
                if (controller.signal.aborted) return;
                setQuote(result);
                setQuoteError(null);
            } catch (error) {
                if (isAbortError(error) || controller.signal.aborted) return;
                // A API explica a regra que não foi atendida (horário, convidados, antecedência...).
                setQuote(null);
                setQuoteError(getErrorMessage(error, "Não foi possível calcular o orçamento."));
            } finally {
                if (!controller.signal.aborted) setQuoteLoading(false);
            }
        }, 500);
        return () => {
            if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
            controller.abort();
        };
        // payloadKey muda só quando o corpo muda de fato
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payloadKey]);

    async function handleConfirmReservation() {
        if (!quotePayload) {
            toast.warning(`Falta escolher ${missing.join(", ")}.`);
            return;
        }
        if (quoteError) { toast.warning(quoteError); return; }
        if (!acceptedContract) { toast.warning("Aceite o contrato para continuar."); return; }

        try {
            setSubmitting(true);
            const reservation = await createReservation({
                ...quotePayload,
                termsAccepted: true,
                ...(notes.trim() && { notes: notes.trim() }),
            });
            toast.success("Reserva criada! Agora é só pagar para garantir a data.");
            navigate(`/checkout/${reservation.id}`);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao confirmar a reserva."));
        } finally {
            setSubmitting(false);
        }
    }

    return {
        tenant,
        packages,
        packagesLoading,
        isHoliday,
        selectedPackage,
        eventDate,
        startTime, setStartTime,
        endTime, setEndTime,
        guests, setGuests,
        addons, setAddon,
        notes, setNotes,
        acceptedContract, setAcceptedContract,
        quotePayload,
        missing,
        quote,
        quoteError,
        quoteLoading,
        submitting,
        endsNextDay,
        selectPackage,
        handleDateChange,
        handleConfirmReservation,
    };
}
