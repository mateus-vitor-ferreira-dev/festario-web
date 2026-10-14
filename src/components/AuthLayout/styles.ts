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

/* Assinatura: janela em arco colonial com a foto da piscina */
export const Arch = styled.figure`
  margin: 0;
  min-height: 0;
  width: min(100%, 420px);
  justify-self: start;
  border-radius: var(--radius-arch);
  padding: 8px;
  border: 1px solid #b08a35;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 999px 999px 8px 8px;
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
