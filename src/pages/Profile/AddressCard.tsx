import { useState } from "react";
import { toast } from "react-toastify";

import { Input } from "../../components";
import { removeAddress, saveAddress } from "../../services/address";
import type { User } from "../../types";
import { getErrorMessage } from "../../utils/getErrorMessage";
import * as S from "./styles";

const formatCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/**
 * Endereço do perfil, só pelo CEP. Serve para a vitrine mostrar primeiro os salões mais perto; a
 * finalidade aparece no próprio card, e remover apaga tudo de uma vez.
 */
export function AddressCard({ user, onChange }: { user: User; onChange: (u: User) => void }) {
    const [cep, setCep] = useState(user.postalCode ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const saved = Boolean(user.postalCode);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (cep.replace(/\D/g, "").length !== 8) { setError("Informe os 8 números do CEP."); return; }
        try {
            setSaving(true);
            setError(null);
            const updated = await saveAddress(cep);
            onChange(updated);
            toast.success(updated.hasLocation ? "Endereço salvo. A vitrine vai mostrar primeiro os salões perto de você." : "Endereço salvo, mas não foi possível localizar este CEP no mapa.");
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível salvar o endereço."));
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove() {
        if (!window.confirm("Remover o endereço do seu perfil? A vitrine deixa de usar a sua região.")) return;
        try {
            setSaving(true);
            onChange(await removeAddress());
            setCep("");
            toast.success("Endereço removido.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível remover o endereço."));
        } finally {
            setSaving(false);
        }
    }

    const place = [user.street, user.neighborhood, user.city && user.state ? `${user.city} - ${user.state}` : null].filter(Boolean).join(", ");

    return (
        <S.FormCard as="form" onSubmit={handleSave} noValidate aria-labelledby="address-title">
            <S.SectionTitle id="address-title">Endereço</S.SectionTitle>
            <S.Hint>
                Opcional. Usamos só para mostrar primeiro os salões mais perto de você. Guardamos o CEP e a região dele, e você pode remover quando quiser.
            </S.Hint>
            <S.FieldGrid>
                <Input
                    label="CEP"
                    name="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => { setCep(formatCep(e.target.value)); setError(null); }}
                    error={error ?? undefined}
                />
            </S.FieldGrid>
            {saved && place && <S.Hint aria-live="polite"><strong>{place}</strong></S.Hint>}
            <S.FormFooter>
                {saved && (
                    <S.CancelButton type="button" onClick={handleRemove} disabled={saving}>
                        Remover endereço
                    </S.CancelButton>
                )}
                <S.SaveButton type="submit" disabled={saving || cep === (user.postalCode ?? "")}>
                    {saving ? "Salvando..." : saved ? "Trocar CEP" : "Salvar CEP"}
                </S.SaveButton>
            </S.FormFooter>
        </S.FormCard>
    );
}
