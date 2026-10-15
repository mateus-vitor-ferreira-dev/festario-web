/**
 * @module services/negotiation
 * @description Funções para o fluxo de negociação de condições especiais de reserva.
 *
 * Fluxo:
 *   1. Usuário cria negociação (`createNegotiation`)
 *   2. Troca de mensagens entre usuário e admin (`sendMessage`)
 *   3. Admin envia proposta com preço e datas customizadas (`sendProposal`)
 *   4. Usuário aceita ou recusa (`respondToProposal`)
 *   5. Se aceita, a reserva é criada automaticamente pelo backend
 *
 * Alternativa (admin): admin cria reserva customizada diretamente (`createCustomReservation`).
 */
import api from "./api";
import { cleanParams, normalizeText, toPaginated } from "./pagination";
import type {
    Negotiation,
    NegotiationMessage,
    NegotiationStatus,
    Reservation,
    ContactInfo,
    PaginatedResult,
    ListParams,
} from "../types";

export interface SendProposalPayload {
    venueId: string;
    startDate: string;
    endDate: string;
    customPriceCents: number;
    notes: string | null;
}

export interface CreateCustomReservationPayload {
    venueId: string;
    startDate: string;
    endDate: string;
    customPriceCents: number;
    notes?: string | null;
}

/** Retorno do endpoint POST /negotiations/:id/proposal/respond */
export interface RespondToProposalResult {
    action: "ACCEPTED" | "DECLINED";
    reservation?: Pick<Reservation, "id" | "totalPrice" | "startDate" | "endDate"> & {
        venue?: { name: string } | null;
    };
}

/**
 * Abre uma nova negociação para o usuário autenticado.
 *
 * @see POST /negotiations
 */
export async function createNegotiation(signal?: AbortSignal): Promise<Negotiation> {
    const response = await api.post("/negotiations", {}, { signal });
    return response.data.data;
}

/**
 * Lista todas as negociações do usuário autenticado.
 * Admins recebem todas as negociações do sistema.
 *
 * @see GET /negotiations
 */
export async function listNegotiations(signal?: AbortSignal): Promise<Negotiation[]> {
    const response = await api.get("/negotiations", { signal });
    return response.data.data;
}

/**
 * Lista negociações com paginação e filtros (`status`, `q`).
 * Admins recebem as negociações de todos os clientes.
 *
 * @see GET /negotiations?page=&limit=&status=&q=
 */
export async function listNegotiationsPage(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Negotiation>> {
    const response = await api.get("/negotiations", { params: cleanParams(params), signal });
    const body = response.data;
    // API antiga (sem `pagination`) ignora filtros: filtra aqui antes de paginar no cliente
    if (body && Array.isArray(body.data) && !body.pagination && !body.meta) {
        const status = params.status ? String(params.status) : "";
        const q = params.q ? normalizeText(String(params.q)) : "";
        const filtered = (body.data as Negotiation[]).filter((n) =>
            (!status || n.status === status)
            && (!q || normalizeText(`${n.subject ?? ""} ${n.user?.name ?? ""}`).includes(q)));
        return toPaginated<Negotiation>({ data: filtered }, params);
    }
    return toPaginated<Negotiation>(body, params);
}

/**
 * Busca os detalhes de uma negociação incluindo todas as mensagens.
 *
 * @see GET /negotiations/:id
 */
export async function getNegotiation(id: string, signal?: AbortSignal): Promise<Negotiation> {
    const response = await api.get(`/negotiations/${id}`, { signal });
    return response.data.data;
}

/**
 * Envia uma mensagem de texto na negociação.
 *
 * @see POST /negotiations/:id/messages
 */
export async function sendMessage(id: string, content: string, signal?: AbortSignal): Promise<NegotiationMessage> {
    const response = await api.post(`/negotiations/${id}/messages`, { content }, { signal });
    return response.data.data;
}

/**
 * Atualiza o status da negociação (ex.: CLOSED, REJECTED).
 * Ação tipicamente realizada pelo admin.
 *
 * @see PATCH /negotiations/:id/status
 */
export async function updateNegotiationStatus(id: string, status: NegotiationStatus): Promise<Negotiation> {
    const response = await api.patch(`/negotiations/${id}/status`, { status });
    return response.data.data;
}

/**
 * Admin cria uma reserva customizada diretamente a partir de uma negociação,
 * sem passar pelo fluxo de proposta/aceitação.
 *
 * @see POST /negotiations/:id/reservation
 */
export async function createCustomReservation(id: string, payload: CreateCustomReservationPayload): Promise<Reservation> {
    const response = await api.post(`/negotiations/${id}/reservation`, payload);
    return response.data.data;
}

/**
 * Admin envia uma proposta formal com preço e datas customizadas.
 * A proposta fica pendente até o usuário responder via `respondToProposal`.
 *
 * @see POST /negotiations/:id/proposal
 */
export async function sendProposal(id: string, payload: SendProposalPayload): Promise<Negotiation> {
    const response = await api.post(`/negotiations/${id}/proposal`, payload);
    return response.data.data;
}

/**
 * Usuário aceita ou recusa a proposta pendente na negociação.
 * Se aceita, a reserva é criada automaticamente pelo backend.
 *
 * @see POST /negotiations/:id/proposal/respond
 */
export async function respondToProposal(id: string, action: "ACCEPT" | "REJECT"): Promise<RespondToProposalResult> {
    const response = await api.post(`/negotiations/${id}/proposal/respond`, { action });
    return response.data.data;
}

/**
 * Retorna as informações de contato públicas do espaço
 * (WhatsApp, e-mail, Instagram).
 *
 * @see GET /contact
 */
export async function getContactInfo(signal?: AbortSignal): Promise<ContactInfo> {
    const response = await api.get("/contact", { signal });
    return response.data.data;
}
