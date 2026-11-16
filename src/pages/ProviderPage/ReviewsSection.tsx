import { useEffect, useState } from "react";

import { RatingLine, StarsDisplay } from "../../components/Marketplace/Stars";
import { listProviderReviews } from "../../services/review";
import type { PublicReview, ReviewList } from "../../types";
import { isAbortError } from "../../utils/errors";
import * as SP from "../SalonPage/styles";
import * as S from "./styles";

const PAGE = 5;

/** "2026-10" → "outubro de 2026". */
const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

/**
 * Avaliações na página do prestador: a média, quantas de cada nota e a lista, com a resposta do
 * prestador. Todas são de quem contratou pela plataforma. Sem avaliação, a seção não aparece.
 *
 * @see GET /providers/:slug/reviews
 */
export default function ReviewsSection({ slug }: { slug: string }) {
    const [list, setList] = useState<ReviewList | null>(null);
    const [items, setItems] = useState<PublicReview[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        listProviderReviews(slug, { limit: PAGE, page: 1 }, controller.signal)
            .then((r) => { setList(r); setItems(r.data); })
            .catch((err) => { if (!isAbortError(err)) setList(null); });
        return () => controller.abort();
    }, [slug]);

    if (!list || list.summary.count === 0) return null;

    async function more() {
        if (!list) return;
        setLoadingMore(true);
        try {
            const next = await listProviderReviews(slug, { limit: PAGE, page: Math.floor(items.length / PAGE) + 1 });
            setItems((cur) => [...cur, ...next.data]);
        } finally {
            setLoadingMore(false);
        }
    }

    const { summary } = list;
    const max = Math.max(1, ...summary.distribution.map((d) => d.count));

    return (
        <section aria-labelledby="reviews-title" id="reviews">
            <SP.SectionTitle id="reviews-title">Avaliações de quem contratou</SP.SectionTitle>
            <S.ReviewSummary>
                <div>
                    <S.BigAverage>{summary.average?.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</S.BigAverage>
                    <RatingLine average={summary.average} count={summary.count} />
                </div>
                <S.Bars aria-label="Quantas avaliações de cada nota">
                    {summary.distribution.map((d) => (
                        <li key={d.rating}>
                            <span>{d.rating} ★</span>
                            <S.Bar><span style={{ width: `${(d.count / max) * 100}%` }} /></S.Bar>
                            <span>{d.count}</span>
                        </li>
                    ))}
                </S.Bars>
            </S.ReviewSummary>

            <S.ReviewList>
                {items.map((r) => (
                    <li key={r.id}>
                        <S.ReviewHead>
                            <StarsDisplay value={r.rating} />
                            <strong>{r.author}</strong>
                            <span>{r.eventType}, {monthLabel(r.eventMonth)}</span>
                        </S.ReviewHead>
                        {r.comment && <p>{r.comment}</p>}
                        {r.reply && (
                            <S.Reply>
                                <strong>Resposta do prestador</strong>
                                <p>{r.reply}</p>
                            </S.Reply>
                        )}
                    </li>
                ))}
            </S.ReviewList>
            {items.length < summary.count && (
                <SP.SecondaryButton type="button" onClick={more} disabled={loadingMore} aria-busy={loadingMore}>
                    {loadingMore ? "Carregando..." : "Ver mais avaliações"}
                </SP.SecondaryButton>
            )}
        </section>
    );
}
