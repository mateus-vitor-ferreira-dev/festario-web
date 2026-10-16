import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import VenueCover from "../VenueCover";
import { media } from "../../styles/breakpoints";
import { pickVariant, srcSet } from "../../utils/images";
import type { VenuePhoto } from "../../types";

interface VenueGalleryProps {
    venueName: string;
    photos: VenuePhoto[];
}

const THUMBS = 4;

/**
 * Fotos do espaço na página de reserva: a capa grande e as outras em miniatura. Qualquer foto abre a
 * visualização ampliada (Esc fecha, setas navegam, o foco volta para a foto que abriu).
 */
export default function VenueGallery({ venueName, photos }: VenueGalleryProps) {
    const [open, setOpen] = useState<number | null>(null);
    const openerRef = useRef<HTMLButtonElement | null>(null);

    if (photos.length === 0) return <VenueCover venueName={venueName} photo={null} sizes="(max-width: 1024px) 100vw, 640px" ratio={16 / 9} />;

    const [cover, ...rest] = photos;
    const thumbs = rest.slice(0, THUMBS);
    const hidden = rest.length - thumbs.length;

    function show(index: number, el: HTMLButtonElement) {
        openerRef.current = el;
        setOpen(index);
    }

    return (
        <Wrap>
            <CoverButton type="button" onClick={(e) => show(0, e.currentTarget)} aria-label={`Ampliar: ${cover.alt}`}>
                <VenueCover venueName={venueName} photo={cover} sizes="(max-width: 1024px) 100vw, 640px" ratio={16 / 9} priority />
            </CoverButton>
            {thumbs.length > 0 && (
                <Thumbs>
                    {thumbs.map((p, i) => {
                        const isLast = i === thumbs.length - 1 && hidden > 0;
                        const small = pickVariant(p.variants, 240);
                        return (
                            <li key={p.id}>
                                <ThumbButton type="button" onClick={(e) => show(i + 1, e.currentTarget)} aria-label={isLast ? `Ver as outras ${hidden + 1} fotos` : `Ampliar: ${p.alt}`}>
                                    <img src={small?.url} srcSet={srcSet(p.variants)} sizes="160px" width={p.width} height={p.height} alt="" loading="lazy" decoding="async" />
                                    {isLast && <More aria-hidden="true">+{hidden + 1}</More>}
                                </ThumbButton>
                            </li>
                        );
                    })}
                </Thumbs>
            )}
            {open !== null && (
                <Lightbox
                    photos={photos}
                    index={open}
                    venueName={venueName}
                    onIndex={setOpen}
                    onClose={() => { setOpen(null); openerRef.current?.focus(); }}
                />
            )}
        </Wrap>
    );
}

function Lightbox({ photos, index, venueName, onIndex, onClose }: { photos: VenuePhoto[]; index: number; venueName: string; onIndex: (i: number) => void; onClose: () => void }) {
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const photo = photos[index];
    const big = pickVariant(photo.variants, 1600);
    const go = (delta: number) => onIndex((index + delta + photos.length) % photos.length);

    useEffect(() => {
        closeRef.current?.focus();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
            // O Tab circula só entre os botões da visualização (diálogo modal).
            if (e.key === "Tab" && dialogRef.current) {
                const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button"));
                const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
                e.preventDefault();
                buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
            }
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    });

    return (
        <Overlay onClick={onClose}>
            <Dialog ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Fotos de ${venueName}`} onClick={(e) => e.stopPropagation()}>
                <figure>
                    <img src={big?.url} srcSet={srcSet(photo.variants)} sizes="(max-width: 1024px) 100vw, 1200px" width={photo.width} height={photo.height} alt={photo.alt} />
                    <figcaption>
                        <span>{photo.alt}</span>
                        <span aria-live="polite">{index + 1} de {photos.length}</span>
                    </figcaption>
                </figure>
                <Controls>
                    {photos.length > 1 && <ControlButton type="button" onClick={() => go(-1)} aria-label="Foto anterior">‹</ControlButton>}
                    <ControlButton ref={closeRef} type="button" onClick={onClose} aria-label="Fechar">✕</ControlButton>
                    {photos.length > 1 && <ControlButton type="button" onClick={() => go(1)} aria-label="Próxima foto">›</ControlButton>}
                </Controls>
            </Dialog>
        </Overlay>
    );
}

const Wrap = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

const resetButton = `
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
  border-radius: var(--radius-md);
  overflow: hidden;

  &:focus-visible {
    outline: 3px solid var(--brand);
    outline-offset: 2px;
  }
`;

const CoverButton = styled.button`
  ${resetButton}
  border-bottom: 3px solid var(--salon-accent);
`;

const Thumbs = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(${THUMBS}, minmax(0, 1fr));
  gap: 8px;

  ${media.sm} {
    gap: 6px;
  }
`;

const ThumbButton = styled.button`
  ${resetButton}
  position: relative;
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const More = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 19, 48, 0.62);
  color: #ffffff;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(10, 12, 32, 0.88);

  ${media.sm} {
    padding: 8px;
  }
`;

const Dialog = styled.div`
  display: grid;
  gap: 12px;
  width: min(1200px, 100%);

  figure {
    margin: 0;
    display: grid;
    gap: 10px;
  }

  img {
    width: 100%;
    max-height: 78vh;
    max-height: 78dvh;
    height: auto;
    object-fit: contain;
    border-radius: var(--radius-md);
  }

  figcaption {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: #f5f6fb;
    font-size: var(--text-sm);
    line-height: 1.45;

    span:last-child {
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
      color: #c7cdea;
    }
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const ControlButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  &:focus-visible {
    outline: 3px solid var(--gold);
    outline-offset: 2px;
  }
`;
