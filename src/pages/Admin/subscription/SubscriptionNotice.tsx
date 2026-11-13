import { useEffect, useState } from "react";

import { getMySubscription } from "../../../services/subscription";
import { formatDay } from "../../../utils/subscription";
import type { SubscriptionDetail } from "../../../types";
import * as S from "./styles";

interface SubscriptionNoticeProps {
    /** Muda a cada troca de aba: o aviso confere de novo (um pagamento pode ter sido confirmado). */
    refreshKey: string;
    onOpen: () => void;
}

/**
 * Aviso no topo do painel quando a assinatura pede atenção: pagamento atrasado, painel só para consulta,
 * ou mês grátis acabando sem o Pix Automático autorizado. Some com a cobrança desligada.
 */
export function SubscriptionNotice({ refreshKey, onOpen }: SubscriptionNoticeProps) {
    const [sub, setSub] = useState<SubscriptionDetail | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        getMySubscription(controller.signal).then(setSub).catch(() => setSub(null));
        return () => controller.abort();
    }, [refreshKey]);

    if (!sub?.billingEnabled) return null;

    if (sub.status === "SUSPENSA") {
        return (
            <S.Notice $tone="error" role="alert" aria-labelledby="subscription-notice-title">
                <div>
                    <h2 id="subscription-notice-title">Painel só para consulta</h2>
                    <p>A assinatura que venceu em {formatDay(sub.nextDueDate)} não foi paga. Você vê tudo, mas não altera pacotes, espaços, promoções e configurações. Reservas e clientes seguem normais.</p>
                </div>
                <button type="button" onClick={onOpen}>Regularizar assinatura</button>
            </S.Notice>
        );
    }

    if (sub.status === "EM_ATRASO") {
        return (
            <S.Notice $tone="pending" role="status" aria-labelledby="subscription-notice-title">
                <div>
                    <h2 id="subscription-notice-title">Pagamento da assinatura atrasado</h2>
                    <p>A cobrança de {formatDay(sub.nextDueDate)} não foi paga. Regularize até {formatDay(sub.graceEndsOn)} para o painel não ficar só para consulta.</p>
                </div>
                <button type="button" onClick={onOpen}>Ver assinatura</button>
            </S.Notice>
        );
    }

    const noAutomatic = sub.automaticPayment.state === "NONE" || sub.automaticPayment.state === "ENDED";
    if (sub.status === "TRIAL" && noAutomatic && sub.daysUntilDue >= 0 && sub.daysUntilDue <= 5) {
        const when = sub.daysUntilDue === 0 ? "hoje" : sub.daysUntilDue === 1 ? "amanhã" : `em ${sub.daysUntilDue} dias`;
        return (
            <S.Notice $tone="info" role="status" aria-labelledby="subscription-notice-title">
                <div>
                    <h2 id="subscription-notice-title">Seu mês grátis acaba {when}</h2>
                    <p>Autorize o Pix Automático para continuar sem interrupção. Leva um minuto no app do banco.</p>
                </div>
                <button type="button" onClick={onOpen}>Autorizar Pix Automático</button>
            </S.Notice>
        );
    }

    return null;
}
