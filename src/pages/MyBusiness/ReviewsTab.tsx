import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { RatingLine, StarsDisplay } from "../../components/Marketplace/Stars";
import { listMyReviews, replyReview } from "../../services/review";
import type { PublicReview, ReviewList } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage } from "../../utils/getErrorMessage";
import * as A from "../Admin/styles";
import * as S from "./styles";

/**
 * Avaliações recebidas, as sem resposta primeiro. A resposta aparece logo abaixo da avaliação na
 * página pública; responder de novo troca o texto.
 *
 * @see GET /providers/me/reviews
 */
export default function ReviewsTab() {
    const [list, setList] = useState<ReviewList | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        listMyReviews({ limit: 50 }, controller.signal)
            .then(setList)
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar as avaliações.")); });
        return () => controller.abort();
    }, []);

    const replace = (r: PublicReview) => setList((cur) => (cur ? { ...cur, data: cur.data.map((x) => (x.id === r.id ? r : x)) } : cur));

    return (
        <A.Section aria-labelledby="reviews-tab-title">
            <A.SectionTitle id="reviews-tab-title">Avaliações</A.SectionTitle>
            {list === null ? (
                <A.LoadingSpinner aria-label="Carregando as avaliações" />
            ) : list.summary.count === 0 ? (
                <A.EmptyState>
                    Ainda sem avaliações. Quando você marca um orçamento como contratado, o cliente pode avaliar depois da festa.
                </A.EmptyState>
            ) : (
                <>
                    <RatingLine average={list.summary.average} count={list.summary.count} />
                    <S.QuoteList>
                        {list.data.map((r) => <ReviewItem key={`${r.id}:${r.reply ?? ""}`} review={r} onReplied={replace} />)}
                    </S.QuoteList>
                </>
            )}
        </A.Section>
    );
}

function ReviewItem({ review: r, onReplied }: { review: PublicReview; onReplied: (r: PublicReview) => void }) {
    const [editing, setEditing] = useState(!r.reply);
    const [text, setText] = useState(r.reply ?? "");
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (text.trim().length < 2) return toast.error("Escreva a resposta.");
        try {
            setBusy(true);
            onReplied(await replyReview(r.id, text.trim()));
            toast.success("Resposta publicada.");
            setEditing(false);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível publicar a resposta."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <S.QuoteCard $status={r.reply ? "HIRED" : "OPEN"}>
            <S.QuoteHead>
                <div>
                    <StarsDisplay value={r.rating} />
                    <S.QuoteWho>{r.author}, {r.eventType}</S.QuoteWho>
                </div>
                {!r.reply && <S.StatusTag $status="OPEN">Sem resposta</S.StatusTag>}
            </S.QuoteHead>
            {r.comment ? <S.QuoteMessage>{r.comment}</S.QuoteMessage> : <S.QuoteMeta>Sem comentário, só a nota.</S.QuoteMeta>}
            {editing ? (
                <S.InlineForm onSubmit={submit} noValidate>
                    <A.FormGroup>
                        <label htmlFor={`reply-${r.id}`}>Sua resposta (aparece na sua página)</label>
                        <S.TextArea id={`reply-${r.id}`} rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Agradeça e, se for o caso, explique o que aconteceu." />
                    </A.FormGroup>
                    <A.InlineGroup>
                        <A.PrimaryButton type="submit" disabled={busy} aria-busy={busy}>Publicar resposta</A.PrimaryButton>
                        {r.reply && <A.SecondaryButton type="button" onClick={() => { setText(r.reply ?? ""); setEditing(false); }} disabled={busy}>Cancelar</A.SecondaryButton>}
                    </A.InlineGroup>
                </S.InlineForm>
            ) : (
                <S.Answer>
                    <strong>Sua resposta</strong>
                    <p>{r.reply}</p>
                    <A.SecondaryButton type="button" $size="sm" onClick={() => setEditing(true)} style={{ marginTop: 8 }}>Editar resposta</A.SecondaryButton>
                </S.Answer>
            )}
        </S.QuoteCard>
    );
}
