import { useState } from "react";
import { toast } from "react-toastify";

import { PRICE_UNIT_LABELS } from "../../constants/providers";
import { addPackage, deletePackage, updatePackage } from "../../services/provider";
import type { MyProvider, OwnerPackage, ProviderPriceUnit } from "../../types";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatPrice } from "../../utils/salonFormat";
import * as A from "../Admin/styles";
import * as S from "./styles";

interface PackagesTabProps {
    provider: MyProvider;
    onChange: (p: MyProvider) => void;
}

const parsePrice = (v: string) => Number(v.replace(/\./g, "").replace(",", "."));

/** Pacotes com preço: aparecem na página do prestador e o cliente pode escolher um no pedido. */
export default function PackagesTab({ provider, onChange }: PackagesTabProps) {
    const [editing, setEditing] = useState<OwnerPackage | "new" | null>(provider.packages.length ? null : "new");
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<MyProvider>, done: string) {
        try {
            setBusy(true);
            onChange(await action());
            toast.success(done);
            setEditing(null);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível salvar o pacote."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <A.Section aria-labelledby="packages-title">
            <A.SectionHeader>
                <A.SectionTitle id="packages-title">Pacotes</A.SectionTitle>
                {editing === null && <A.PrimaryButton type="button" onClick={() => setEditing("new")}>Novo pacote</A.PrimaryButton>}
            </A.SectionHeader>
            <A.FieldHint>Ex.: "Cento de brigadeiros", "Maquiagem de noiva com teste", "Buffet completo para 100 pessoas".</A.FieldHint>

            {editing === "new" && (
                <PackageForm busy={busy} onCancel={() => setEditing(null)} onSave={(input) => run(() => addPackage(input), "Pacote criado.")} />
            )}

            {provider.packages.length > 0 && (
                <S.PackageList>
                    {provider.packages.map((k) => (
                        <li key={k.id}>
                            {editing !== "new" && editing?.id === k.id ? (
                                <PackageForm
                                    initial={k}
                                    busy={busy}
                                    onCancel={() => setEditing(null)}
                                    onSave={(input) => run(() => updatePackage(k.id, input), "Pacote salvo.")}
                                />
                            ) : (
                                <S.PackageRow $inactive={!k.isActive}>
                                    <div>
                                        <strong>{k.name}</strong>
                                        {k.description && <p>{k.description}</p>}
                                        {!k.isActive && <p>Pausado: não aparece na página.</p>}
                                    </div>
                                    <S.PackageSide>
                                        <span>{formatPrice(k.price)} {PRICE_UNIT_LABELS[k.priceUnit]}</span>
                                        <A.InlineGroup>
                                            <A.SecondaryButton type="button" $size="sm" onClick={() => setEditing(k)} disabled={busy}>Editar</A.SecondaryButton>
                                            <A.SecondaryButton type="button" $size="sm" disabled={busy} onClick={() => run(() => updatePackage(k.id, { isActive: !k.isActive }), k.isActive ? "Pacote pausado." : "Pacote reativado.")}>
                                                {k.isActive ? "Pausar" : "Reativar"}
                                            </A.SecondaryButton>
                                            <A.DangerButton type="button" $size="sm" disabled={busy} onClick={() => { if (window.confirm(`Excluir o pacote "${k.name}"?`)) run(() => deletePackage(k.id), "Pacote excluído."); }}>
                                                Excluir
                                            </A.DangerButton>
                                        </A.InlineGroup>
                                    </S.PackageSide>
                                </S.PackageRow>
                            )}
                        </li>
                    ))}
                </S.PackageList>
            )}
        </A.Section>
    );
}

interface PackageFormProps {
    initial?: OwnerPackage;
    busy: boolean;
    onCancel: () => void;
    onSave: (input: { name: string; description: string | null; price: number; priceUnit: ProviderPriceUnit }) => void;
}

function PackageForm({ initial, busy, onCancel, onSave }: PackageFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [price, setPrice] = useState(initial ? String(initial.price).replace(".", ",") : "");
    const [unit, setUnit] = useState<ProviderPriceUnit>(initial?.priceUnit ?? "FIXED");
    const [error, setError] = useState<string | null>(null);
    const id = initial?.id ?? "new";

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const value = parsePrice(price);
        if (name.trim().length < 2) return setError("Dê um nome ao pacote.");
        if (!price.trim() || !Number.isFinite(value) || value < 0) return setError("Informe o preço do pacote.");
        setError(null);
        onSave({ name: name.trim(), description: description.trim() || null, price: value, priceUnit: unit });
    }

    return (
        <S.PackageFormBox as="form" onSubmit={submit} noValidate aria-label={initial ? `Editar ${initial.name}` : "Novo pacote"}>
            {error && <S.FormError role="alert">{error}</S.FormError>}
            <A.FormGroup>
                <label htmlFor={`pk-name-${id}`}>Nome do pacote</label>
                <A.TextInput id={`pk-name-${id}`} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </A.FormGroup>
            <A.FormGroup>
                <label htmlFor={`pk-desc-${id}`}>O que inclui</label>
                <S.TextArea id={`pk-desc-${id}`} rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
            </A.FormGroup>
            <A.FormRow>
                <A.FormGroup>
                    <label htmlFor={`pk-price-${id}`}>Preço (R$)</label>
                    <A.TextInput id={`pk-price-${id}`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))} />
                </A.FormGroup>
                <A.FormGroup>
                    <label htmlFor={`pk-unit-${id}`}>Cobrado</label>
                    <A.Select id={`pk-unit-${id}`} value={unit} onChange={(e) => setUnit(e.target.value as ProviderPriceUnit)}>
                        {(Object.keys(PRICE_UNIT_LABELS) as ProviderPriceUnit[]).map((u) => <option key={u} value={u}>{PRICE_UNIT_LABELS[u]}</option>)}
                    </A.Select>
                </A.FormGroup>
            </A.FormRow>
            <A.InlineGroup>
                <A.PrimaryButton type="submit" disabled={busy}>{initial ? "Salvar pacote" : "Criar pacote"}</A.PrimaryButton>
                <A.SecondaryButton type="button" onClick={onCancel} disabled={busy}>Cancelar</A.SecondaryButton>
            </A.InlineGroup>
        </S.PackageFormBox>
    );
}
