import * as S from "./styles";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

/**
 * Prévia decorativa do produto: o calendário do mês com dias reservados e uma
 * data confirmada. Desenhada em código para ficar nítida em qualquer tela e não
 * depender da foto de um espaço específico.
 */
export default function BookingPreview() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // cenário fixo e plausível: sábados e sextas alternadas já reservados e o
    // terceiro sábado como a data confirmada — o único destaque de cor
    const saturdays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
        .filter((d) => new Date(year, month, d).getDay() === 6);
    const confirmed = saturdays[Math.min(2, saturdays.length - 1)];
    const fridays = saturdays.map((d) => d - 1).filter((d) => d > 0);
    const booked = new Set([
        ...saturdays.filter((d) => d !== confirmed),
        ...fridays.filter((_, i) => i % 2 === 0),
    ]);

    const monthLabel = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const confirmedLabel = new Date(year, month, confirmed).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const cells: (number | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <S.Preview aria-hidden="true">
            <S.PreviewCard>
                <S.PreviewMonth>{monthLabel}</S.PreviewMonth>
                <S.PreviewGrid>
                    {WEEKDAYS.map((w, i) => (
                        <S.PreviewWeekday key={`w${i}`}>{w}</S.PreviewWeekday>
                    ))}
                    {cells.map((d, i) =>
                        d === null ? (
                            <span key={`e${i}`} />
                        ) : (
                            <S.PreviewDay
                                key={d}
                                $state={
                                    d === confirmed ? "confirmed"
                                        : booked.has(d) ? "booked"
                                            : "free"
                                }
                            >
                                {d}
                            </S.PreviewDay>
                        )
                    )}
                </S.PreviewGrid>
                <S.PreviewLegend>
                    <span><i data-state="free" />Livre</span>
                    <span><i data-state="booked" />Reservado</span>
                    <span><i data-state="confirmed" />Sua data</span>
                </S.PreviewLegend>
            </S.PreviewCard>

            <S.PreviewTicket>
                <strong>Reserva confirmada</strong>
                <span>{confirmedLabel}</span>
            </S.PreviewTicket>
        </S.Preview>
    );
}
