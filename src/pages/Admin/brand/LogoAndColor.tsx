import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import SalonMark from "../../../components/SalonMark";
import { useSalonBrand } from "../../../contexts/SalonBrandContext";
import { getBranding, removeLogo, updateBrandColor, uploadLogo } from "../../../services/media";
import type { SalonBranding } from "../../../types";
import { AA, HEX, contrast, formatRatio } from "../../../utils/color";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import * as S from "./styles";

const PLATFORM_COLOR = "#27357e";
const ACCEPT_LOGO = "image/jpeg,image/png,image/webp,image/svg+xml";

/**
 * Logo e cor do salão no painel. A logo aparece nos dois temas antes de qualquer coisa, para o dono
 * ver se ela some no fundo escuro; a cor é conferida aqui com o mesmo contraste que a API exige.
 */
export function LogoAndColor() {
    const { refresh } = useSalonBrand();
    const [brand, setBrand] = useState<SalonBranding | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [removing, setRemoving] = useState(false);
    const [color, setColor] = useState(PLATFORM_COLOR);
    const [savingColor, setSavingColor] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        getBranding(controller.signal)
            .then((b) => { setBrand(b); setColor(b.primaryColor ?? PLATFORM_COLOR); })
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar a marca do salão.")); });
        return () => controller.abort();
    }, []);

    if (!brand) return <A.LoadingSpinner aria-label="Carregando a marca do salão" />;

    async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            setProgress(0);
            const updated = await uploadLogo(file, setProgress);
            setBrand(updated);
            refresh();
            toast.success("Logo atualizada.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível enviar a logo."));
        } finally {
            setProgress(null);
        }
    }

    async function handleRemove() {
        if (!window.confirm("Remover a logo? No lugar dela aparecem as iniciais do salão.")) return;
        try {
            setRemoving(true);
            setBrand(await removeLogo());
            refresh();
            toast.success("Logo removida.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível remover a logo."));
        } finally {
            setRemoving(false);
        }
    }

    const valid = HEX.test(color);
    const ratio = valid ? contrast(color, "#ffffff") : 0;
    const passes = ratio >= AA;
    const changed = valid && color.toLowerCase() !== (brand.primaryColor ?? PLATFORM_COLOR);

    async function saveColor(next: string | null) {
        try {
            setSavingColor(true);
            const updated = await updateBrandColor(next);
            setBrand(updated);
            setColor(updated.primaryColor ?? PLATFORM_COLOR);
            refresh();
            toast.success(next ? "Cor do salão salva." : "O salão voltou para a cor da plataforma.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível salvar a cor."));
        } finally {
            setSavingColor(false);
        }
    }

    return (
        <>
            <S.Block aria-labelledby="brand-logo">
                <h3 id="brand-logo">Logo</h3>
                <S.Lead>
                    Aparece no topo das telas dos seus clientes e no contrato. Prefira a versão quadrada da logo, com fundo transparente.
                    JPEG, PNG, WebP ou SVG, até 8 MB.
                </S.Lead>
                <S.Previews>
                    <S.Preview>
                        <SalonMark name={brand.name} logoVariants={brand.logoVariants} logoUrl={brand.logoUrl} size="lg" surface="light" decorative />
                        <figcaption><strong>{brand.name}</strong>Tema claro</figcaption>
                    </S.Preview>
                    <S.Preview $dark>
                        <SalonMark name={brand.name} logoVariants={brand.logoVariants} logoUrl={brand.logoUrl} size="lg" surface="dark" decorative />
                        <figcaption><strong>{brand.name}</strong>Tema escuro</figcaption>
                    </S.Preview>
                </S.Previews>
                {progress !== null && <S.Progress value={progress} max={1} aria-label="Enviando a logo" />}
                <S.Row>
                    <S.FileLabel $disabled={progress !== null}>
                        {progress !== null ? "Enviando..." : brand.logoUrl ? "Trocar logo" : "Enviar logo"}
                        <input type="file" accept={ACCEPT_LOGO} onChange={handleLogo} disabled={progress !== null} />
                    </S.FileLabel>
                    {brand.logoUrl && (
                        <A.SecondaryButton type="button" onClick={handleRemove} disabled={removing || progress !== null}>
                            {removing ? "Removendo..." : "Remover logo"}
                        </A.SecondaryButton>
                    )}
                </S.Row>
            </S.Block>

            <S.Block aria-labelledby="brand-color">
                <h3 id="brand-color">Cor do salão</h3>
                <S.Lead>
                    Usada como destaque nas telas do seu salão (o filete das fotos e o selo do topo). Os botões e textos seguem
                    as cores da plataforma, para continuarem legíveis.
                </S.Lead>
                <S.Swatch>
                    <input type="color" value={valid ? color : PLATFORM_COLOR} onChange={(e) => setColor(e.target.value)} aria-label="Escolher a cor" />
                    <A.TextInput
                        aria-label="Código da cor"
                        value={color}
                        onChange={(e) => setColor(e.target.value.trim())}
                        maxLength={7}
                        style={{ width: 120, fontVariantNumeric: "tabular-nums" }}
                    />
                    {valid && <S.SampleButton $color={color}>Reservar</S.SampleButton>}
                </S.Swatch>
                <S.Verdict $ok={valid && passes} aria-live="polite">
                    {!valid
                        ? "Use o formato #RRGGBB, por exemplo #27357e."
                        : passes
                            ? `Contraste ${formatRatio(ratio)} com texto branco: pode usar.`
                            : `Contraste ${formatRatio(ratio)} com texto branco: abaixo de 4,5:1. Escolha um tom mais escuro.`}
                </S.Verdict>
                <S.Row>
                    <A.PrimaryButton type="button" onClick={() => saveColor(color.toLowerCase())} disabled={!valid || !passes || !changed || savingColor}>
                        {savingColor ? "Salvando..." : "Salvar cor"}
                    </A.PrimaryButton>
                    {brand.primaryColor && (
                        <A.SecondaryButton type="button" onClick={() => saveColor(null)} disabled={savingColor}>
                            Usar a cor da plataforma
                        </A.SecondaryButton>
                    )}
                </S.Row>
            </S.Block>
        </>
    );
}
