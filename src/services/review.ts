/**
 * @module services/review
 * @description Avaliações dos prestadores: só de quem contratou pela plataforma, depois da festa.
 */
import api from "./api";
import { toPaginated } from "./pagination";
import type { ListParams, PublicReview, ReviewList } from "../types";

function toReviewList(data: { summary?: ReviewList["summary"] }, params: ListParams): ReviewList {
    return { ...toPaginated<PublicReview>(data, params), summary: data?.summary ?? { average: null, count: 0, distribution: [] } };
}

/** @see GET /providers/:slug/reviews?page=&limit= */
export async function listProviderReviews(slug: string, params: ListParams = {}, signal?: AbortSignal): Promise<ReviewList> {
    const { data } = await api.get(`/providers/${encodeURIComponent(slug)}/reviews`, { signal, params });
    return toReviewList(data, params);
}

/** @see GET /providers/me/reviews?page=&limit= */
export async function listMyReviews(params: ListParams = {}, signal?: AbortSignal): Promise<ReviewList> {
    const { data } = await api.get("/providers/me/reviews", { signal, params });
    return toReviewList(data, params);
}

/** @see POST /quotes/:id/review */
export async function createReview(quoteId: string, rating: number, comment?: string | null): Promise<PublicReview> {
    const { data } = await api.post(`/quotes/${quoteId}/review`, { rating, comment });
    return data.data;
}

/** @see POST /providers/me/reviews/:id/reply */
export async function replyReview(reviewId: string, reply: string): Promise<PublicReview> {
    const { data } = await api.post(`/providers/me/reviews/${reviewId}/reply`, { reply });
    return data.data;
}
