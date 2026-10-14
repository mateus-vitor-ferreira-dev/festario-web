import { ChangeEvent, KeyboardEvent, ReactNode, useEffect, useId, useState } from "react";
import DatePickerInput from "../DatePickerInput";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { parseMoney } from "./money";
import * as S from "./styles";

/**
 * Quando o valor aplicado muda por fora (chip removido, "Limpar filtros",
 * voltar no histórico), descarta o rascunho e a digitação pendente.
 * Ajuste de estado durante a renderização, como recomenda o React.
 */
function useExternalReset(value: string, setDraft: (v: string) => void, cancel: () => void) {
    const [applied, setApplied] = useState(value);
    if (applied !== value) {
        setApplied(value);
        setDraft(value);
    }
    useEffect(() => {
        cancel();
    }, [value, cancel]);
}

interface BaseFieldProps {
    label: string;
    /** Ocupa duas colunas da grade (campos de busca/faixa). */
    wide?: boolean;
    id?: string;
}

/** Rótulo visível + controle. Use quando o controle não for um dos campos prontos. */
export function FilterField({ label, wide, htmlFor, children }: Omit<BaseFieldProps, "id"> & { htmlFor: string; children: ReactNode }) {
    return (
        <S.Field $wide={wide}>
            <S.Label htmlFor={htmlFor}>{label}</S.Label>
            {children}
        </S.Field>
    );
}

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    disabled?: boolean;
}

export function SelectField({ label, value, onChange, options, wide, id: idProp, disabled }: SelectFieldProps) {
    const generated = useId();
    const id = idProp ?? generated;
    return (
        <FilterField label={label} htmlFor={id} wide={wide}>
            <S.Select id={id} value={value} disabled={disabled} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </S.Select>
        </FilterField>
    );
}

interface TextFieldProps extends BaseFieldProps {
    value: string;
    /** Chamado com o valor já "assentado" (depois do debounce ou ao apertar Enter). */
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "search" | "text" | "number";
    inputMode?: "search" | "text" | "numeric" | "decimal";
    min?: number;
    /** Atraso antes de aplicar o valor digitado (padrão 300 ms). */
    debounceMs?: number;
}

/**
 * Campo de texto com debounce: o valor local responde a cada tecla e só é
 * aplicado ao filtro depois de `debounceMs` sem digitar (Enter aplica na hora).
 */
export function TextField({
    label, value, onChange, placeholder, type = "search", inputMode, min, wide, id: idProp, debounceMs = 300,
}: TextFieldProps) {
    const generated = useId();
    const id = idProp ?? generated;
    const [draft, setDraft] = useState(value);
    const { debounced, flush, cancel } = useDebouncedCallback(onChange, debounceMs);
    useExternalReset(value, setDraft, cancel);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setDraft(e.target.value);
        debounced(e.target.value);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            flush();
        }
    }

    return (
        <FilterField label={label} htmlFor={id} wide={wide}>
            <S.Input
                id={id}
                type={type}
                inputMode={inputMode}
                min={min}
                value={draft}
                placeholder={placeholder}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={flush}
                autoComplete="off"
            />
        </FilterField>
    );
}

interface DateFieldProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
    maxDate?: string;
}

/** Data (YYYY-MM-DD) com o mesmo DatePickerInput do resto do app. */
export function DateField({ label, value, onChange, minDate, maxDate, wide, id: idProp }: DateFieldProps) {
    const generated = useId();
    const id = idProp ?? generated;
    return (
        <FilterField label={label} htmlFor={id} wide={wide}>
            <DatePickerInput
                id={id}
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            />
        </FilterField>
    );
}

interface MoneyRangeFieldProps extends Omit<BaseFieldProps, "id"> {
    min: string;
    max: string;
    onChange: (range: { min: string; max: string }) => void;
    debounceMs?: number;
}

function MoneyInput({ id, prefix, value, onCommit, debounceMs, ariaLabel }: {
    id: string; prefix: string; value: string; onCommit: (v: string) => void; debounceMs: number; ariaLabel: string;
}) {
    const [draft, setDraft] = useState(value);
    const { debounced, flush, cancel } = useDebouncedCallback((v: string) => onCommit(parseMoney(v)), debounceMs);
    useExternalReset(value, setDraft, cancel);

    return (
        <S.AffixBox>
            <label htmlFor={id}>{prefix}</label>
            <input
                id={id}
                aria-label={ariaLabel}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={draft}
                placeholder="0"
                onChange={(e) => { setDraft(e.target.value); debounced(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); flush(); } }}
                onBlur={flush}
            />
        </S.AffixBox>
    );
}

/** Faixa de preço em reais: "de R$ ___  até R$ ___" num único grupo rotulado. */
export function MoneyRangeField({ label, min, max, onChange, wide = true, debounceMs = 500 }: MoneyRangeFieldProps) {
    const base = useId();
    return (
        <S.Fieldset $wide={wide}>
            <S.Legend>{label}</S.Legend>
            <S.RangeRow>
                <MoneyInput
                    id={`${base}-min`}
                    prefix="de R$"
                    ariaLabel={`${label}: valor mínimo em reais`}
                    value={min}
                    debounceMs={debounceMs}
                    onCommit={(v) => onChange({ min: v, max })}
                />
                <MoneyInput
                    id={`${base}-max`}
                    prefix="até R$"
                    ariaLabel={`${label}: valor máximo em reais`}
                    value={max}
                    debounceMs={debounceMs}
                    onCommit={(v) => onChange({ min, max: v })}
                />
            </S.RangeRow>
        </S.Fieldset>
    );
}
