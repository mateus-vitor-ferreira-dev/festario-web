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
  height: 100vh;
  height: 100dvh;
  background: #133428;
  color: #ffffff;
  padding: 40px clamp(32px, 4vw, 56px) 48px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 32px;

  ${media.lg} {
    display: none;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BrandName = styled.span`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: #ffffff;
`;

export const BrandLogoWrapper = styled.div<{ $visible: boolean }>`
  width: 56px;
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

/* Prévia do produto: calendário do mês desenhado em código */
export const Preview = styled.div`
  position: relative;
  align-self: center;
  width: min(100%, 400px);
  padding-top: 28px;
`;

export const PreviewCard = styled.div`
  background: #ffffff;
  color: #17241e;
  border-radius: var(--radius-lg);
  padding: 24px 24px 20px;
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.45);
`;

export const PreviewMonth = styled.p`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0 0 16px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

export const PreviewWeekday = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6f7d75;
  text-align: center;
  padding-bottom: 4px;
`;

const dayStates = {
  free: "background: #e8ede6; color: #17241e;",
  /* indisponível sem alarmar: apagado e riscado */
  booked: "background: transparent; color: #a3aea7; text-decoration: line-through; text-decoration-color: #c3cdc4;",
  confirmed: "background: #1f4f41; color: #ffffff; box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #b08a35;",
} as const;

export const PreviewDay = styled.span<{ $state: keyof typeof dayStates }>`
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: lining-nums tabular-nums;
  ${({ $state }) => dayStates[$state]}
`;

export const PreviewLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 16px;
  font-size: 13px;
  color: #5c6b63;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  i[data-state="free"] { background: #e8ede6; }
  i[data-state="booked"] { background: transparent; border: 1px solid #c3cdc4; }
  i[data-state="confirmed"] { background: #1f4f41; }
`;

export const PreviewTicket = styled.div`
  position: absolute;
  right: -20px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: #f7f0de;
  color: #17241e;
  border: 1px solid #e6d5a6;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.5);

  strong {
    font-size: 13px;
    font-weight: 700;
    color: #1d6436;
  }

  span {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;

    &::first-letter {
      text-transform: uppercase;
    }
  }
`;

export const LeftBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
`;

export const Headline = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 600;
  color: #ffffff;
  line-height: 1.1;
  margin: 0;
`;

export const Tagline = styled.p`
  font-size: var(--text-base);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
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
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 28px;
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
  font-size: var(--text-2xl);
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
