import { formatCents, formatDay } from "../../../utils/subscription";
import type { SubscriptionDetail } from "../../../types";

/** A situação em uma frase e o que fazer, do ponto de vista do dono. */
export function statusCopy(sub: SubscriptionDetail): { headline: string; text: string } {
    const due = formatDay(sub.nextDueDate);
    const price = formatCents(sub.monthlyPriceCents);
    const automatic = sub.automaticPayment.state === "APPROVED";

    if (!sub.billingEnabled) {
        return sub.inTrial
            ? { headline: `Seu mês grátis vai até ${formatDay(sub.trialEndsAt)}.`, text: `Depois, a assinatura custa ${price} por mês. A cobrança pelo app ainda não está ligada: nada muda no seu painel por enquanto.` }
            : { headline: "Sua assinatura está ativa.", text: `A assinatura custa ${price} por mês. A cobrança pelo app ainda não está ligada: nada muda no seu painel por enquanto.` };
    }

    switch (sub.status) {
        case "TRIAL":
            return {
                headline: `Seu mês grátis vai até ${due}.`,
                text: `Depois, são ${price} por mês. Autorize o Pix Automático abaixo e o pagamento acontece sozinho, sem boleto nem lembrete.`,
            };
        case "AUTORIZACAO_PENDENTE":
            return {
                headline: "Falta aprovar o Pix Automático no seu banco.",
                text: `Leia o QR Code ou cole o código no app do banco e confirme. A primeira cobrança, de ${price}, vence em ${due}.`,
            };
        case "ATIVA":
            return automatic
                ? { headline: "Sua assinatura está em dia.", text: `A próxima cobrança, de ${price}, vence em ${due} e é debitada pelo Pix Automático. Só deixe saldo na conta.` }
                : { headline: "Sua assinatura está em dia.", text: `O próximo vencimento é ${due} (${price}). Autorize o Pix Automático para não precisar pagar à mão.` };
        case "EM_ATRASO":
            return {
                headline: `A cobrança de ${due} ainda não foi paga.`,
                text: `Regularize até ${formatDay(sub.graceEndsOn)}. Depois disso o painel fica só para consulta até o pagamento ser confirmado. Suas reservas e clientes não são afetados.`,
            };
        case "SUSPENSA":
            return {
                headline: "O painel está só para consulta.",
                text: `A cobrança de ${due} não foi paga. Você continua vendo tudo, mas não cria nem altera pacotes, espaços, promoções e configurações. Reservas e clientes seguem normais, e tudo volta na hora em que o pagamento for confirmado.`,
            };
        case "CANCELADA":
            return {
                headline: "O Pix Automático foi cancelado.",
                text: `Sua assinatura está paga até ${due}. Autorize de novo para a cobrança continuar automática.`,
            };
    }
}
