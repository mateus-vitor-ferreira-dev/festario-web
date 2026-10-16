import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import { createPackage, updatePackage } from "../../../services/salonRules";
import type { PackageItemInput, SalonItem, SalonPackage, SalonPackageInput, Venue } from "../../../types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import { CHARGE_LABELS, WEEK, clockToMinutes, describePrice, formatBRL, formatHours, minutesToClock } from "../../../utils/packageFormat";
import * as S from "./styles";
import { TimeWindow, WeekStrip } from "../../../components/PackageVisuals";
import type { PackageTemplate } from "./packageTemplates";

type Mode = "NONE" | "INCLUDED" | "OPTIONAL";

interface FormState {
    name: string;
    description: string;
    price: string;
    venueId: string;
    days: number[];
    holidays: boolean;
    start: string;
    end: string;
    endNextDay: boolean;
    minHours: string;
    maxHours: string;
    minGuests: string;
    maxGuests: string;
    keyHours: string;
    isActive: boolean;
    items: Record<string, { mode: Mode; qty: string }>;
}

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0];
const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

function toForm(pkg: Partial<SalonPackage> | null, items: SalonItem[]): FormState {
    const byItem = new Map((pkg?.items ?? []).map((pi) => [pi.item.id, pi]));
    const end = pkg?.latestEndMinute ?? null;
    return {
        name: pkg?.name ?? "",
        description: pkg?.description ?? "",
        price: pkg?.basePriceAmount != null ? String(Number(pkg.basePriceAmount)) : "",
        venueId: pkg?.venueId ?? "",
        days: pkg?.validWeekdays ?? ALL_DAYS,
        holidays: pkg?.validOnHolidays ?? true,
        start: minutesToClock(pkg?.earliestStartMinute),
        end: end != null ? minutesToClock(end) : "",
        endNextDay: end != null && end > 1440,
        minHours: pkg?.minDurationMinutes != null ? String(pkg.minDurationMinutes / 60) : "",
        maxHours: pkg?.maxDurationMinutes != null ? String(pkg.maxDurationMinutes / 60) : "",
        minGuests: pkg?.minGuests != null ? String(pkg.minGuests) : "",
        maxGuests: pkg?.maxGuests != null ? String(pkg.maxGuests) : "",
        keyHours: String(pkg?.keyDeliveryOffsetHours ?? 0),
        isActive: pkg?.isActive ?? true,
        items: Object.fromEntries(items.map((it) => {
            const pi = byItem.get(it.id);
            return [it.id, { mode: (pi?.mode ?? "NONE") as Mode, qty: pi?.includedQuantity != null ? String(pi.includedQuantity) : "" }];
        })),
    };
}

/** Problemas do formulário antes de enviar (a API confere de novo). */
function validate(f: FormState): string[] {
    const errors: string[] = [];
    if (f.name.trim().length < 2) errors.push("Dê um nome ao pacote.");
    if (!(Number(f.price.replace(",", ".")) > 0)) errors.push("Informe o preço do pacote.");
    if (f.days.length === 0) errors.push("Escolha pelo menos um dia da semana.");
    const start = clockToMinutes(f.start);
    const endRaw = clockToMinutes(f.end);
    const end = endRaw != null ? endRaw + (f.endNextDay ? 1440 : 0) : null;
    if (start != null && end != null && end <= start) errors.push("O término precisa ser depois do início (marque \"termina no dia seguinte\" se a festa passa da meia-noite).");
    const min = num(f.minHours);
    const max = num(f.maxHours);
    if (min != null && max != null && min > max) errors.push("A duração mínima não pode passar da máxima.");
    if (start != null && end != null && min != null && end - start < min * 60) errors.push("A janela de horário é menor que a duração mínima.");
    const gMin = num(f.minGuests);
    const gMax = num(f.maxGuests);
    if (gMin != null && gMax != null && gMin > gMax) errors.push("O mínimo de convidados não pode passar do máximo.");
    return errors;
}

function toPayload(f: FormState, items: SalonItem[]): SalonPackageInput {
    const endRaw = clockToMinutes(f.end);
    const min = num(f.minHours);
    const max = num(f.maxHours);
    return {
        name: f.name.trim(),
        description: f.description.trim() || null,
        basePriceAmount: Number(f.price.replace(",", ".")),
        venueId: f.venueId || null,
        validWeekdays: f.days.length === 7 ? null : f.days,
        validOnHolidays: f.holidays,
        earliestStartMinute: clockToMinutes(f.start),
        latestEndMinute: endRaw != null ? endRaw + (f.endNextDay ? 1440 : 0) : null,
        minDurationMinutes: min != null ? Math.round(min * 60) : null,
        maxDurationMinutes: max != null ? Math.round(max * 60) : null,
        minGuests: num(f.minGuests),
        maxGuests: num(f.maxGuests),
        keyDeliveryOffsetHours: Number(f.keyHours) || 0,
        isActive: f.isActive,
        items: items
            .filter((it) => f.items[it.id]?.mode && f.items[it.id].mode !== "NONE")
            .map((it): PackageItemInput => {
                const { mode, qty } = f.items[it.id];
                return { itemId: it.id, mode: mode as Exclude<Mode, "NONE">, includedQuantity: mode === "INCLUDED" && it.chargeType === "PER_HOUR" && qty ? Number(qty) : null };
            }),
    };
}

interface Props {
    pkg: SalonPackage | null;
    items: SalonItem[];
    venues: Venue[];
    nextSortOrder: number;
    /** Pacote novo a partir de um modelo: vem preenchido, menos o preço. */
    template?: PackageTemplate | null;
    onSaved: () => void;
    onCancel: () => void;
}

/**
 * Editor de pacote: o que é, quando vale, horário, convidados e itens, com a prévia de como
 * o cliente vê e um orçamento de exemplo. Abre no lugar da lista (o formulário é longo para um modal).
 */
export function PackageEditor({ pkg, items, venues, nextSortOrder, template = null, onSaved, onCancel }: Props) {
    const activeItems = useMemo(() => items.filter((it) => it.isActive), [items]);
    const [form, setForm] = useState<FormState>(() => toForm(pkg ?? template?.values ?? null, activeItems));
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
    const setItem = (id: string, patch: Partial<FormState["items"][string]>) =>
        setForm((f) => ({ ...f, items: { ...f.items, [id]: { ...(f.items[id] ?? { mode: "NONE", qty: "" }), ...patch } } }));

    function toggleDay(day: number) {
        setForm((f) => ({ ...f, days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day] }));
    }

    const payload = useMemo(() => toPayload(form, activeItems), [form, activeItems]);
    const example = useMemo(() => {
        const guests = Math.min(Math.max(80, payload.minGuests ?? 0), payload.maxGuests ?? Infinity);
        const hours = (payload.maxDurationMinutes ?? 240) / 60;
        const extras = activeItems.filter((it) => form.items[it.id]?.mode === "OPTIONAL").map((it) => {
            const unit = Number(it.unitPrice);
            const qty = it.chargeType === "PER_GUEST" ? guests : it.chargeType === "PER_HOUR" ? hours : 1;
            return { name: it.name, total: unit * qty };
        });
        return { guests, hours, extras, base: payload.basePriceAmount || 0 };
    }, [payload, form.items, activeItems]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const problems = validate(form);
        setErrors(problems);
        if (problems.length) return;
        try {
            setSaving(true);
            if (pkg) await updatePackage(pkg.id, payload);
            else await createPackage({ ...payload, sortOrder: nextSortOrder });
            toast.success(pkg ? "Pacote salvo." : "Pacote criado.");
            onSaved();
        } catch (error) {
            setErrors([getErrorMessage(error, "Não foi possível salvar o pacote.")]);
        } finally {
            setSaving(false);
        }
    }

    const included = activeItems.filter((it) => form.items[it.id]?.mode === "INCLUDED");
    const optional = activeItems.filter((it) => form.items[it.id]?.mode === "OPTIONAL");

    return (
        <A.Section>
            <A.SectionHeader>
                <A.SectionTitle>{pkg ? `Editar ${pkg.name}` : "Novo pacote"}</A.SectionTitle>
                <A.SecondaryButton type="button" onClick={onCancel}>Voltar aos pacotes</A.SecondaryButton>
            </A.SectionHeader>
            {template && !pkg && (
                <A.FieldHint role="note">
                    Começando do modelo <strong>{template.title}</strong>. Ajuste o nome, os dias e o horário ao seu salão e informe o preço.
                </A.FieldHint>
            )}

            <S.EditorLayout>
                <A.Form onSubmit={handleSubmit} noValidate aria-describedby={errors.length ? "package-errors" : undefined}>
                    {errors.length > 0 && (
                        <S.Errors id="package-errors" role="alert">
                            {errors.map((err) => <li key={err}>{err}</li>)}
                        </S.Errors>
                    )}

                    <A.FormSection>
                        <legend>O pacote</legend>
                        <A.FormGroup>
                            <label htmlFor="pkg-name">Nome</label>
                            <A.TextInput id="pkg-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Sábado à tarde" maxLength={80} />
                        </A.FormGroup>
                        <A.FormGroup>
                            <label htmlFor="pkg-desc">O que o cliente precisa saber</label>
                            <S.TextArea id="pkg-desc" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={500} placeholder="Ex.: Salão e jardim, com som ambiente. Ideal para aniversários." />
                        </A.FormGroup>
                        <A.FormRow>
                            <A.FormGroup>
                                <label htmlFor="pkg-price">Preço (R$)</label>
                                <A.TextInput id="pkg-price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Ex.: 1200" />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pkg-venue">Espaço</label>
                                <A.Select id="pkg-venue" value={form.venueId} onChange={(e) => set("venueId", e.target.value)}>
                                    <option value="">Todos os espaços do salão</option>
                                    {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </A.Select>
                            </A.FormGroup>
                        </A.FormRow>
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Quando vale</legend>
                        <S.DayPicker role="group" aria-label="Dias da semana">
                            {WEEK.map((w) => (
                                <S.DayToggle key={w.day} type="button" $on={form.days.includes(w.day)} aria-pressed={form.days.includes(w.day)} onClick={() => toggleDay(w.day)}>
                                    {w.name.slice(0, 3)}
                                </S.DayToggle>
                            ))}
                        </S.DayPicker>
                        <A.CheckboxLabel>
                            <input type="checkbox" checked={form.holidays} onChange={(e) => set("holidays", e.target.checked)} />
                            Vale em feriados (nacionais e os do salão)
                        </A.CheckboxLabel>
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Horário</legend>
                        <A.FieldHint>Deixe em branco o que não tiver limite. O cliente só consegue reservar dentro disso.</A.FieldHint>
                        <S.InlineFields>
                            <S.NumberField>
                                Começa a partir de
                                <A.TextInput type="time" value={form.start} onChange={(e) => set("start", e.target.value)} />
                            </S.NumberField>
                            <S.NumberField>
                                Termina até
                                <A.TextInput type="time" value={form.end} onChange={(e) => set("end", e.target.value)} />
                            </S.NumberField>
                            <A.CheckboxLabel>
                                <input type="checkbox" checked={form.endNextDay} onChange={(e) => set("endNextDay", e.target.checked)} disabled={!form.end} />
                                Termina no dia seguinte
                            </A.CheckboxLabel>
                        </S.InlineFields>
                        <S.InlineFields>
                            <S.NumberField>
                                Duração mínima (h)
                                <A.TextInput inputMode="decimal" value={form.minHours} onChange={(e) => set("minHours", e.target.value)} placeholder="sem mínimo" />
                            </S.NumberField>
                            <S.NumberField>
                                Duração máxima (h)
                                <A.TextInput inputMode="decimal" value={form.maxHours} onChange={(e) => set("maxHours", e.target.value)} placeholder="sem máximo" />
                            </S.NumberField>
                            <S.NumberField>
                                Chaves antes (h)
                                <A.TextInput inputMode="numeric" value={form.keyHours} onChange={(e) => set("keyHours", e.target.value)} />
                            </S.NumberField>
                        </S.InlineFields>
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Convidados</legend>
                        <S.InlineFields>
                            <S.NumberField>
                                Mínimo
                                <A.TextInput inputMode="numeric" value={form.minGuests} onChange={(e) => set("minGuests", e.target.value)} placeholder="sem mínimo" />
                            </S.NumberField>
                            <S.NumberField>
                                Máximo
                                <A.TextInput inputMode="numeric" value={form.maxGuests} onChange={(e) => set("maxGuests", e.target.value)} placeholder="sem máximo" />
                            </S.NumberField>
                        </S.InlineFields>
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Itens do pacote</legend>
                        {activeItems.length === 0 ? (
                            <A.FieldHint>O salão ainda não tem itens. Cadastre monitor, buffet, garçom e o que mais oferecer em <strong>Itens e adicionais</strong>.</A.FieldHint>
                        ) : (
                            <div>
                                {activeItems.map((it) => {
                                    const state = form.items[it.id] ?? { mode: "NONE" as Mode, qty: "" };
                                    return (
                                        <S.ItemRow key={it.id}>
                                            <S.ItemName>
                                                <strong>{it.name}</strong>
                                                <span>{describePrice(it.unitPrice, it.chargeType)}</span>
                                            </S.ItemName>
                                            <S.InlineFields>
                                                <S.Segmented role="radiogroup" aria-label={`${it.name} neste pacote`}>
                                                    {([["NONE", "Não tem"], ["INCLUDED", "Incluso"], ["OPTIONAL", "Adicional"]] as const).map(([mode, label]) => (
                                                        <S.SegmentButton key={mode} type="button" role="radio" aria-checked={state.mode === mode} $on={state.mode === mode} onClick={() => setItem(it.id, { mode })}>
                                                            {label}
                                                        </S.SegmentButton>
                                                    ))}
                                                </S.Segmented>
                                                {state.mode === "INCLUDED" && it.chargeType === "PER_HOUR" && (
                                                    <S.NumberField>
                                                        Horas inclusas
                                                        <A.TextInput inputMode="numeric" value={state.qty} onChange={(e) => setItem(it.id, { qty: e.target.value })} placeholder="a festa toda" />
                                                    </S.NumberField>
                                                )}
                                            </S.InlineFields>
                                        </S.ItemRow>
                                    );
                                })}
                            </div>
                        )}
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Visibilidade</legend>
                        <A.CheckboxLabel>
                            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                            Pacote ativo (aparece para os clientes)
                        </A.CheckboxLabel>
                    </A.FormSection>

                    <A.InlineGroup>
                        <A.PrimaryButton type="submit" disabled={saving} aria-busy={saving}>
                            {saving ? "Salvando..." : pkg ? "Salvar pacote" : "Criar pacote"}
                        </A.PrimaryButton>
                        <A.SecondaryButton type="button" onClick={onCancel}>Cancelar</A.SecondaryButton>
                    </A.InlineGroup>
                </A.Form>

                <S.Aside aria-label="Prévia do pacote">
                    <h3>Como o cliente vê</h3>
                    <S.PackageHead>
                        <S.PreviewName>{form.name || "Nome do pacote"}</S.PreviewName>
                        <S.Price>{(payload.basePriceAmount ?? 0) > 0 ? formatBRL(payload.basePriceAmount) : "Preço a definir"}</S.Price>
                    </S.PackageHead>
                    <WeekStrip weekdays={form.days.length === 7 ? null : form.days} holidays={form.holidays} />
                    <TimeWindow earliest={payload.earliestStartMinute ?? null} latest={payload.latestEndMinute ?? null} />
                    {payload.maxDurationMinutes != null && <S.Meta>Até {formatHours(payload.maxDurationMinutes)} de festa</S.Meta>}
                    {included.length > 0 && (
                        <S.Meta>Incluso: {included.map((it) => (it.chargeType === "PER_HOUR" && form.items[it.id].qty ? `${it.name} (${form.items[it.id].qty}h)` : it.name)).join(", ")}</S.Meta>
                    )}
                    {optional.length > 0 && <S.Meta>Adicionais: {optional.map((it) => `${it.name} (${CHARGE_LABELS[it.chargeType]})`).join(", ")}</S.Meta>}

                    <h3>Orçamento de exemplo</h3>
                    <S.PreviewLines>
                        <dt>Pacote</dt><dd>{example.base > 0 ? formatBRL(example.base) : "a definir"}</dd>
                        {example.extras.map((x) => <FragmentLine key={x.name} name={x.name} total={x.total} />)}
                        <dt><strong>Com todos os adicionais</strong></dt>
                        <dd><strong>{formatBRL(example.base + example.extras.reduce((s, x) => s + x.total, 0))}</strong></dd>
                    </S.PreviewLines>
                    <S.Meta>Exemplo com {example.guests} convidados e {formatHours(example.hours * 60)} de festa.</S.Meta>
                </S.Aside>
            </S.EditorLayout>
        </A.Section>
    );
}

function FragmentLine({ name, total }: { name: string; total: number }) {
    return (
        <>
            <dt>{name}</dt>
            <dd>{formatBRL(total)}</dd>
        </>
    );
}
