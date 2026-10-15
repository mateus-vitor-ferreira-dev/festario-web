import { describePrice } from "../../../utils/packageFormat";
import type { VenuePackageItem } from "../../../types";
import type { AddonChoice } from "../useReservationForm";
import * as S from "../styles";

interface AddonsSelectorProps {
    items: VenuePackageItem[];
    addons: Record<string, AddonChoice>;
    onChange: (itemId: string, value: AddonChoice) => void;
}

/**
 * Adicionais do pacote: os opcionais (marcar ou não) e os itens por hora, em que o cliente
 * escolhe o total de horas. O que vem incluso aparece no próprio pacote; o preço final é o do orçamento.
 */
export function AddonsSelector({ items, addons, onChange }: AddonsSelectorProps) {
    if (items.length === 0) return null;

    return (
        <S.Card className="anim-card">
            <S.CardTitle>Adicionais</S.CardTitle>
            <S.CardDescription>
                Opcionais deste pacote, cobrados à parte. O valor entra no orçamento ao lado.
            </S.CardDescription>
            <S.AddonList>
                {items.map((it) => {
                    const price = describePrice(it.unitPrice, it.chargeType);
                    if (it.chargeType === "PER_HOUR") {
                        const included = it.mode === "INCLUDED" ? it.includedQuantity ?? 0 : 0;
                        const min = Math.max(included, 0);
                        const max = it.maxQuantity ?? undefined;
                        const value = typeof addons[it.itemId] === "number" ? (addons[it.itemId] as number) : included;
                        const set = (n: number) => onChange(it.itemId, Math.min(max ?? Infinity, Math.max(min, n)));
                        return (
                            <S.AddonRow as="div" key={it.itemId}>
                                <div>
                                    <strong>{it.name}</strong>
                                    <span>
                                        {included > 0 ? `${included}h inclusas no pacote; cada hora a mais: ${price.replace(" por hora", "")}` : price}
                                        {max != null ? `. Até ${max}h.` : ""}
                                    </span>
                                </div>
                                <S.Stepper role="group" aria-label={`Horas de ${it.name}`}>
                                    <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Menos uma hora de ${it.name}`}>−</button>
                                    <output aria-live="polite">{value}h</output>
                                    <button type="button" onClick={() => set(value + 1)} disabled={max != null && value >= max} aria-label={`Mais uma hora de ${it.name}`}>+</button>
                                </S.Stepper>
                            </S.AddonRow>
                        );
                    }
                    return (
                        <S.AddonRow key={it.itemId}>
                            <div>
                                <strong>{it.name}</strong>
                                <span>{it.description ? `${it.description}. ` : ""}{price}</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={addons[it.itemId] === true}
                                onChange={(e) => onChange(it.itemId, e.target.checked)}
                            />
                        </S.AddonRow>
                    );
                })}
            </S.AddonList>
        </S.Card>
    );
}
