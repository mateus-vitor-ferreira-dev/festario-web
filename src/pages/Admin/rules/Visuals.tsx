import styled from "styled-components";

import { WEEK, describeDays, describeWindow, minutesToClock } from "./format";

/**
 * Faixa da semana do pacote: os dias em que ele vale ficam em anil, e o feriado aparece em milho.
 * É o elemento que responde de relance "quando esse pacote vale?".
 */
export function WeekStrip({ weekdays, holidays, compact = false }: { weekdays: number[] | null; holidays: boolean; compact?: boolean }) {
    const all = !weekdays;
    return (
        <Week aria-label={describeDays(weekdays, holidays)} $compact={compact} role="img">
            {WEEK.map((w) => (
                <Day key={w.day} $on={all || weekdays!.includes(w.day)} title={w.name} aria-hidden="true">{w.short}</Day>
            ))}
            <Holiday $on={holidays} title={holidays ? "Vale em feriados" : "Não vale em feriados"} aria-hidden="true">F</Holiday>
        </Week>
    );
}

/** Barra do dia (0h–24h, ou até 36h se a festa vira a noite) com a janela de horário do pacote. */
export function TimeWindow({ earliest, latest }: { earliest: number | null; latest: number | null }) {
    const span = Math.max(1440, latest ?? 0);
    const from = earliest ?? 0;
    const to = latest ?? 1440;
    const left = (from / span) * 100;
    const width = Math.max(2, ((to - from) / span) * 100);
    const unlimited = earliest == null && latest == null;
    return (
        <WindowWrap>
            <Track role="img" aria-label={describeWindow(earliest, latest)}>
                <Fill style={{ left: `${left}%`, width: `${width}%` }} $muted={unlimited} />
                {span > 1440 && <Midnight style={{ left: `${(1440 / span) * 100}%` }} />}
            </Track>
            <Ticks aria-hidden="true">
                <span>{unlimited ? "0h" : minutesToClock(from)}</span>
                <span>{unlimited ? "24h" : minutesToClock(to)}</span>
            </Ticks>
        </WindowWrap>
    );
}

const Week = styled.div<{ $compact: boolean }>`
  display: inline-flex;
  gap: ${({ $compact }) => ($compact ? "3px" : "4px")};
  font-family: var(--font-sans);
  font-size: ${({ $compact }) => ($compact ? "var(--text-xs)" : "var(--text-sm)")};
  font-weight: 700;
  line-height: 1;
`;

const Day = styled.span<{ $on: boolean }>`
  display: inline-grid;
  place-items: center;
  width: 1.9em;
  height: 1.9em;
  border-radius: var(--radius-sm);
  background: ${({ $on }) => ($on ? "var(--brand)" : "transparent")};
  color: ${({ $on }) => ($on ? "var(--on-brand)" : "var(--text-muted)")};
  border: 1px solid ${({ $on }) => ($on ? "var(--brand)" : "var(--border-medium)")};
`;

const Holiday = styled(Day)`
  margin-left: 4px;
  background: ${({ $on }) => ($on ? "var(--gold)" : "transparent")};
  color: ${({ $on }) => ($on ? "#3d2a00" : "var(--text-muted)")};
  border-color: ${({ $on }) => ($on ? "var(--gold-dark)" : "var(--border-medium)")};
  border-style: ${({ $on }) => ($on ? "solid" : "dashed")};
`;

const WindowWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

const Track = styled.div`
  position: relative;
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--bg-muted);
  overflow: hidden;
`;

const Fill = styled.span<{ $muted: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: var(--radius-pill);
  background: ${({ $muted }) => ($muted ? "var(--brand-border)" : "var(--brand)")};
`;

const Midnight = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--bg-surface);
`;

const Ticks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
`;
