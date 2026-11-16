import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import ProviderCardItem from "../../components/Marketplace/ProviderCardItem";
import { CATEGORY_LABELS } from "../../constants/providers";
import { getPartyServices } from "../../services/partner";
import type { PartyServices } from "../../types";
import { getHttpStatus, isAbortError } from "../../utils/errors";
import { getLoadErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate } from "../../utils/providerFormat";
import * as SS from "../Salons/styles";
import * as SP from "../SalonPage/styles";
import * as S from "./styles";

type LoadState = { status: "loading" } | { status: "ready"; data: PartyServices } | { status: "missing" } | { status: "error"; message: string };

/**
 * "Monte a sua festa": para uma reserva, os serviços livres na data que atendem o local, por
 * categoria, com os fornecedores que o salão indica primeiro. Cada card abre o prestador com o pedido
 * de orçamento já preenchido com a data, os convidados e a reserva. `?salao=` é o salão da reserva
 * (a chamada vai no contexto dele).
 *
 * @see GET /reservations/:id/party-services
 */
export default function PartyBuilder() {
    const { reservationId = "" } = useParams();
    const [params] = useSearchParams();
    const salon = params.get("salao");
    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        const controller = new AbortController();
        getPartyServices(reservationId, salon, controller.signal)
            .then((data) => setState({ status: "ready", data }))
            .catch((err) => {
                if (isAbortError(err)) return;
                setState(getHttpStatus(err) === 404 ? { status: "missing" } : { status: "error", message: getLoadErrorMessage(err, "Não foi possível carregar os serviços.") });
            });
        return () => controller.abort();
    }, [reservationId, salon]);

    const back = <SP.BackLink as={Link} to="/reservations">Minhas reservas</SP.BackLink>;

    if (state.status === "loading") return <SS.Container>{back}<SS.Status role="status">Procurando quem está livre na data...</SS.Status></SS.Container>;
    if (state.status !== "ready") {
        return (
            <SS.Container>
                {back}
                <SP.Notice role={state.status === "error" ? "alert" : undefined}>
                    <h1>{state.status === "missing" ? "Reserva não encontrada" : "A página não carregou"}</h1>
                    <p>{state.status === "missing" ? "Abra o \"Monte a sua festa\" a partir de uma das suas reservas." : state.message}</p>
                </SP.Notice>
            </SS.Container>
        );
    }

    const d = state.data;
    const quoteSearch = `?data=${d.date}${d.guests ? `&convidados=${d.guests}` : ""}&reserva=${d.reservationId}`;
    const place = d.city ? ` em ${d.city}` : "";

    return (
        <SS.Container>
            {back}
            <SS.PageHeader>
                <SS.Title>Monte a sua festa</SS.Title>
                <SS.Lead>
                    Quem está livre em {formatEventDate(d.date)} e atende{place}. Os indicados pelo salão vêm primeiro em cada serviço.
                </SS.Lead>
            </SS.PageHeader>

            {d.categories.length === 0 ? (
                <SP.Notice>
                    <h2>Ainda não há prestadores livres nessa data{place}</h2>
                    <p>A vitrine de serviços está começando. Veja todos os serviços ou volte mais perto da festa.</p>
                    <SP.SecondaryButton as={Link} to={`/servicos?date=${d.date}`}>Ver todos os serviços</SP.SecondaryButton>
                </SP.Notice>
            ) : (
                d.categories.map((c) => (
                    <S.Category key={c.category} aria-labelledby={`cat-${c.category}`}>
                        <S.CategoryHead>
                            <h2 id={`cat-${c.category}`}>{CATEGORY_LABELS[c.category]}</h2>
                            <Link to={`/servicos?category=${c.category}&date=${d.date}`}>Ver mais</Link>
                        </S.CategoryHead>
                        <SS.Grid>
                            {c.providers.map((p) => (
                                <SS.CardItem key={p.slug}>
                                    <ProviderCardItem provider={p} quoteSearch={quoteSearch} recommended={p.recommended} note={p.note} />
                                </SS.CardItem>
                            ))}
                        </SS.Grid>
                    </S.Category>
                ))
            )}
        </SS.Container>
    );
}
