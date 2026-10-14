import type { RefObject } from "react";
import { formatRange, getPageItems } from "./getPageItems";
import * as S from "./styles";

export interface PaginationProps {
    page: number;
    /** Total de páginas; omitido quando a API ainda não informa o total. */
    totalPages?: number;
    /** Total de itens (para "Mostrando X–Y de Z"). */
    total?: number;
    limit: number;
    /** Quantidade de itens na página atual. */
    count: number;
    /** Usado quando `totalPages` é desconhecido. */
    hasNext?: boolean;
    onChange: (page: number) => void;
    /** Elemento que recebe foco/rolagem ao trocar de página (topo da lista). */
    scrollTargetRef?: RefObject<HTMLElement | null>;
    disabled?: boolean;
    /** Nome acessível da navegação. */
    label?: string;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
        </svg>
    );
}

/**
 * Paginação acessível: `<nav aria-label>`, página atual com `aria-current="page"`,
 * reticências para muitas páginas e, em telas ≤ md, a forma compacta
 * "Anterior · Página X de Y · Próxima". Esconde-se quando há uma única página.
 */
export default function Pagination({
    page,
    totalPages,
    total,
    limit,
    count,
    hasNext,
    onChange,
    scrollTargetRef,
    disabled = false,
    label = "Paginação",
}: PaginationProps) {
    const knownTotal = totalPages !== undefined;
    const canNext = knownTotal ? page < totalPages : Boolean(hasNext);
    const canPrev = page > 1;

    if (!canPrev && !canNext) return null;

    function go(next: number) {
        if (disabled || next === page || next < 1 || (knownTotal && next > totalPages)) return;
        onChange(next);
        const target = scrollTargetRef?.current;
        if (target) {
            if (typeof target.scrollIntoView === "function") target.scrollIntoView({ block: "start", behavior: "smooth" });
            target.focus({ preventScroll: true });
        }
    }

    const items = knownTotal ? getPageItems(page, totalPages) : [];

    return (
        <S.Wrapper>
            {total !== undefined && (
                <S.Summary aria-live="polite">{formatRange(page, limit, count, total)}</S.Summary>
            )}
            <S.Nav aria-label={label}>
                <S.List>
                    <li>
                        <S.StepButton type="button" onClick={() => go(page - 1)} disabled={!canPrev || disabled}>
                            <Chevron dir="left" />
                            Anterior
                        </S.StepButton>
                    </li>

                    {items.map((item) =>
                        typeof item === "number" ? (
                            <S.NumberItem key={item}>
                                <S.PageButton
                                    type="button"
                                    aria-label={`Página ${item}`}
                                    aria-current={item === page ? "page" : undefined}
                                    $current={item === page}
                                    onClick={() => go(item)}
                                    disabled={disabled && item !== page}
                                >
                                    {item}
                                </S.PageButton>
                            </S.NumberItem>
                        ) : (
                            <S.NumberItem key={item} aria-hidden="true">
                                <S.Ellipsis>…</S.Ellipsis>
                            </S.NumberItem>
                        ),
                    )}

                    <S.CompactItem $always={!knownTotal}>
                        <S.Compact>
                            {knownTotal ? `Página ${page} de ${totalPages}` : `Página ${page}`}
                        </S.Compact>
                    </S.CompactItem>

                    <li>
                        <S.StepButton type="button" onClick={() => go(page + 1)} disabled={!canNext || disabled}>
                            Próxima
                            <Chevron dir="right" />
                        </S.StepButton>
                    </li>
                </S.List>
            </S.Nav>
        </S.Wrapper>
    );
}

