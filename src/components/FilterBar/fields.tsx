import { ChangeEvent, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
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

export interface MultiSelectGroup {
    key: string;
    label: string;
    items: readonly { value: string; label: string }[];
}

interface MultiSelectFieldProps extends BaseFieldProps {
    value: string[];
    onChange: (value: string[]) => void;
    groups: readonly MultiSelectGroup[];
    /** Texto quando nada está marcado. */
    placeholder?: string;
}

function ChevronIcon() {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

/**
 * Várias opções num campo só: o botão mostra o que está marcado e abre um painel com as opções em
 * grupos, como pílulas. Cada toque aplica na hora; Esc, clique fora ou "Pronto" fecham e devolvem o foco.
 */
export function MultiSelectField({ label, value, onChange, groups, placeholder = "Qualquer uma", wide, id: idProp }: MultiSelectFieldProps) {
    const generated = useId();
    const id = idProp ?? generated;
    const panelId = `${id}-panel`;
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const labels = new Map(groups.flatMap((g) => g.items.map((i) => [i.value, i.label] as const)));
    const selected = value.filter((v) => labels.has(v));

    useEffect(() => {
        if (!open) return;
        function onPointer(e: PointerEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: globalThis.KeyboardEvent) {
            if (e.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    function toggle(code: string) {
        onChange(selected.includes(code) ? selected.filter((v) => v !== code) : [...selected, code]);
    }

    const summary = selected.length === 0
        ? placeholder
        : selected.length <= 2
            ? selected.map((v) => labels.get(v)).join(", ")
            : `${labels.get(selected[0])}, ${labels.get(selected[1])} +${selected.length - 2}`;

    return (
        <S.Field $wide={wide} ref={rootRef} style={{ position: "relative" }}>
            <S.Label as="span" id={`${id}-label`}>{label}</S.Label>
            <S.MultiTrigger
                ref={triggerRef}
                id={id}
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={panelId}
                aria-labelledby={`${id}-label ${id}`}
                $empty={selected.length === 0}
                onClick={() => setOpen((v) => !v)}
            >
                <span>{summary}</span>
                {selected.length > 0 && <S.MultiCount aria-label={`${selected.length} marcadas`}>{selected.length}</S.MultiCount>}
                <ChevronIcon />
            </S.MultiTrigger>
            {open && (
                <S.MultiPanel id={panelId} role="group" aria-label={label}>
                    {groups.map((g) => (
                        <S.MultiGroup key={g.key}>
                            <legend>{g.label}</legend>
                            <S.PillList>
                                {g.items.map((item) => {
                                    const on = selected.includes(item.value);
                                    return (
                                        <S.Pill key={item.value} $on={on}>
                                            <input type="checkbox" checked={on} onChange={() => toggle(item.value)} />
                                            <span>{item.label}</span>
                                        </S.Pill>
                                    );
                                })}
                            </S.PillList>
                        </S.MultiGroup>
                    ))}
                    <S.MultiFooter>
                        <button type="button" onClick={() => onChange([])} disabled={selected.length === 0}>Limpar</button>
                        <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>Pronto</button>
                    </S.MultiFooter>
                </S.MultiPanel>
            )}
        </S.Field>
    );
}
