import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Shell ─── */

export const Container = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Left — brand panel ─── */

export const LeftSide = styled.div`
  position: relative;
  overflow: hidden;
  background: #1a3d32;
  background-image:
    radial-gradient(ellipse at 20% 10%, #2a5c49 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, #0f2820 0%, transparent 50%);
  padding: 56px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 860px) {
    display: none;
  }
`;

export const LeftInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export const BrandName = styled.span`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c9a84c;
  text-shadow: 0 2px 12px rgba(201, 168, 76, 0.25);
`;

export const BrandLogoWrapper = styled.div<{ $visible: boolean }>`
  width: min(190px, 28vw);
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

export const LeftBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Headline = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 380px;
  margin: 0;
`;

export const Tagline = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  max-width: 360px;
  margin: 0;
`;

/* decorative circles */

export const Deco1 = styled.div`
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
  bottom: -140px;
  right: -120px;
  pointer-events: none;
`;

export const Deco2 = styled.div`
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
  top: 24px;
  right: 32px;
  pointer-events: none;
`;

export const Deco3 = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  top: 80px;
  left: 40px;
  pointer-events: none;
`;

/* ─── Right — form panel ─── */

export const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: 48px 32px;

  @media (max-width: 480px) {
    padding: 32px 20px;
    align-items: flex-start;
    padding-top: 48px;
  }
`;

export const FormArea = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: ${fadeIn} 0.35s ease;
`;

export const MobileBrand = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 860px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
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
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a84c;
`;

export const FormHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h2`
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
`;
