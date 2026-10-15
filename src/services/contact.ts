/**
 * @module services/contact
 * @description Envio de mensagens do formulário de contato ao administrador.
 * O backend encaminha o conteúdo por e-mail via Resend, com `replyTo` definido
 * como o e-mail do remetente para facilitar a resposta direta.
 */
import api from "./api";
import type { SalonContact } from "../types";
import type { ContactPayload } from "../types";

/**
 * Envia uma mensagem de contato à equipe do espaço.
 *
 * @see POST /contact/message
 */
export async function submitContact(
    payload: ContactPayload,
): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/contact/message", payload);
    return data;
}

/**
 * Contato do salão (#47): só os canais que o dono cadastrou (os outros vêm nulos).
 *
 * @see GET /contact
 */
export async function getSalonContact(signal?: AbortSignal): Promise<SalonContact> {
    const { data } = await api.get("/contact", { signal });
    return data.data;
}
