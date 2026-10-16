import * as S from "./styles";

interface NoResultsProps {
    title: string;
    description?: string;
    onClear: () => void;
    clearLabel?: string;
}

/**
 * Estado "nenhum resultado para os filtros" — diferente do estado vazio
 * "ainda não há dados": oferece a saída "Limpar filtros".
 */
export default function NoResults({ title, description = "Ajuste ou remova algum filtro para ver mais resultados.", onClear, clearLabel = "Limpar filtros" }: NoResultsProps) {
    return (
        <S.NoResults role="status">
            <h3>{title}</h3>
            <p>{description}</p>
            <button type="button" onClick={onClear}>{clearLabel}</button>
        </S.NoResults>
    );
}
