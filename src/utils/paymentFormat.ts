/**
 * Pagamento combinado com o salão (#48): nomes das formas de pagamento e links de contato para combinar.
 */
import type { PaymentMethod } from "../types";

export const METHOD_LABELS: Record<PaymentMethod, string> = {
    PIX: "PIX",
    CASH: "Dinheiro",
    CARD: "Cartão (maquininha)",
    TRANSFER: "Transferência",
    OTHER: "Outra forma",
};

export const PAYMENT_METHODS = Object.keys(METHOD_LABELS) as PaymentMethod[];

/** Link do WhatsApp com a mensagem pronta. Número brasileiro sem DDI ganha o 55. */
export function whatsappLink(phone: string, text: string): string | null {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return null;
    const full = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export function instagramLink(handle: string): string {
    return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

/** "sex., 20 de nov., 18:30" — prazo para o salão registrar o pagamento. */
export function formatDeadline(iso: string): string {
    return new Date(iso).toLocaleString("pt-BR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
