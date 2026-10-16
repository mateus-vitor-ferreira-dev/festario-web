import styled, { css } from "styled-components";

import { initials, pickVariant, srcSet } from "../../utils/images";
import type { ImageVariant } from "../../types";
import { Bunting } from "./Bunting";

type Size = "sm" | "md" | "lg";
const PX: Record<Size, number> = { sm: 32, md: 48, lg: 96 };

interface SalonMarkProps {
    name: string;
    logoVariants?: ImageVariant[] | null;
    logoUrl?: string | null;
    size?: Size;
    /** Fundo do selo: o do tema (padrão), ou fixo claro/escuro para a pré-visualização do painel. */
    surface?: "auto" | "light" | "dark";
    /** O nome do salão já aparece ao lado: o selo não repete para o leitor de tela. */
    decorative?: boolean;
}

/**
 * Selo do salão: a logo dele ou, sem logo, as iniciais sob as bandeirinhas na cor do salão. Nunca uma
 * imagem quebrada. A logo é decorativa quando o nome aparece ao lado; o `alt` fica com o nome.
 */
export default function SalonMark({ name, logoVariants, logoUrl, size = "md", surface = "auto", decorative = false }: SalonMarkProps) {
    const px = PX[size];
    const variant = pickVariant(logoVariants, px * 2);
    const src = variant?.url ?? logoUrl ?? null;
    return (
        <Mark $px={px} $surface={surface} $hasLogo={Boolean(src)}>
            {src ? (
                <img src={src} srcSet={srcSet(logoVariants)} sizes={`${px}px`} width={px} height={px} alt={decorative ? "" : `Logo de ${name}`} decoding="async" />
            ) : (
                <>
                    <Flags flags={3} />
                    <span {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": name })}>{initials(name)}</span>
                </>
            )}
        </Mark>
    );
}

const Mark = styled.span<{ $px: number; $surface: "auto" | "light" | "dark"; $hasLogo: boolean }>`
  position: relative;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ $px }) => $px}px;
  height: ${({ $px }) => $px}px;
  border-radius: ${({ $px }) => ($px >= 64 ? "var(--radius-lg)" : "var(--radius-md)")};
  overflow: hidden;
  color: var(--salon-accent);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);

  ${({ $surface }) => $surface === "light" && css`background: #ffffff; border-color: #dfe3f3; color: var(--salon-color, #27357e);`}
  ${({ $surface }) => $surface === "dark" && css`background: #0f1330; border-color: #2c3366; color: var(--salon-color-dark, #adb8f5);`}

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: ${({ $px }) => Math.round($px * 0.08)}px;
  }

  span {
    position: relative;
    margin-top: ${({ $px }) => Math.round($px * 0.18)}px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: ${({ $px }) => Math.round($px * 0.38)}px;
    line-height: 1;
    letter-spacing: 0.02em;
    font-variant-numeric: lining-nums;
  }
`;

const Flags = styled(Bunting)`
  position: absolute;
  top: 8%;
  left: 10%;
  width: 80%;
  height: 34%;
`;
