import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBlockedDates, getOccupiedDates } from "../../services/availability";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError } from "../../utils/errors";
import type { BlockedDate, OccupiedDate } from "../../types";
import * as S from "./styles";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toLocalDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function isDateInRange(dateStr: string, ranges: Array<{ startDate: string; endDate: string }>): boolean {
    const ts = new Date(`${dateStr}T12:00:00`).getTime();
    return ranges.some((r) => {
        const start = new Date(r.startDate).getTime();
        const end = new Date(r.endDate).getTime();
        return ts >= start && ts < end;
    });
}

/**
 * Calendário interativo de disponibilidade para um espaço.
 *
 * Carrega as datas bloqueadas (admin) e ocupadas (reservas confirmadas) via API e as
 * exibe com cores distintas. O usuário só consegue selecionar dias disponíveis.
 *
 * @component
 * @param {object} props
 * @param {string} props.venueId - ID do espaço (venue) cujos dados de disponibilidade serão carregados
 * @param {string | null} props.selectedDate - Data selecionada no formato `YYYY-MM-DD`
 * @param {(date: string) => void} props.onChange - Callback chamado ao selecionar um dia disponível
 * @param {string} [props.minDate] - Data mínima selecionável em `YYYY-MM-DD`; padrão: hoje
 */
export default function AvailabilityCalendar({ venueId, selectedDate, onChange, minDate }: { venueId: string; selectedDate?: string; onChange: (date: string) => void; minDate?: string }) {
    const today = toLocalDateString(new Date());
    const effectiveMin = minDate || today;

    const [year, setYear] = useState(() => {
        const base = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
        return base.getFullYear();
    });
    const [month, setMonth] = useState(() => {
        const base = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
        return base.getMonth();
    });

    const [blockedRanges, setBlockedRanges] = useState<BlockedDate[]>([]);
    const [occupiedRanges, setOccupiedRanges] = useState<OccupiedDate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!venueId) return;

        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true);
                const [blocked, occupied] = await Promise.all([
                    getBlockedDates(venueId, controller.signal),
                    getOccupiedDates(venueId, controller.signal),
                ]);
                if (!controller.signal.aborted) {
                    setBlockedRanges(blocked);
                    setOccupiedRanges(occupied);
                }
            } catch (err) {
                if (isAbortError(err)) return;
                toast.error(getErrorMessage(err, "Erro ao carregar disponibilidade."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        load();

        return () => controller.abort();
    }, [venueId]);

    function prevMonth() {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    }

    function nextMonth() {
        if (month === 11) { setMonth(0); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    }

    const now = new Date();
    const isPrevDisabled = year < now.getFullYear() ||
        (year === now.getFullYear() && month <= now.getMonth());

    const monthLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push({ empty: true, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const isPast = dateStr < effectiveMin;
        const isBlocked = !isPast && isDateInRange(dateStr, blockedRanges);
        const isOccupied = !isPast && !isBlocked && isDateInRange(dateStr, occupiedRanges);
        const isSelected = dateStr === selectedDate;
        const isAvailable = !isPast && !isBlocked && !isOccupied;

        cells.push({ day: d, dateStr, isPast, isBlocked, isOccupied, isSelected, isAvailable });
    }

    function handleDayClick(cell: { empty?: boolean; isPast?: boolean; isBlocked?: boolean; isOccupied?: boolean; dateStr?: string }) {
        if (cell.empty) return;
        if (cell.isPast || cell.isBlocked || cell.isOccupied) return;
        if (cell.dateStr) onChange?.(cell.dateStr);
    }

    return (
        <S.Wrapper>
            <S.Header>
                <S.NavButton onClick={prevMonth} disabled={isPrevDisabled} aria-label="Mês anterior">
                    &#8249;
                </S.NavButton>
                <S.MonthLabel>{monthLabel}</S.MonthLabel>
                <S.NavButton onClick={nextMonth} aria-label="Próximo mês">
                    &#8250;
                </S.NavButton>
            </S.Header>

            {loading ? (
                <S.LoadingOverlay>Carregando disponibilidade...</S.LoadingOverlay>
            ) : (
                <S.Grid>
                    {WEEKDAYS.map((w) => (
                        <S.WeekdayLabel key={w}>{w}</S.WeekdayLabel>
                    ))}

                    {(cells as Array<{ empty?: boolean; key?: string; day?: number; dateStr?: string; isPast?: boolean; isBlocked?: boolean; isOccupied?: boolean; isSelected?: boolean; isAvailable?: boolean }>).map((cell) => {
                        if (cell.empty) {
                            return <S.Day key={cell.key} $empty />;
                        }

                        return (
                            <S.Day
                                key={cell.dateStr}
                                type="button"
                                $past={cell.isPast && !cell.isSelected}
                                $blocked={cell.isBlocked}
                                $occupied={cell.isOccupied}
                                $selected={cell.isSelected}
                                $available={cell.isAvailable && !cell.isSelected}
                                onClick={() => handleDayClick(cell)}
                                title={
                                    cell.isBlocked ? "Data bloqueada" :
                                    cell.isOccupied ? "Data já reservada" :
                                    cell.isPast ? "Data indisponível" : undefined
                                }
                            >
                                {cell.day}
                            </S.Day>
                        );
                    })}
                </S.Grid>
            )}

            <S.Legend>
                <S.LegendItem>
                    <S.LegendDot $variant="available" />
                    Disponível
                </S.LegendItem>
                <S.LegendItem>
                    <S.LegendDot $variant="selected" />
                    Selecionado
                </S.LegendItem>
                <S.LegendItem>
                    <S.LegendDot $variant="occupied" />
                    Reservado
                </S.LegendItem>
                <S.LegendItem>
                    <S.LegendDot $variant="blocked" />
                    Bloqueado
                </S.LegendItem>
            </S.Legend>
        </S.Wrapper>
    );
}
