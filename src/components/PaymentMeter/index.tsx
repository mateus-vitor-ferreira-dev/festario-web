import styled from "styled-components";

import { formatCents } from "../../utils/reservationFormat";

interface PaymentMeterProps {
    totalCents: number;
    netCents: number;
    /** Valor que confirma a reserva; igual ao total quando o salão não usa sinal. */
    requiredCents: number;
    compact?: boolean;
}

/**
 * Quanto o salão já recebeu da reserva (#48): a barra enche até o total e marca o sinal, o ponto em que
 * a reserva é confirmada. É o mesmo desenho para o cliente e para o dono, para os dois lerem igual.
 */
export default function PaymentMeter({ totalCents, netCents, requiredCents, compact = false }: PaymentMeterProps) {
    const total = Math.max(totalCents, 1);
    const paid = Math.min(Math.max(netCents, 0), total);
    const hasDeposit = requiredCents < totalCents;
    const depositAt = (requiredCents / total) * 100;
    const confirmed = netCents >= requiredCents;
    const label = `${formatCents(paid)} recebidos de ${formatCents(totalCents)}${hasDeposit ? `; o sinal de ${formatCents(requiredCents)} confirma a reserva` : ""}`;

    return (
        <Wrap $compact={compact}>
            <Track role="meter" aria-valuemin={0} aria-valuemax={totalCents} aria-valuenow={paid} aria-valuetext={label} aria-label="Pagamento da reserva">
                <Fill style={{ width: `${(paid / total) * 100}%` }} $confirmed={confirmed} />
                {hasDeposit && <DepositMark style={{ left: `${depositAt}%` }} $reached={confirmed} aria-hidden="true" />}
            </Track>
            {!compact && (
                <Legend aria-hidden="true">
                    <span>{formatCents(paid)} recebido</span>
                    <span>de {formatCents(totalCents)}</span>
                </Legend>
            )}
        </Wrap>
    );
}

const Wrap = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: ${({ $compact }) => ($compact ? "96px" : "0")};
`;

const Track = styled.div`
  position: relative;
  height: 12px;
  border-radius: var(--radius-pill);
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  overflow: visible;
`;

const Fill = styled.div<{ $confirmed: boolean }>`
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: var(--radius-pill);
  background: ${({ $confirmed }) => ($confirmed ? "var(--brand)" : "var(--gold)")};
  transition: width 0.4s var(--ease-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* Marca do sinal: um traço que atravessa a barra. Fica dourado até a reserva ser confirmada. */
const DepositMark = styled.div<{ $reached: boolean }>`
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 3px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: ${({ $reached }) => ($reached ? "var(--brand-dark)" : "var(--gold-dark)")};
`;

const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-variant-numeric: lining-nums tabular-nums;
`;
