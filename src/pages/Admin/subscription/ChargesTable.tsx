import * as A from "../styles";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_TONE, formatCents, formatDay } from "../../../utils/subscription";
import type { SubscriptionCharge } from "../../../types";
import * as S from "./styles";

const METHOD_LABELS = { PIX_AUTOMATICO: "Pix Automático", MANUAL: "Pago por fora" } as const;

/** Histórico de cobranças da assinatura (painel do dono e detalhe da plataforma). */
export function ChargesTable({ charges, caption }: { charges: SubscriptionCharge[]; caption: string }) {
    if (charges.length === 0) {
        return <S.Muted>Nenhuma cobrança ainda. A primeira aparece aqui 10 dias antes do vencimento.</S.Muted>;
    }
    return (
        <A.TableWrapper>
            <A.Table>
                <caption><A.VisuallyHidden>{caption}</A.VisuallyHidden></caption>
                <thead>
                    <tr>
                        <A.Th>Vencimento</A.Th>
                        <A.Th $num>Valor</A.Th>
                        <A.Th>Situação</A.Th>
                        <A.Th>Forma</A.Th>
                        <A.Th>Pago em</A.Th>
                    </tr>
                </thead>
                <tbody>
                    {charges.map((c) => (
                        <A.Tr key={c.id}>
                            <A.Td>{formatDay(c.dueDate)}</A.Td>
                            <A.Td $num>{formatCents(c.amountCents)}</A.Td>
                            <A.Td>
                                <S.ToneBadge $tone={CHARGE_STATUS_TONE[c.status]}>{CHARGE_STATUS_LABELS[c.status]}</S.ToneBadge>
                            </A.Td>
                            <A.Td>
                                {c.status === "PAGA" ? METHOD_LABELS[c.method] : c.status === "AGENDADA" ? "Pix Automático" : "—"}
                                {c.note && <S.Muted> · {c.note}</S.Muted>}
                            </A.Td>
                            <A.Td>{c.paidAt ? new Date(c.paidAt).toLocaleDateString("pt-BR") : "—"}</A.Td>
                        </A.Tr>
                    ))}
                </tbody>
            </A.Table>
        </A.TableWrapper>
    );
}
