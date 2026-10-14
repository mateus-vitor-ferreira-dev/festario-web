import * as S from "./styles";

export interface FilterChip {
    key: string;
    /** Texto do chip, ex.: "Status: Pago". */
    label: string;
}

interface ActiveFilterChipsProps {
    chips: FilterChip[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
}

function CloseIcon() {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

/** Filtros ativos como chips removíveis (quebram linha) + "Limpar filtros". */
export default function ActiveFilterChips({ chips, onRemove, onClearAll }: ActiveFilterChipsProps) {
    if (chips.length === 0) return null;
    return (
        <S.ChipBar>
            <S.ChipList aria-label="Filtros ativos">
                {chips.map((chip) => (
                    <li key={chip.key}>
                        <S.Chip type="button" aria-label={`Remover filtro ${chip.label}`} onClick={() => onRemove(chip.key)}>
                            <span>{chip.label}</span>
                            <CloseIcon />
                        </S.Chip>
                    </li>
                ))}
            </S.ChipList>
            <S.ClearButton type="button" onClick={onClearAll}>Limpar filtros</S.ClearButton>
        </S.ChipBar>
    );
}
