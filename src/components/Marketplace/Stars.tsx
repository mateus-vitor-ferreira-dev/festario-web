import { useId } from "react";
import styled from "styled-components";

const formatAverage = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "4,8 de 5" com a fração da estrela desenhada; o leitor de tela ouve só o texto. */
export function StarsDisplay({ value, size = 16 }: { value: number; size?: number }) {
    const pct = Math.max(0, Math.min(100, (value / 5) * 100));
    return (
        <Track role="img" aria-label={`${formatAverage(value)} de 5`} style={{ fontSize: size }}>
            <span aria-hidden="true">★★★★★</span>
            <Fill aria-hidden="true" style={{ width: `${pct}%` }}>★★★★★</Fill>
        </Track>
    );
}

/** "★ 4,8 (12 avaliações)"; sem avaliação, "Novo na vitrine". */
export function RatingLine({ average, count, compact = false }: { average: number | null; count: number; compact?: boolean }) {
    if (average == null || count === 0) return <Muted>Ainda sem avaliações</Muted>;
    return (
        <Line>
            <StarsDisplay value={average} size={compact ? 14 : 16} />
            <strong>{formatAverage(average)}</strong>
            <Muted>({count} {count === 1 ? "avaliação" : "avaliações"})</Muted>
        </Line>
    );
}

/** Nota de 1 a 5 como grupo de rádios: setas trocam a nota, como qualquer rádio. */
export function StarInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
    const name = useId();
    const words = ["", "Ruim", "Fraco", "Bom", "Muito bom", "Excelente"];
    return (
        <Fieldset>
            <legend>{label}</legend>
            <Row>
                {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} title={words[n]}>
                        <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
                        <span aria-hidden="true" data-on={n <= value}>★</span>
                        <VisuallyHidden>{n} {n === 1 ? "estrela" : "estrelas"}: {words[n]}</VisuallyHidden>
                    </label>
                ))}
                {value > 0 && <Word aria-hidden="true">{words[value]}</Word>}
            </Row>
        </Fieldset>
    );
}

const Track = styled.span`
  position: relative;
  display: inline-block;
  line-height: 1;
  letter-spacing: 1px;
  color: var(--border-medium);
`;

const Fill = styled.span`
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;
  white-space: nowrap;
  color: var(--gold);
`;

const Line = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);

  strong {
    color: var(--text-primary);
  }
`;

const Muted = styled.span`
  color: var(--text-muted);
  font-size: var(--text-sm);
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    margin-bottom: 6px;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-secondary);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;

  label {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    cursor: pointer;
  }

  input {
    position: absolute;
    opacity: 0;
    inset: 0;
    cursor: pointer;
  }

  span[data-on] {
    font-size: 30px;
    line-height: 1;
    color: var(--border-medium);
    transition: transform 0.12s ease;
  }

  span[data-on="true"] {
    color: var(--gold);
  }

  input:focus-visible + span {
    outline: 2px solid var(--brand);
    outline-offset: 4px;
    border-radius: 4px;
  }

  label:hover span[data-on] {
    transform: scale(1.12);
  }

  @media (prefers-reduced-motion: reduce) {
    span[data-on] {
      transition: none;
    }
  }
`;

const Word = styled.span`
  margin-left: 8px;
  color: var(--text-secondary);
  font-weight: 700;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
