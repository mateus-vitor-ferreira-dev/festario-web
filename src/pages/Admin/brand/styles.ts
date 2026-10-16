import styled, { css } from "styled-components";

import { media } from "../../../styles/breakpoints";

export const Block = styled.section`
  display: grid;
  gap: 16px;
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);

  ${media.sm} {
    padding: 16px;
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
`;

export const Lead = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 68ch;
`;

/* Logo nos dois temas, lado a lado: o dono vê se ela some no escuro antes de publicar. */
export const Previews = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Preview = styled.figure<{ $dark?: boolean }>`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid ${({ $dark }) => ($dark ? "#2c3366" : "#dfe3f3")};
  background: ${({ $dark }) => ($dark ? "#0f1330" : "#ffffff")};

  figcaption {
    display: grid;
    gap: 2px;
    min-width: 0;
    font-size: var(--text-sm);
    color: ${({ $dark }) => ($dark ? "#c7cdea" : "#4a5178")};

    strong {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      color: ${({ $dark }) => ($dark ? "#f5f6fb" : "#151a3d")};
      overflow-wrap: anywhere;
    }
  }
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

/* Input de arquivo escondido atrás de um rótulo com cara de botão (o rótulo é o alvo de toque). */
export const FileLabel = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--on-brand);
  font-weight: 700;
  font-size: var(--text-sm);
  cursor: pointer;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  &:focus-within {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  ${({ $disabled }) => $disabled && css`
    opacity: 0.6;
    pointer-events: none;
  `}
`;

export const Progress = styled.progress`
  width: 100%;
  height: 8px;
  accent-color: var(--brand);
`;

export const Swatch = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  input[type="color"] {
    width: 56px;
    height: 44px;
    padding: 2px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    cursor: pointer;
  }
`;

/* Amostra do botão do cliente com a cor escolhida: o que importa é ler o texto branco. */
export const SampleButton = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  background: ${({ $color }) => $color};
  color: #ffffff;
  font-weight: 700;
`;

export const Verdict = styled.p<{ $ok: boolean }>`
  font-size: var(--text-sm);
  font-weight: 600;
  color: ${({ $ok }) => ($ok ? "var(--status-success-text)" : "var(--status-error-text)")};
`;

/* ── Fotos: folha de contato ─────────────────────────────────────────────── */

export const Sheet = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Tile = styled.li<{ $dragging?: boolean; $over?: boolean }>`
  display: grid;
  grid-template-rows: auto 1fr;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  overflow: hidden;
  opacity: ${({ $dragging }) => ($dragging ? 0.5 : 1)};
  outline: ${({ $over }) => ($over ? "2px dashed var(--brand)" : "none")};
  outline-offset: 2px;
`;

export const TileImage = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--bg-muted);
  cursor: grab;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

/* A capa ganha a bandeirinha de milho: é a foto que aparece no card do espaço. */
export const CoverFlag = styled.span`
  position: absolute;
  top: 0;
  left: 12px;
  padding: 6px 10px 10px;
  background: var(--gold);
  color: #151a3d;
  font-size: var(--text-xs);
  font-weight: 700;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
`;

export const Position = styled.span`
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: rgba(15, 19, 48, 0.72);
  color: #ffffff;
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
`;

export const TileBody = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px;
`;

export const TileActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Uploader = styled.form<{ $withPreview?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $withPreview }) => ($withPreview ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)")};
  gap: 16px;
  align-items: start;
  padding: 16px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-page);

  ${media.sm} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PendingPreview = styled.div`
  width: 160px;
  aspect-ratio: 4 / 3;

  ${media.sm} {
    width: 100%;
  }

  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-muted);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
