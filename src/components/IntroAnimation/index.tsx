import { useEffect, useMemo, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import logo from "../../assets/logo-recanto.svg";

const REVEAL_DURATION = 1080;
const TRAVEL_DURATION = 1180;

const logoReveal = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.42);
    filter: blur(10px) drop-shadow(0 0 0 rgba(193, 166, 129, 0));
  }
  55% {
    opacity: 1;
    transform: scale(1.08);
    filter: blur(0) drop-shadow(0 0 56px rgba(193, 166, 129, 0.58));
  }
  78% {
    transform: scale(0.97);
    filter: blur(0) drop-shadow(0 0 32px rgba(193, 166, 129, 0.32));
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0) drop-shadow(0 0 18px rgba(150, 123, 88, 0.22));
  }
`;

const travelSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const lightPulse = keyframes`
  0% {
    opacity: 0;
  }
  22% {
    opacity: 0.22;
  }
  48% {
    opacity: 0.08;
  }
  72% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
`;

const ambientSweep = keyframes`
  0% {
    opacity: 0;
    transform: scaleY(0.92);
  }
  35% {
    opacity: 0.24;
  }
  100% {
    opacity: 0;
    transform: scaleY(1.06);
  }
`;

const Overlay = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity 620ms ease;
`;

const Background = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 10%, #2a5c49 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, #0f2820 0%, transparent 50%),
    #1a3d32;
`;

const AmbientLight = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: -10%;
  z-index: 1;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 24%, transparent 58%),
    radial-gradient(circle at 50% 45%, rgba(201, 168, 76, 0.22) 0%, transparent 52%);
  opacity: 0;

  ${({ $active }) =>
    $active &&
    css`
      animation: ${lightPulse} 700ms ease-in-out forwards;
    `}
`;

const SoftCurtain = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0.05) 38%,
    rgba(10, 26, 21, 0.08) 100%
  );
  opacity: 0;
  transform-origin: center;

  ${({ $active }) =>
    $active &&
    css`
      animation: ${ambientSweep} 760ms ease-in-out forwards;
    `}
`;

const MovingLogo = styled.div<{ $x: number; $y: number; $size: number; $phase: string }>`
  position: fixed;
  left: ${({ $x }) => `${$x}px`};
  top: ${({ $y }) => `${$y}px`};
  width: ${({ $size }) => `${$size}px`};
  transform: translate(-50%, -50%);
  z-index: 3;
  will-change: left, top, width, opacity;
  opacity: ${({ $phase }) => ($phase === "done" ? 0 : 1)};
  transition:
    left ${TRAVEL_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1),
    top ${TRAVEL_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1),
    width ${TRAVEL_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 260ms ease;
`;

const MovingLogoImage = styled.img<{ $phase: string }>`
  width: 100%;
  display: block;
  object-fit: contain;
  will-change: transform, filter, opacity;
  transform: rotate(0deg);

  ${({ $phase }) =>
    $phase === "revealing" &&
    css`
      animation: ${logoReveal} ${REVEAL_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) both;
    `}

  ${({ $phase }) =>
    $phase === "travelling" &&
    css`
      animation: ${travelSpin} ${TRAVEL_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      filter: drop-shadow(0 0 18px rgba(193, 166, 129, 0.22));
    `}
`;

function getVisibleTarget() {
  const desktopTarget = document.querySelector(
    "[data-intro-target-desktop='true']"
  );
  const mobileTarget = document.querySelector(
    "[data-intro-target-mobile='true']"
  );

  const candidates = [desktopTarget, mobileTarget].filter(Boolean);

  for (const element of candidates) {
    if (!element) continue;
    const rect = (element as Element).getBoundingClientRect();
    const style = window.getComputedStyle(element as Element);

    const visible =
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden";

    if (visible) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        size: rect.width,
      };
    }
  }

  return null;
}

interface IntroAnimationProps {
  onComplete: () => void;
}

/**
 * Animação de intro com o logo do Recanto Vila Rica.
 *
 * Exibe o logo no centro da tela com efeito de revelação (fade + scale), depois o
 * anima até o destino no Header (buscado via `[data-intro-target-desktop]` /
 * `[data-intro-target-mobile]`). Ao terminar chama `onComplete`.
 *
 * Sequência de fases: `"revealing"` → `"travelling"` → `"done"`.
 *
 * @component
 */
export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState("revealing");
  const [pulseActive, setPulseActive] = useState(false);
  const [curtainActive, setCurtainActive] = useState(false);
  const [target, setTarget] = useState<{ x: number; y: number; size: number } | null>(null);

  const start = useMemo(
    () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: Math.min(320, window.innerWidth * 0.7),
    }),
    []
  );

  const current = phase === "travelling" && target ? target : start;
  const overlayHidden = phase === "done";

  useEffect(() => {
    const updateTarget = () => {
      const foundTarget = getVisibleTarget();
      if (foundTarget) {
        setTarget(foundTarget);
      }
    };

    updateTarget();

    const travelTimer = setTimeout(() => {
      updateTarget();
      setPhase("travelling");
    }, REVEAL_DURATION);

    const pulseTimer = setTimeout(() => {
      setPulseActive(true);
    }, REVEAL_DURATION + TRAVEL_DURATION - 360);

    const curtainTimer = setTimeout(() => {
      setCurtainActive(true);
    }, REVEAL_DURATION + TRAVEL_DURATION - 300);

    const fadeTimer = setTimeout(() => {
      setPhase("done");
    }, REVEAL_DURATION + TRAVEL_DURATION + 180);

    const doneTimer = setTimeout(() => {
      onComplete();
    }, REVEAL_DURATION + TRAVEL_DURATION + 780);

    const handleResize = () => {
      updateTarget();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(travelTimer);
      clearTimeout(pulseTimer);
      clearTimeout(curtainTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <Overlay $hidden={overlayHidden}>
      <Background />
      <AmbientLight $active={pulseActive} />
      <SoftCurtain $active={curtainActive} />

      <MovingLogo
        $x={current.x}
        $y={current.y}
        $size={current.size}
        $phase={phase}
      >
        <MovingLogoImage
          src={logo}
          alt="Recanto Vila Rica"
          $phase={phase}
        />
      </MovingLogo>
    </Overlay>
  );
}