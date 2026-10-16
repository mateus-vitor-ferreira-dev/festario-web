import { FormEvent, useId, useState } from "react";

import type { SalonOriginApi } from "../../hooks/useSalonOrigin";
import * as S from "./styles";

function PinIcon() {
    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </svg>
    );
}

/** Máscara simples de CEP enquanto digita: 37200000 → 37200-000. */
const maskCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/**
 * De onde a vitrine mede a distância. Com uma origem escolhida, mostra de onde mede e um "Trocar";
 * sem origem, já abre as formas de informar. A localização só ordena: nenhum salão some por estar longe.
 */
export default function OriginBar({ origin }: { origin: SalonOriginApi }) {
    const { choice, label, canUseProfile, status, error } = origin;
    const hasOrigin = choice.kind !== "none";
    const [open, setOpen] = useState(false);
    const [cep, setCep] = useState(choice.kind === "cep" ? choice.cep : "");
    const panelId = useId();
    const cepId = useId();
    const busy = status === "locating";
    const showOptions = !hasOrigin || open;

    async function handleCep(e: FormEvent) {
        e.preventDefault();
        if (await origin.chooseCep(cep)) setOpen(false);
    }

    return (
        <S.OriginBar aria-labelledby={`${panelId}-title`}>
            <S.OriginSummary>
                <S.OriginIcon $active={hasOrigin}><PinIcon /></S.OriginIcon>
                <div>
                    <S.OriginTitle id={`${panelId}-title`}>
                        {hasOrigin ? `Perto ${label}` : "Veja primeiro os salões perto de você"}
                    </S.OriginTitle>
                    <S.OriginHint>
                        {hasOrigin
                            ? "Os mais perto aparecem primeiro. Os outros continuam na lista."
                            : "Use a sua localização ou digite um CEP. A lista continua com todos os salões."}
                    </S.OriginHint>
                </div>
                {hasOrigin && (
                    <S.OriginToggle type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
                        {open ? "Fechar" : "Trocar"}
                    </S.OriginToggle>
                )}
            </S.OriginSummary>

            {showOptions && (
                <S.OriginOptions id={panelId}>
                    <S.OriginButton type="button" onClick={() => { origin.locate(); setOpen(false); }} disabled={busy}>
                        {busy ? "Localizando..." : "Usar minha localização"}
                    </S.OriginButton>

                    <S.CepForm onSubmit={handleCep}>
                        <label htmlFor={cepId}>CEP</label>
                        <input
                            id={cepId}
                            inputMode="numeric"
                            autoComplete="postal-code"
                            placeholder="00000-000"
                            value={cep}
                            onChange={(e) => setCep(maskCep(e.target.value))}
                        />
                        <S.OriginButton type="submit" disabled={busy}>Usar CEP</S.OriginButton>
                    </S.CepForm>

                    {canUseProfile && choice.kind !== "profile" && (
                        <S.OriginLink type="button" onClick={() => { origin.chooseProfile(); setOpen(false); }}>
                            Usar o endereço do perfil
                        </S.OriginLink>
                    )}
                    {hasOrigin && (
                        <S.OriginLink type="button" onClick={() => { origin.clear(); setOpen(false); }}>
                            Não usar localização
                        </S.OriginLink>
                    )}
                </S.OriginOptions>
            )}

            {error && <S.OriginError role="alert">{error}</S.OriginError>}
        </S.OriginBar>
    );
}
