import styled from "styled-components";
import { media } from "../../styles/breakpoints";
import { FestarioSymbol, FestarioWordmark } from "../Brand";

/* ─── Shell ─── */

export const Container = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);

  ${media.lg} {
    grid-template-columns: 1fr;
  }
`;

/* ─── Left — brand panel ─── */

export const LeftSide = styled.aside`
  position: sticky;
  top: 0;
  /* altura mínima, nunca fixa: se a conta de escala errar, o painel cresce em vez de cortar o texto */
  min-height: 100vh;
  min-height: 100dvh;
  /* anil escuro com um halo de anil no alto: noite de festa, sem preto neutro */
  background:
    radial-gradient(120% 70% at 0% 0%, rgba(39, 53, 126, 0.75) 0%, transparent 60%),
    #141936;
  /* no tema escuro a página também é noite: um fio separa os dois lados */
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  color: #ffffff;
  /* margens e espaços crescem com a tela, limitados também pela altura
     (monitores largos e baixos não podem empilhar conteúdo além da tela) */
  padding: clamp(28px, min(3.2vw, 4vh), 72px) clamp(40px, 5vw, 112px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  /* áreas fixas: quando a prévia some (telas baixas), o título continua no rodapé do painel */
  grid-template-areas: "brand" "preview" "body";
  gap: clamp(20px, min(2.5vw, 3vh), 48px);

  ${media.lg} {
    display: none;
  }
`;

/* logotipo em duas peças; respiro do guia (¼ da altura do símbolo) vem do gap do grid */
export const Brand = styled.div`
  grid-area: brand;
  display: flex;
  align-items: center;
  height: clamp(44px, min(3.4vw, 6.5vh), 76px);
`;

export const BrandSymbol = styled(FestarioSymbol)<{ $visible: boolean }>`
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  flex-shrink: 0;
  display: block;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 180ms ease;
`;

export const BrandWordmark = styled(FestarioWordmark)`
  height: 100%;
  width: auto;
  display: block;
`;

/* Prévia do produto: calendário do mês desenhado em código.
   Tudo em em: o tamanho de fonte da prévia escala com a tela e o resto acompanha. */
export const Preview = styled.div`
  grid-area: preview;
  position: relative;
  align-self: center;
  font-size: clamp(12px, min(1.05vw, 1.35vh), 21px);
  width: min(100%, 27em);
  padding-top: 1.9em;

  /* em telas baixas a prévia não cabe junto da marca e do título: sai */
  @media (max-height: 720px) {
    display: none;
  }
`;

export const PreviewCard = styled.div`
  position: relative;
  background: #ffffff;
  color: #141936;
  border-radius: var(--radius-lg);
  /* o alto do cartão guarda o varal de bandeirinhas, como no símbolo */
  padding: 2.5em 1.6em 1.35em;
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.45);
`;

/* varal: fio de anil preso nos cantos do cartão, bandeirinhas milho e pitanga */
export const PreviewBunting = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.1em;
  overflow: visible;
`;

export const PreviewMonth = styled.p`
  font-family: var(--font-display);
  font-size: 1.6em;
  font-weight: 600;
  margin: 0 0 0.65em;

  &::first-letter {
    text-transform: uppercase;
  }
`;

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.28em;
`;

export const PreviewWeekday = styled.span`
  font-size: max(12px, 0.8em);
  font-weight: 500;
  color: #5a6079;
  text-align: center;
  padding-bottom: 0.3em;
`;

const dayStates = {
  free: "background: #ebedf6; color: #141936;",
  /* indisponível sem alarmar: apagado e riscado */
  booked: "background: transparent; color: #7c8199; text-decoration: line-through; text-decoration-color: #c5c9dc;",
  /* a data da festa: anil com anel de milho (o check do símbolo) */
  confirmed: "background: #27357e; color: #ffffff; box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #f4b41a;",
} as const;

export const PreviewDay = styled.span<{ $state: keyof typeof dayStates }>`
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 1em;
  font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums;
  ${({ $state }) => dayStates[$state]}
`;

export const PreviewLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em 1.1em;
  margin-top: 1.1em;
  font-size: max(12px, 0.87em);
  color: #5a6079;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.45em;
  }

  i {
    width: 0.75em;
    height: 0.75em;
    border-radius: 3px;
  }

  i[data-state="free"] { background: #ebedf6; }
  i[data-state="booked"] { background: transparent; border: 1px solid #a2a7bd; }
  i[data-state="confirmed"] { background: #27357e; }
`;

export const PreviewTicket = styled.div`
  position: absolute;
  right: -1.3em;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  padding: 0.8em 1.05em;
  border-radius: var(--radius-md);
  background: #fdf4dc;
  color: #141936;
  border: 1px solid #f2d68c;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.5);

  strong {
    font-size: max(12px, 0.87em);
    font-weight: 700;
    color: #1b6334;
  }

  span {
    font-family: var(--font-display);
    font-size: 1.3em;
    font-weight: 600;

    &::first-letter {
      text-transform: uppercase;
    }
  }
`;

export const LeftBody = styled.div`
  grid-area: body;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  max-width: 30em;
  font-size: clamp(16px, min(1.1vw, 2vh), 22px);
`;

export const Headline = styled.h1`
  font-size: 2.4em;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.08;
  margin: 0;
`;

export const Tagline = styled.p`
  font-size: 1em;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

/* ─── Right — form panel ─── */

export const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: 48px 32px;

  ${media.sm} {
    padding: 32px 20px;
    align-items: flex-start;
    padding-top: 48px;
  }
`;

export const FormArea = styled.div`
  width: 100%;
  max-width: clamp(420px, 27vw, 560px);
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 1.8vw, 36px);
`;

export const MobileBrand = styled.div`
  display: none;

  ${media.lg} {
    display: flex;
    align-self: center;
    align-items: center;
    height: 48px;
    margin-bottom: 4px;
  }

  ${media.sm} {
    height: 40px;
  }
`;

export const MobileBrandSymbol = styled(FestarioSymbol)<{ $visible: boolean }>`
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  display: block;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 180ms ease;
`;

export const MobileBrandWordmark = styled(FestarioWordmark)`
  height: 100%;
  width: auto;
  display: block;
`;

export const FormHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h2`
  font-size: clamp(30px, 2.1vw, 44px);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
`;
