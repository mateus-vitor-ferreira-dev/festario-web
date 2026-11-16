import VenueCover from "../VenueCover";
import { CATEGORY_LABELS } from "../../constants/providers";
import type { ProviderCard } from "../../types";
import { formatProviderPrice } from "../../utils/providerFormat";
import { formatDistance, formatPlace } from "../../utils/salonFormat";
import * as S from "./styles";

interface ProviderCardItemProps {
    provider: ProviderCard;
    /** Busca atual, para a página do prestador voltar aos mesmos filtros. */
    from?: string;
    /** Parâmetros para o pedido de orçamento já sair preenchido (data, convidados, reserva). */
    quoteSearch?: string;
    priority?: boolean;
    /** Indicado pelo salão da reserva. */
    recommended?: boolean;
    note?: string | null;
    headingLevel?: "h2" | "h3" | "h4";
    /** Na página do salão o card não traz preço (a indicação é o que importa ali). */
    showPrice?: boolean;
}

/** Card do prestador: o card inteiro leva à página dele. */
export default function ProviderCardItem({ provider, from, quoteSearch, priority, recommended, note, headingLevel = "h3", showPrice = true }: ProviderCardItemProps) {
    const price = formatProviderPrice(provider.startingPrice, provider.startingPriceUnit);
    const distance = formatDistance(provider.distanceKm);
    const place = formatPlace(null, provider.city, provider.state);
    return (
        <S.CardLink to={`/servicos/${provider.slug}${quoteSearch ?? ""}`} state={{ from }}>
            <S.CardCover>
                <VenueCover venueName={provider.name} photo={provider.cover} sizes="(max-width: 768px) 100vw, 360px" priority={priority} />
                {recommended ? <S.Badge $tone="gold">Indicado pelo salão</S.Badge> : distance && <S.Badge>{distance}</S.Badge>}
            </S.CardCover>
            <S.CardBody>
                <S.CardCategories>{provider.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}</S.CardCategories>
                <S.CardName as={headingLevel}>{provider.name}</S.CardName>
                {place && <S.CardMeta>{place}</S.CardMeta>}
                {showPrice && <S.CardPrice>{price ? <>a partir de <strong>{price}</strong></> : "Preço sob orçamento"}</S.CardPrice>}
                {note && <S.CardNote>{note}</S.CardNote>}
            </S.CardBody>
        </S.CardLink>
    );
}
