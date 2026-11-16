import { useState } from "react";

import { CATEGORY_LABELS, PRICE_UNIT_LABELS, PROVIDER_CATEGORIES, SERVICE_MODE_LABELS } from "../../constants/providers";
import { createMyProvider, updateMyProvider } from "../../services/provider";
import type { MyProvider, ProviderCategory, ProviderPriceUnit, ProviderServiceMode } from "../../types";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatPhoneDigits } from "../../utils/providerFormat";
import * as A from "../Admin/styles";
import * as S from "./styles";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

interface ProfileFormProps {
    /** Nulo: cadastro do perfil. */
    provider: MyProvider | null;
    onSaved: (p: MyProvider) => void;
}

const priceToText = (v: number | null) => (v == null ? "" : String(v).replace(".", ","));
const textToPrice = (v: string) => {
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    return v.trim() && Number.isFinite(n) ? n : null;
};

/** Os dados do negócio: o que faz, onde atende, a partir de quanto e o contato que vai para o cliente na resposta. */
export default function ProfileForm({ provider, onSaved }: ProfileFormProps) {
    const [name, setName] = useState(provider?.name ?? "");
    const [categories, setCategories] = useState<ProviderCategory[]>(provider?.categories ?? []);
    const [description, setDescription] = useState(provider?.description ?? "");
    const [city, setCity] = useState(provider?.city ?? "");
    const [uf, setUf] = useState(provider?.state ?? "");
    const [radius, setRadius] = useState(String(provider?.serviceRadiusKm ?? 50));
    const [mode, setMode] = useState<ProviderServiceMode>(provider?.serviceMode ?? "ON_SITE");
    const [price, setPrice] = useState(priceToText(provider?.startingPrice ?? null));
    const [unit, setUnit] = useState<ProviderPriceUnit>(provider?.startingPriceUnit ?? "FIXED");
    const [whatsapp, setWhatsapp] = useState(formatPhoneDigits(provider?.whatsapp));
    const [email, setEmail] = useState(provider?.email ?? "");
    const [instagram, setInstagram] = useState(provider?.instagram ? `@${provider.instagram}` : "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggle = (c: ProviderCategory) => setCategories((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (name.trim().length < 2) return setError("Informe o nome do seu negócio.");
        const startingPrice = textToPrice(price);
        const payload = {
            name: name.trim(),
            categories,
            description: description.trim() || null,
            city: city.trim() || null,
            state: uf || null,
            serviceRadiusKm: Math.min(500, Math.max(1, Number(radius) || 50)),
            serviceMode: mode,
            startingPrice,
            startingPriceUnit: startingPrice == null ? null : unit,
            whatsapp: whatsapp.trim() || null,
            email: email.trim() || null,
            instagram: instagram.trim() || null,
        };
        try {
            setSaving(true);
            onSaved(provider ? await updateMyProvider(payload) : await createMyProvider(payload));
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível salvar o perfil."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <A.Form onSubmit={submit} noValidate aria-label={provider ? "Perfil do negócio" : "Criar o perfil do negócio"}>
            {error && <S.FormError role="alert">{error}</S.FormError>}

            <A.FormSection>
                <legend>O que você faz</legend>
                <A.FormGroup>
                    <label htmlFor="pf-name">Nome do negócio</label>
                    <A.TextInput id="pf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex.: Doces da Ana" />
                </A.FormGroup>
                <div role="group" aria-labelledby="pf-cats">
                    <S.Legend id="pf-cats">Categorias (pode marcar mais de uma)</S.Legend>
                    <S.CategoryChecks>
                        {PROVIDER_CATEGORIES.map((c) => (
                            <li key={c}>
                                <label>
                                    <input type="checkbox" checked={categories.includes(c)} onChange={() => toggle(c)} />
                                    {CATEGORY_LABELS[c]}
                                </label>
                            </li>
                        ))}
                    </S.CategoryChecks>
                </div>
                <A.FormGroup>
                    <label htmlFor="pf-desc">Sobre o trabalho</label>
                    <S.TextArea
                        id="pf-desc"
                        rows={5}
                        maxLength={2000}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Conte há quanto tempo trabalha com festas, o estilo e o que está incluso."
                    />
                </A.FormGroup>
            </A.FormSection>

            <A.FormSection>
                <legend>Onde atende</legend>
                <A.FormRow>
                    <A.FormGroup>
                        <label htmlFor="pf-city">Cidade</label>
                        <A.TextInput id="pf-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="Ex.: Lavras" />
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="pf-uf">Estado</label>
                        <A.Select id="pf-uf" value={uf} onChange={(e) => setUf(e.target.value)}>
                            <option value="">Escolha</option>
                            {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </A.Select>
                    </A.FormGroup>
                </A.FormRow>
                <A.FormRow>
                    <A.FormGroup>
                        <label htmlFor="pf-mode">Como atende</label>
                        <A.Select id="pf-mode" value={mode} onChange={(e) => setMode(e.target.value as ProviderServiceMode)}>
                            {(Object.keys(SERVICE_MODE_LABELS) as ProviderServiceMode[]).map((m) => <option key={m} value={m}>{SERVICE_MODE_LABELS[m]}</option>)}
                        </A.Select>
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="pf-radius">Até quantos km da cidade</label>
                        <A.TextInput id="pf-radius" inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                        <A.FieldHint>Quem procura de mais longe que isso não vê você na vitrine.</A.FieldHint>
                    </A.FormGroup>
                </A.FormRow>
            </A.FormSection>

            <A.FormSection>
                <legend>Preço</legend>
                <A.FormRow>
                    <A.FormGroup>
                        <label htmlFor="pf-price">A partir de (R$)</label>
                        <A.TextInput id="pf-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ex.: 350" />
                        <A.FieldHint>Em branco, a vitrine mostra o pacote mais barato.</A.FieldHint>
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="pf-unit">Cobrado</label>
                        <A.Select id="pf-unit" value={unit} onChange={(e) => setUnit(e.target.value as ProviderPriceUnit)}>
                            {(Object.keys(PRICE_UNIT_LABELS) as ProviderPriceUnit[]).map((u) => <option key={u} value={u}>{PRICE_UNIT_LABELS[u]}</option>)}
                        </A.Select>
                    </A.FormGroup>
                </A.FormRow>
            </A.FormSection>

            <A.FormSection>
                <legend>Contato</legend>
                <A.FieldHint>O WhatsApp e o e-mail não aparecem na vitrine: vão para o cliente quando você responde o orçamento.</A.FieldHint>
                <A.FormRow>
                    <A.FormGroup>
                        <label htmlFor="pf-wa">WhatsApp</label>
                        <A.TextInput id="pf-wa" type="tel" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(35) 99999-0000" />
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="pf-email">E-mail para os pedidos</label>
                        <A.TextInput id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Em branco, usamos o da sua conta" />
                    </A.FormGroup>
                </A.FormRow>
                <A.FormGroup>
                    <label htmlFor="pf-ig">Instagram</label>
                    <A.TextInput id="pf-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seunegocio" />
                </A.FormGroup>
            </A.FormSection>

            <div>
                <A.PrimaryButton type="submit" disabled={saving} aria-busy={saving}>
                    {saving ? "Salvando..." : provider ? "Salvar perfil" : "Criar perfil"}
                </A.PrimaryButton>
            </div>
        </A.Form>
    );
}
