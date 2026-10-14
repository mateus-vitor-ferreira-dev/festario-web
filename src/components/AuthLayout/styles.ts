import styled from "styled-components";
import { media } from "../../styles/breakpoints";

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
  background: #133428;
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

export const Brand = styled.div`
  grid-area: brand;
  display: flex;
  align-items: center;
  gap: clamp(14px, 1.2vw, 24px);
`;

export const BrandName = styled.span`
  font-family: var(--font-display);
  font-size: clamp(22px, 1.6vw, 34px);
  font-weight: 600;
  line-height: 1.1;
  color: #ffffff;
`;

/* o logo é um brasão detalhado (louros + nome interno): abaixo de ~88px vira ruído */
export const BrandLogoWrapper = styled.div<{ $visible: boolean }>`
  width: clamp(88px, min(6.5vw, 11vh), 136px);
  aspect-ratio: 1;
  flex-shrink: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 180ms ease;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BrandLogo = styled.img`
  width: 100%;
  display: block;
  object-fit: contain;
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
  background: #ffffff;
  color: #17241e;
  border-radius: var(--radius-lg);
  padding: 1.6em 1.6em 1.35em;
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.45);
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
  color: #5c6b63;
  text-align: center;
  padding-bottom: 0.3em;
`;

const dayStates = {
  free: "background: #e8ede6; color: #17241e;",
  /* indisponível sem alarmar: apagado e riscado */
  booked: "background: transparent; color: #8a978f; text-decoration: line-through; text-decoration-color: #c3cdc4;",
  confirmed: "background: #1f4f41; color: #ffffff; box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #b08a35;",
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
  color: #5c6b63;

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

  i[data-state="free"] { background: #e8ede6; }
  i[data-state="booked"] { background: transparent; border: 1px solid #a3aea7; }
  i[data-state="confirmed"] { background: #1f4f41; }
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
  background: #f7f0de;
  color: #17241e;
  border: 1px solid #e6d5a6;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.5);

  strong {
    font-size: max(12px, 0.87em);
    font-weight: 700;
    color: #1d6436;
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
  color: rgba(255, 255, 255, 0.78);
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

export const MobileBrand = styled.div<{ $visible: boolean }>`
  display: none;

  ${media.lg} {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition: opacity 180ms ease;
  }
`;

export const MobileBrandLogo = styled.img`
  width: min(150px, 42vw);
  display: block;
  object-fit: contain;
`;

export const MobileBrandName = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
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
