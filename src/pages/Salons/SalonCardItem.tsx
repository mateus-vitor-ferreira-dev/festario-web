import type { CSSProperties } from "react";

import SalonMark from "../../components/SalonMark";
import VenueCover from "../../components/VenueCover";
import { formatCapacityRange, formatDistance, formatPlace, formatPrice } from "../../utils/salonFormat";
import type { SalonCard } from "../../types";
import * as S from "./styles";

interface SalonCardItemProps {
    salon: SalonCard;
    /** Busca atual da vitrine, para o "Todos os salões" da página do salão voltar aos mesmos filtros. */
    from: string;
    priority?: boolean;
}

/** Card da vitrine: o card inteiro leva à página do salão. */
export default function SalonCardItem({ salon, from, priority }: SalonCardItemProps) {
    const distance = formatDistance(salon.distanceKm);
    const place = formatPlace(salon.neighborhood, salon.city, salon.state);
    const price = formatPrice(salon.startingPrice);
    const amenities = [
        salon.amenities.hasPool && "Piscina",
        salon.amenities.hasKidsArea && "Área kids",
        salon.venueCount > 1 && `${salon.venueCount} espaços`,
    ].filter(Boolean) as string[];

    // A cor de cada card é a do próprio salão, não a do salão aberto no navegador.
    const accent = {
        "--card-salon": salon.primaryColor ?? undefined,
        "--card-salon-dark": salon.primaryColorDark ?? salon.primaryColor ?? undefined,
    } as CSSProperties;

    return (
        <S.CardItem>
            <S.CardLink to={`/s/${salon.slug}`} state={{ from }} style={accent}>
                <S.CardCover>
                    <VenueCover
                        venueName={salon.name}
                        photo={salon.cover}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
                        priority={priority}
                    />
                    {distance && <S.DistanceBadge>{distance}</S.DistanceBadge>}
                </S.CardCover>

                <S.CardBody>
                    <S.CardHeading>
                        <SalonMark name={salon.name} logoVariants={salon.logoVariants} logoUrl={salon.logoUrl} size="sm" decorative />
                        <S.CardName>{salon.name}</S.CardName>
                    </S.CardHeading>
                    {place && <S.CardPlace>{place}</S.CardPlace>}

                    <S.CardFacts>
                        <div>
                            <dt>Preço</dt>
                            <dd>{price ? <>a partir de <strong>{price}</strong></> : "sob consulta"}</dd>
                        </div>
                        <div>
                            <dt>Convidados</dt>
                            <dd>{formatCapacityRange(salon.capacity)}</dd>
                        </div>
                    </S.CardFacts>

                    {amenities.length > 0 && (
                        <S.Tags aria-label="Comodidades">
                            {amenities.map((a) => <li key={a}>{a}</li>)}
                        </S.Tags>
                    )}
                </S.CardBody>
            </S.CardLink>
        </S.CardItem>
    );
}
