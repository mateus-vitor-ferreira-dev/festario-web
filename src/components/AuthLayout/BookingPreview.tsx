import * as S from "./styles";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

/* Varal do símbolo em escala de cartão: fio em curva (quadrática) e bandeirinhas
   penduradas ao longo dele, na sequência milho, pitanga, milho. */
const BUNTING_W = 270;
const ROPE = { x0: 6, y0: 4, cx: 135, cy: 20, x1: 264, y1: 4 };
const FLAG_COLORS = ["#f4b41a", "#d8344a", "#f4b41a"];
const FLAGS = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 0.5) / 11;
    const u = 1 - t;
    const x = u * u * ROPE.x0 + 2 * u * t * ROPE.cx + t * t * ROPE.x1;
    const y = u * u * ROPE.y0 + 2 * u * t * ROPE.cy + t * t * ROPE.y1;
    return { x, y, color: FLAG_COLORS[i % 3] };
});

function Bunting() {
    return (
        <S.PreviewBunting viewBox={`0 0 ${BUNTING_W} 21`} preserveAspectRatio="xMidYMin meet">
            <path
                d={`M${ROPE.x0} ${ROPE.y0} Q${ROPE.cx} ${ROPE.cy} ${ROPE.x1} ${ROPE.y1}`}
                fill="none"
                stroke="#27357e"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            {FLAGS.map(({ x, y, color }, i) => (
                <path key={i} d={`M${x - 6} ${y - 0.6} L${x + 6} ${y - 0.6} L${x} ${y + 11} Z`} fill={color} />
            ))}
        </S.PreviewBunting>
    );
}

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
                <Bunting />
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
