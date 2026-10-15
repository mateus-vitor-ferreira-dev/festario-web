import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createItem, deleteItem, listItems, listItemTemplates, updateItem } from "../../../services/salonRules";
import type { ItemChargeType, ItemTemplate, SalonItem } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import { CHARGE_LABELS, describePrice } from "../../../utils/packageFormat";
import * as S from "./styles";

interface Draft {
    name: string;
    description: string;
    chargeType: ItemChargeType;
    price: string;
    min: string;
    max: string;
}

const EMPTY_DRAFT: Draft = { name: "", description: "", chargeType: "FIXED", price: "", min: "", max: "" };
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

function draftFrom(item: SalonItem): Draft {
    return {
        name: item.name, description: item.description ?? "", chargeType: item.chargeType, price: String(Number(item.unitPrice)),
        min: item.minQuantity != null ? String(item.minQuantity) : "", max: item.maxQuantity != null ? String(item.maxQuantity) : "",
    };
}

/** Formulário de preço (e limites, se por hora) de um item: o mesmo para ligar, editar e criar. */
function ItemForm({ draft, onChange, showName, idPrefix }: { draft: Draft; onChange: (d: Draft) => void; showName: boolean; idPrefix: string }) {
    const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
    return (
        <>
            {showName && (
                <A.FormRow>
                    <A.FormGroup>
                        <label htmlFor={`${idPrefix}-name`}>Nome</label>
                        <A.TextInput id={`${idPrefix}-name`} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Pula-pula" maxLength={80} />
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor={`${idPrefix}-charge`}>Como cobra</label>
                        <A.Select id={`${idPrefix}-charge`} value={draft.chargeType} onChange={(e) => set("chargeType", e.target.value as ItemChargeType)}>
                            <option value="FIXED">Valor fixo</option>
                            <option value="PER_HOUR">Por hora</option>
                            <option value="PER_GUEST">Por convidado</option>
                        </A.Select>
                    </A.FormGroup>
                </A.FormRow>
            )}
            <S.InlineFields>
                <S.NumberField>
                    Preço (R$) {CHARGE_LABELS[draft.chargeType] !== "valor fixo" ? CHARGE_LABELS[draft.chargeType] : ""}
                    <A.TextInput inputMode="decimal" value={draft.price} onChange={(e) => set("price", e.target.value)} placeholder="0 se for cortesia" />
                </S.NumberField>
                {draft.chargeType === "PER_HOUR" && (
                    <>
                        <S.NumberField>
                            Mínimo de horas
                            <A.TextInput inputMode="numeric" value={draft.min} onChange={(e) => set("min", e.target.value)} placeholder="sem mínimo" />
                        </S.NumberField>
                        <S.NumberField>
                            Máximo de horas
                            <A.TextInput inputMode="numeric" value={draft.max} onChange={(e) => set("max", e.target.value)} placeholder="sem máximo" />
                        </S.NumberField>
                    </>
                )}
            </S.InlineFields>
        </>
    );
}

function payloadFrom(d: Draft) {
    return {
        unitPrice: Number(d.price.replace(",", ".")),
        minQuantity: d.chargeType === "PER_HOUR" ? numOrNull(d.min) : null,
        maxQuantity: d.chargeType === "PER_HOUR" ? numOrNull(d.max) : null,
    };
}

function draftError(d: Draft, needName: boolean): string | null {
    if (needName && d.name.trim().length < 2) return "Dê um nome ao item.";
    if (d.price.trim() === "" || !(Number(d.price.replace(",", ".")) >= 0)) return "Informe o preço (0 se for cortesia).";
    const min = numOrNull(d.min);
    const max = numOrNull(d.max);
    if (min != null && max != null && min > max) return "O mínimo de horas não pode passar do máximo.";
    return null;
}

/**
 * Itens e adicionais do salão: os prontos da plataforma (ligar, preço, limites) e os próprios.
 * Em cada pacote, o item vira incluso ou adicional.
 */
export function ItemsSection() {
    const [items, setItems] = useState<SalonItem[]>([]);
    const [templates, setTemplates] = useState<ItemTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const [i, t] = await Promise.all([listItems(signal), listItemTemplates(signal)]);
            if (signal?.aborted) return;
            setItems(i);
            setTemplates(t);
        } catch (err) {
            if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar os itens."));
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    function open(key: string, initial: Draft) {
        setOpenKey(key);
        setDraft(initial);
        setError(null);
    }

    async function save(action: () => Promise<unknown>, done: string, needName = false) {
        const problem = draftError(draft, needName);
        if (problem) { setError(problem); return; }
        try {
            setSaving(true);
            await action();
            toast.success(done);
            setOpenKey(null);
            await load();
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível salvar o item."));
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: SalonItem) {
        const uses = item._count?.packages ?? 0;
        if (!window.confirm(`Excluir "${item.name}"?${uses ? ` Ele sai de ${uses} pacote${uses === 1 ? "" : "s"}.` : ""} Reservas já feitas não mudam.`)) return;
        try {
            await deleteItem(item.id);
            toast.success("Item excluído.");
            await load();
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível excluir o item."));
        }
    }

    async function toggleActive(item: SalonItem) {
        try {
            await updateItem(item.id, { isActive: !item.isActive });
            toast.success(item.isActive ? "Item pausado: sai dos pacotes até você reativar." : "Item reativado.");
            await load();
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível alterar o item."));
        }
    }

    if (loading) return <A.LoadingSpinner aria-label="Carregando itens" />;

    const byId = new Map(items.map((i) => [i.id, i]));
    const custom = items.filter((i) => !i.key);

    const actionsFor = (item: SalonItem) => (
        <A.InlineGroup>
            <A.SecondaryButton type="button" $size="sm" onClick={() => open(item.id, draftFrom(item))} aria-label={`Editar preço de ${item.name}`}>Editar preço</A.SecondaryButton>
            <A.SecondaryButton type="button" $size="sm" onClick={() => toggleActive(item)} aria-label={`${item.isActive ? "Pausar" : "Reativar"} ${item.name}`}>{item.isActive ? "Pausar" : "Reativar"}</A.SecondaryButton>
            <A.DangerButton type="button" $size="sm" onClick={() => remove(item)} aria-label={`Excluir ${item.name}`}>Excluir</A.DangerButton>
        </A.InlineGroup>
    );

    const editor = (onSave: () => void, saveLabel: string, showName = false) => (
        <A.Form onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate style={{ gridColumn: "1 / -1" }}>
            {error && <S.Errors role="alert"><li>{error}</li></S.Errors>}
            <ItemForm draft={draft} onChange={setDraft} showName={showName} idPrefix={openKey ?? "item"} />
            <A.InlineGroup>
                <A.PrimaryButton type="submit" $size="sm" disabled={saving} aria-busy={saving}>{saving ? "Salvando..." : saveLabel}</A.PrimaryButton>
                <A.SecondaryButton type="button" $size="sm" onClick={() => setOpenKey(null)}>Cancelar</A.SecondaryButton>
            </A.InlineGroup>
        </A.Form>
    );

    return (
        <A.Section>
            <S.Intro>
                Cadastre aqui o que o salão oferece. Em cada pacote você escolhe se o item vem incluso ou se é um adicional
                cobrado à parte; fora disso, ele não aparece naquele pacote.
            </S.Intro>

            <A.SectionTitle>Itens prontos</A.SectionTitle>
            <div>
                {templates.map((t) => {
                    const item = t.itemId ? byId.get(t.itemId) : undefined;
                    return (
                        <S.ItemRow key={t.key}>
                            <S.ItemName>
                                <strong>{t.name}</strong>
                                <span>
                                    {item ? `${describePrice(item.unitPrice, item.chargeType)}${item.isActive ? "" : " (pausado)"}` : `Não oferecido. Cobrança ${CHARGE_LABELS[t.chargeType]}.`}
                                </span>
                            </S.ItemName>
                            {item ? actionsFor(item) : (
                                <A.SecondaryButton type="button" $size="sm" onClick={() => open(t.key, { ...EMPTY_DRAFT, name: t.name, chargeType: t.chargeType })} aria-label={`Oferecer ${t.name}`}>Oferecer</A.SecondaryButton>
                            )}
                            {openKey === t.key && !item && editor(() => save(() => createItem({ key: t.key, ...payloadFrom(draft) }), `${t.name} adicionado ao salão.`), "Oferecer")}
                            {item && openKey === item.id && editor(() => save(() => updateItem(item.id, payloadFrom(draft)), "Preço salvo."), "Salvar")}
                        </S.ItemRow>
                    );
                })}
            </div>

            <A.SectionHeader>
                <A.SectionTitle>Itens do salão</A.SectionTitle>
                {openKey !== "new" && <A.SecondaryButton type="button" onClick={() => open("new", EMPTY_DRAFT)}>Criar item próprio</A.SecondaryButton>}
            </A.SectionHeader>
            {custom.length === 0 && openKey !== "new" && <S.Meta>Nenhum item próprio ainda. Ex.: pula-pula, mesa de doces, fotógrafo.</S.Meta>}
            <div>
                {openKey === "new" && (
                    <S.ItemRow>
                        {editor(() => save(() => createItem({ name: draft.name.trim(), chargeType: draft.chargeType, description: draft.description || null, ...payloadFrom(draft) }), "Item criado.", true), "Criar item", true)}
                    </S.ItemRow>
                )}
                {custom.map((item) => (
                    <S.ItemRow key={item.id}>
                        <S.ItemName>
                            <strong>{item.name}</strong>
                            <span>{describePrice(item.unitPrice, item.chargeType)}{item.isActive ? "" : " (pausado)"}</span>
                        </S.ItemName>
                        {actionsFor(item)}
                        {openKey === item.id && editor(() => save(() => updateItem(item.id, { ...payloadFrom(draft) }), "Item salvo."), "Salvar")}
                    </S.ItemRow>
                ))}
            </div>
        </A.Section>
    );
}
