import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { CATEGORY_LABELS, PROVIDER_CATEGORIES } from "../../constants/providers";
import type { ProviderCategory } from "../../types";
import * as S from "./styles";

interface CategoryBuntingProps {
    value: ProviderCategory | "";
    onChange: (next: ProviderCategory | "") => void;
    /** Inclui a bandeirinha "Todos" no começo. */
    withAll?: boolean;
}

/** Quanto esperar depois do último movimento antes de aplicar a bandeira do meio como filtro. */
const SETTLE_MS = 160;

const prefersReducedMotion = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Filtro de categoria em carrossel de bandeirinhas: a do meio fica em destaque e é o filtro ativo.
 * Arrastar o cordão, tocar numa bandeira, as setas ou ← → no teclado trazem outra para o meio; o
 * filtro só muda quando o cordão para, para a lista não recarregar a cada bandeira que passa.
 */
export default function CategoryBunting({ value, onChange, withAll = true }: CategoryBuntingProps) {
    const items: (ProviderCategory | "")[] = withAll ? ["", ...PROVIDER_CATEGORIES] : [...PROVIDER_CATEGORIES];
    const valueIndex = Math.max(0, items.indexOf(value));

    const trackRef = useRef<HTMLUListElement | null>(null);
    const flagRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const settleTimer = useRef<number | undefined>(undefined);
    /** Índice que o próprio componente mandou centralizar: enquanto o cordão anda até ele, o meio não é recalculado. */
    const targetRef = useRef<number | null>(null);
    const [center, setCenter] = useState(valueIndex);
    // O filtro mudou por fora (URL, "limpar filtros"): o meio passa a ser a bandeira escolhida.
    const [syncedIndex, setSyncedIndex] = useState(valueIndex);
    if (syncedIndex !== valueIndex) {
        setSyncedIndex(valueIndex);
        setCenter(valueIndex);
    }

    const scrollToIndex = useCallback((i: number, smooth: boolean) => {
        const track = trackRef.current;
        const flag = flagRefs.current[i];
        if (!track || !flag) return;
        const left = flag.offsetLeft + flag.offsetWidth / 2 - track.clientWidth / 2;
        if (typeof track.scrollTo === "function") track.scrollTo({ left, behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
        else track.scrollLeft = left;
    }, []);

    // Leva a bandeira escolhida para o meio do cordão, sem animar na primeira vez.
    const firstRun = useRef(true);
    useLayoutEffect(() => {
        targetRef.current = valueIndex;
        scrollToIndex(valueIndex, !firstRun.current);
        firstRun.current = false;
    }, [valueIndex, scrollToIndex]);

    useEffect(() => () => window.clearTimeout(settleTimer.current), []);

    const commit = (i: number) => {
        const next = items[i];
        if (next !== undefined && next !== value) onChange(next);
    };

    const select = (i: number) => {
        const clamped = Math.min(items.length - 1, Math.max(0, i));
        targetRef.current = clamped;
        setCenter(clamped);
        scrollToIndex(clamped, true);
        commit(clamped);
    };

    /** A bandeira mais perto do meio do cordão. */
    const nearestToCenter = () => {
        const track = trackRef.current;
        if (!track) return center;
        const middle = track.scrollLeft + track.clientWidth / 2;
        let best = center;
        let bestDistance = Infinity;
        flagRefs.current.forEach((flag, i) => {
            if (!flag) return;
            const distance = Math.abs(flag.offsetLeft + flag.offsetWidth / 2 - middle);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = i;
            }
        });
        return best;
    };

    const onScroll = () => {
        const nearest = nearestToCenter();
        // Rolagem pedida pelo componente: só acompanha, e solta o alvo quando chega nele.
        if (targetRef.current !== null) {
            if (nearest === targetRef.current) targetRef.current = null;
            return;
        }
        setCenter(nearest);
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => commit(nearestToCenter()), SETTLE_MS);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        const jump = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
        if (!step && jump === null) return;
        e.preventDefault();
        const next = jump ?? Math.min(items.length - 1, Math.max(0, center + step));
        select(next);
        flagRefs.current[next]?.focus({ preventScroll: true });
    };

    const label = (c: ProviderCategory | "") => (c ? CATEGORY_LABELS[c] : "Todos");

    return (
        <S.Carousel>
            <S.CarouselArrow
                type="button"
                $side="left"
                aria-label="Categoria anterior"
                onClick={() => select(center - 1)}
                disabled={center === 0}
            >
                <span aria-hidden="true">‹</span>
            </S.CarouselArrow>

            <S.CarouselTrack ref={trackRef} role="group" aria-label="Categoria do serviço" onScroll={onScroll} onKeyDown={onKeyDown}>
                {items.map((c, i) => {
                    const distance = Math.abs(i - center);
                    return (
                        <li key={c || "all"}>
                            <S.Flag
                                ref={(el) => {
                                    flagRefs.current[i] = el;
                                }}
                                type="button"
                                $index={i}
                                $distance={distance}
                                aria-pressed={i === valueIndex}
                                // só a do meio entra na ordem do Tab; as outras se alcançam pelas setas
                                tabIndex={i === center ? 0 : -1}
                                onClick={() => select(i)}
                            >
                                {label(c)}
                            </S.Flag>
                        </li>
                    );
                })}
            </S.CarouselTrack>

            <S.CarouselArrow
                type="button"
                $side="right"
                aria-label="Próxima categoria"
                onClick={() => select(center + 1)}
                disabled={center === items.length - 1}
            >
                <span aria-hidden="true">›</span>
            </S.CarouselArrow>
        </S.Carousel>
    );
}
