import { CATEGORY_LABELS, PROVIDER_CATEGORIES } from "../../constants/providers";
import type { ProviderCategory } from "../../types";
import * as S from "./styles";

interface CategoryBuntingProps {
    value: ProviderCategory | "";
    onChange: (next: ProviderCategory | "") => void;
    /** Inclui a bandeirinha "Todos" no começo. */
    withAll?: boolean;
}

/** Filtro de categoria em forma de bandeirinhas: a escolhida desce um pouco no cordão. */
export default function CategoryBunting({ value, onChange, withAll = true }: CategoryBuntingProps) {
    const items: (ProviderCategory | "")[] = withAll ? ["", ...PROVIDER_CATEGORIES] : [...PROVIDER_CATEGORIES];
    return (
        <S.Bunting>
            <S.BuntingList role="group" aria-label="Categoria do serviço">
                {items.map((c, i) => {
                    const active = value === c;
                    return (
                        <li key={c || "all"}>
                            <S.Flag
                                type="button"
                                $index={i}
                                $active={active}
                                aria-pressed={active}
                                // tocar de novo na escolhida volta para todos
                                onClick={() => onChange(active && c ? "" : c)}
                            >
                                {c ? CATEGORY_LABELS[c] : "Todos"}
                            </S.Flag>
                        </li>
                    );
                })}
            </S.BuntingList>
        </S.Bunting>
    );
}
