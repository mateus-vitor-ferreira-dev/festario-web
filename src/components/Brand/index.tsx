/**
 * @module components/Brand
 * @description Marca Festário desenhada inline, com a mesma geometria de
 * `docs/marca/svg` (as duas saem de `docs/marca/build-brand.cjs`, que escreve `geometry.ts`).
 *
 * Inline em vez de `<img>` para seguir o tema: o corpo da bandeirinha, as argolas e o nome
 * usam `--logo-body` e `--logo-ink`, que mudam no tema escuro. O cabeçalho e o agudo
 * (pitanga) e a célula do dia (milho) nunca mudam de cor.
 *
 * Mínimos do guia: símbolo e logotipo com 24px de altura; respiro de ¼ da altura
 * do símbolo em volta (o `padding` fica com quem posiciona a marca).
 */
import type { CSSProperties, SVGProps } from "react";
import { BRAND_NAME } from "../../config/brand";
import { LOGO, SYMBOL, SYMBOL_VIEWBOX, WORDMARK_ACCENT_PATH, WORDMARK_PATH } from "./geometry";

const MILHO = "#f4b41a";
const PITANGA = "#d8344a";

/** Tom fixo para fundos sempre escuros (painel do login, intro), independente do tema. */
const ON_DARK_VARS = {
    "--logo-body": "#9aa8f2",
    "--logo-ink": "#ffffff",
} as CSSProperties;

type Tone = "theme" | "onDark";

interface MarkProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
    /** `theme` segue o tema da página; `onDark` força a versão para fundo escuro. */
    tone?: Tone;
    /** Texto alternativo. Vazio deixa a marca decorativa (`aria-hidden`). */
    title?: string;
}

function a11y(title: string | undefined) {
    return title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true as const, focusable: "false" as const };
}

function toneStyle(tone: Tone, style?: CSSProperties): CSSProperties | undefined {
    return tone === "onDark" ? { ...ON_DARK_VARS, ...style } : style;
}

/** Símbolo na grade 512: calendário cuja folha é uma bandeirinha, com a célula do dia reservado. */
function SymbolShapes() {
    return (
        <>
            <path d={SYMBOL.header} fill={PITANGA} />
            {SYMBOL.pegs.map((p) => <rect key={p.x} {...p} fill="var(--logo-body)" />)}
            <path d={SYMBOL.body} fill="var(--logo-body)" />
            <path d={SYMBOL.cell} fill={MILHO} />
        </>
    );
}

function WordShapes() {
    return (
        <g transform={`translate(${LOGO.wordX} ${LOGO.baseline})`}>
            <path d={WORDMARK_PATH} fill="var(--logo-ink)" />
            <path d={WORDMARK_ACCENT_PATH} fill={PITANGA} />
        </g>
    );
}

/** Símbolo quadrado. Mínimo 24px. */
export function FestarioSymbol({ tone = "theme", title, style, ...rest }: MarkProps) {
    return (
        <svg viewBox={SYMBOL_VIEWBOX} {...a11y(title)} style={toneStyle(tone, style)} {...rest}>
            <SymbolShapes />
        </svg>
    );
}

/** Só o nome, recortado do logotipo: alinha exatamente quando vem logo depois do símbolo. */
export function FestarioWordmark({ tone = "theme", title, style, ...rest }: MarkProps) {
    return (
        <svg viewBox={`${LOGO.symbolWidth} 0 ${LOGO.width - LOGO.symbolWidth} ${LOGO.height}`} {...a11y(title)} style={toneStyle(tone, style)} {...rest}>
            <WordShapes />
        </svg>
    );
}

/** Logotipo completo (símbolo + nome). Altura mínima 24px. */
export function FestarioLogo({ tone = "theme", title = BRAND_NAME, style, ...rest }: MarkProps) {
    return (
        <svg viewBox={`0 0 ${LOGO.width} ${LOGO.height}`} {...a11y(title)} style={toneStyle(tone, style)} {...rest}>
            <g transform={LOGO.symbolTransform}>
                <SymbolShapes />
            </g>
            <WordShapes />
        </svg>
    );
}
