import { ReactNode, useId, useState } from "react";
import * as S from "./styles";

export interface FilterBarProps {
    /** Campos de filtro (FilterField, SelectField, TextField…). */
    children: ReactNode;
    /** Quantidade de filtros ativos — aparece no botão "Filtros (n)" em telas ≤ md. */
    activeCount?: number;
    /** Conteúdo abaixo da grade (ex.: chips de filtros ativos). */
    footer?: ReactNode;
    /** Nome acessível do grupo de filtros. */
    label?: string;
}

function FilterIcon() {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
    );
}

/**
 * Barra de filtros responsiva: grade de campos com rótulo visível. Em telas ≤ md
 * os campos ficam atrás do botão "Filtros (n)", que mostra quantos estão ativos;
 * os chips (`footer`) continuam sempre visíveis.
 */
export default function FilterBar({ children, activeCount = 0, footer, label = "Filtros" }: FilterBarProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <S.Root role="search" aria-label={label}>
            <S.Toggle
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
            >
                <FilterIcon />
                {activeCount > 0 ? `Filtros (${activeCount})` : "Filtros"}
            </S.Toggle>
            <S.Panel id={panelId} $open={open}>
                <S.Grid>{children}</S.Grid>
            </S.Panel>
            {footer}
        </S.Root>
    );
}
