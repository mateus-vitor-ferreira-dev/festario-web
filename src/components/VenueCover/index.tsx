import styled from "styled-components";

import { Bunting } from "../SalonMark/Bunting";
import { initials, pickVariant, srcSet } from "../../utils/images";
import type { VenuePhoto } from "../../types";

interface VenueCoverProps {
    venueName: string;
    photo?: VenuePhoto | null;
    /** Largura em que a imagem aparece, para o navegador escolher o tamanho (`sizes`). */
    sizes: string;
    /** Proporção da moldura (largura / altura). */
    ratio?: number;
    /** Primeira dobra: carrega já e com prioridade; o resto carrega quando chega perto da tela. */
    priority?: boolean;
}

/**
 * Capa do espaço com espaço reservado pela proporção (sem pulo de layout) e o tamanho certo pelo
 * `srcset`. Sem foto, uma ilustração neutra: bandeirinhas e as iniciais do espaço, nunca imagem quebrada.
 */
export default function VenueCover({ venueName, photo, sizes, ratio = 16 / 10, priority = false }: VenueCoverProps) {
    if (!photo) {
        return (
            <Frame $ratio={ratio} $empty role="img" aria-label={`${venueName}: ainda sem fotos`}>
                <EmptyFlags flags={7} />
                <EmptyInitials aria-hidden="true">{initials(venueName)}</EmptyInitials>
            </Frame>
        );
    }
    const fallback = pickVariant(photo.variants, 960);
    return (
        <Frame $ratio={ratio}>
            <img
                src={fallback?.url}
                srcSet={srcSet(photo.variants)}
                sizes={sizes}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                {...(priority && { fetchPriority: "high" as const })}
            />
        </Frame>
    );
}

const Frame = styled.div<{ $ratio: number; $empty?: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  overflow: hidden;
  background: ${({ $empty }) => ($empty ? "var(--bg-muted)" : "var(--bg-muted)")};
  color: var(--salon-accent);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EmptyFlags = styled(Bunting)`
  position: absolute;
  top: 10%;
  left: 6%;
  width: 88%;
  height: 26%;
  color: var(--border-medium);
`;

const EmptyInitials = styled.span`
  position: absolute;
  inset: 34% 0 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 9vw, 3.5rem);
  color: var(--text-faint);
  letter-spacing: 0.04em;
`;
