/**
 * @module services/quote
 * @description Pedidos de orçamento do marketplace: o cliente pede ao prestador, o prestador responde.
 */
import api from "./api";
import { cleanParams, toPaginated } from "./pagination";
import type { CustomerQuote, ListParams, PaginatedResult, ProviderQuote, QuoteRequestInput, QuoteStatus } from "../types";

/** @see POST /providers/:slug/quotes */
export async function requestQuote(slug: string, input: QuoteRequestInput): Promise<CustomerQuote> {
    const { data } = await api.post(`/providers/${encodeURIComponent(slug)}/quotes`, input);
    return data.data;
}

/** @see GET /quotes/mine?status=&page=&limit= */
export async function listMyQuotes(params: ListParams = {}, signal?: AbortSignal): Promise<PaginatedResult<CustomerQuote>> {
    const { data } = await api.get("/quotes/mine", { signal, params: cleanParams(params) });
    return toPaginated<CustomerQuote>(data, params);
}

export interface ProviderQuoteList extends PaginatedResult<ProviderQuote> {
    counts: Partial<Record<QuoteStatus, number>>;
}

/** @see GET /providers/me/quotes?status=&page=&limit= */
export async function listReceivedQuotes(params: ListParams = {}, signal?: AbortSignal): Promise<ProviderQuoteList> {
    const { data } = await api.get("/providers/me/quotes", { signal, params: cleanParams(params) });
    return { ...toPaginated<ProviderQuote>(data, params), counts: data?.counts ?? {} };
}

const post = async <T>(path: string, body?: object): Promise<T> => (await api.post(path, body)).data.data;

export const acceptQuote = (id: string) => post<CustomerQuote>(`/quotes/${id}/accept`);
export const declineQuote = (id: string) => post<CustomerQuote>(`/quotes/${id}/decline`);
export const cancelQuote = (id: string) => post<CustomerQuote>(`/quotes/${id}/cancel`);
export const answerQuote = (id: string, amount: number, message: string) => post<ProviderQuote>(`/quotes/${id}/answer`, { amount, message });
export const rejectQuote = (id: string, reason?: string | null) => post<ProviderQuote>(`/quotes/${id}/reject`, { reason });
export const markQuoteHired = (id: string, closedAmount?: number | null) => post<ProviderQuote>(`/quotes/${id}/hired`, { closedAmount });
