import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";

import { listVenues } from "../../services/venue";
import { useApiData } from "../../hooks/useApiData";
import { animateFadeInUp, animateStagger } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página de listagem dos espaços disponíveis para reserva.
 *
 * Carrega todos os venues via `listVenues` e exibe cards com informações de
 * capacidade e amenidades. Clicar em um card navega para `/reservation-intent/:venueId`.
 *
 * @see GET /venues
 * @component
 */
export default function Venues() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { data: venues, isLoading } = useApiData(listVenues, {
        initialData: [],
        errorMessage: "Erro ao carregar os espaços.",
    });

    useGSAP(() => {
        if (isLoading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-header"));
        animateStagger(el.querySelectorAll(".anim-card"), { delay: 0.15 });
    }, { scope: containerRef, dependencies: [isLoading] });

    if (isLoading) {
        return (
            <S.Container>
                <S.Header>
                    <S.HeaderContent>
                        <S.Title>Espaços disponíveis</S.Title>
                        <S.Description>
                            Carregando os ambientes disponíveis para reserva.
                        </S.Description>
                    </S.HeaderContent>
                </S.Header>

                <S.LoadingCard>
                    <h2>Carregando espaços...</h2>
                    <p>Aguarde enquanto buscamos os dados da API.</p>
                </S.LoadingCard>
            </S.Container>
        );
    }

    if (!(venues ?? []).length) {
        return (
            <S.Container>
                <S.Header>
                    <S.HeaderContent>
                        <S.Title>Espaços disponíveis</S.Title>
                        <S.Description>
                            Consulte os ambientes cadastrados para eventos e reservas.
                        </S.Description>
                    </S.HeaderContent>
                </S.Header>

                <S.EmptyState>
                    <h2>Nenhum espaço encontrado</h2>
                    <p>A API não retornou espaços cadastrados no momento.</p>
                </S.EmptyState>
            </S.Container>
        );
    }

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.HeaderContent>
                    <S.Title>Espaços disponíveis</S.Title>
                    <S.Description>
                        Consulte os ambientes cadastrados para eventos e reservas.
                    </S.Description>
                </S.HeaderContent>

                <S.Counter>{(venues ?? []).length} espaço(s)</S.Counter>
            </S.Header>

            <S.Grid>
                {(venues ?? []).map((venue) => (
                    <S.Card className="anim-card" key={venue.id}>
                        <S.CardContent>
                            <S.CardHeader>
                                <S.CardTitle>{venue.name}</S.CardTitle>

                                <S.PlansTag>
                                    A partir de R$ 650
                                </S.PlansTag>
                            </S.CardHeader>

                            <S.CardDescription>
                                {venue.description || "Sem descrição cadastrada para este espaço."}
                            </S.CardDescription>

                            <S.InfoList>
                                <li>
                                    <strong>Capacidade</strong>
                                    {venue.capacity ? `${venue.capacity} pessoas` : "Não informada"}
                                </li>

                                <li>
                                    <strong>Localização</strong>
                                    {venue.location || "Não informada"}
                                </li>

                                <li>
                                    <strong>Área Kids</strong>
                                    {venue.hasKidsArea ? "Disponível" : "Não disponível"}
                                </li>

                                <li>
                                    <strong>Piscina</strong>
                                    {venue.hasPool ? "Disponível" : "Não disponível"}
                                </li>
                            </S.InfoList>
                        </S.CardContent>

                        <S.Actions>
                            {venue.mapsUrl ? (
                                <S.ActionLink
                                    href={venue.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Rotas
                                </S.ActionLink>
                            ) : (
                                <S.ActionButton type="button" disabled>
                                    Rotas
                                </S.ActionButton>
                            )}

                            <S.PrimaryButton
                                type="button"
                                onClick={() => navigate(`/reservation-intent/${venue.id}`)}
                            >
                                Reservar
                            </S.PrimaryButton>
                        </S.Actions>
                    </S.Card>
                ))}
            </S.Grid>
        </S.Container>
    );
}
