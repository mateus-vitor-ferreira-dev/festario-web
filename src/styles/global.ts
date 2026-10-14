import { createGlobalStyle } from "styled-components";
import { media } from "./breakpoints";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* ── Tipografia — superfamília Alegreya ("convite") ──
       Display: títulos, datas, preços. Sans: toda a interface. */
    --font-display: "Alegreya", Georgia, "Times New Roman", serif;
    --font-sans:    "Alegreya Sans", system-ui, -apple-system, "Segoe UI", sans-serif;

    /* Escala clássica (Bringhurst): 13 · 15 · 16 · 20 · 24 · 30 · 38 · 48 */
    --text-xs:   13px;
    --text-sm:   15px;
    --text-base: 16px;
    --text-lg:   20px;
    --text-xl:   24px;
    --text-2xl:  30px;
    --text-3xl:  38px;
    --text-4xl:  48px;

    /* ── Raio por hierarquia: controle < painel < assinatura ── */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-pill: 999px;
    /* Arco de janela colonial — usado só nos elementos-assinatura */
    --radius-arch: 999px 999px var(--radius-lg) var(--radius-lg);

    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  }

  :root, [data-theme="light"] {
    /* ── Fundos — folha clara, papel ── */
    --bg-page:    #f1f4ef;
    --bg-surface: #ffffff;
    --bg-muted:   #e8ede6;

    /* ── Texto — tinta e pedra ── */
    --text-primary:   #17241e;
    --text-secondary: #2e3d36;
    --text-muted:     #5c6b63;
    --text-faint:     #6f7d75;
    --text-medium:    #3e4f47;

    /* ── Bordas ── */
    --border-default: #dbe2d9;
    --border-medium:  #c3cdc4;

    /* ── Marca — mata ── */
    --brand:        #1f4f41;
    --brand-mid:    #2d6a57;
    --brand-dark:   #133428;
    --brand-subtle: #e9f2ec;
    --brand-border: #b9d6c6;
    --on-brand:     #ffffff;

    /* ── Ouro velho — decorativo; --gold-text para texto sobre claro ── */
    --gold:        #b08a35;
    --gold-dark:   #8a6a1f;
    --gold-text:   #7d5f19;
    --gold-subtle: #f7f0de;
    --gold-border: #e6d5a6;

    /* ── Status ── */
    --status-paid-bg:     #e9f5ec;
    --status-paid-text:   #1d6436;
    --status-paid-border: #b8dcc3;

    --status-pending-bg:        #fbf3e1;
    --status-pending-text:      #8f5a06;
    --status-pending-text-deep: #774a05;
    --status-pending-border:    #ead29a;

    --status-error-bg:    #fbeceb;
    --status-error-text:  #a8261d;
    --status-error-border:#efc3bf;
    --status-error-hover: #f7dedc;

    --status-info-bg:     #eaf0f7;
    --status-info-text:   #24518a;
    --status-info-border: #c2d3e8;

    --status-success-text: #1d7a43;
    --color-error: #c2352b;

    --status-cancelled-bg:     #fbeceb;
    --status-cancelled-text:   #a8261d;
    --status-cancelled-border: #efc3bf;

    /* ── Calendário — ocupado (telha) e bloqueado (azul colonial) ── */
    --calendar-occupied-bg:     #8c3b22;
    --calendar-occupied-text:   #fde3d4;
    --calendar-occupied-border: #a4482b;
    --calendar-blocked-bg:      #2f4a6b;
    --calendar-blocked-text:    #dbe6f3;
    --calendar-blocked-border:  #405f85;

    /* ── Acentos de apoio (gráficos/indicadores) ── */
    --accent-blue: #2f5f8f;
    --accent-teal: #2b7a6b;

    /* ── Elevação — só para o que flutua (menus, modais, chat) ── */
    --shadow-sm: 0 1px 2px rgba(23, 36, 30, 0.06);
    --shadow-md: 0 6px 16px -4px rgba(23, 36, 30, 0.12), 0 2px 4px rgba(23, 36, 30, 0.05);
    --shadow-lg: 0 18px 40px -12px rgba(23, 36, 30, 0.22), 0 4px 10px rgba(23, 36, 30, 0.06);
    --focus-ring: 0 0 0 3px rgba(31, 79, 65, 0.22);
  }

  [data-theme="dark"] {
    /* ── Mata à noite — verde profundo, nunca preto neutro ── */
    --bg-page:    #0f1a16;
    --bg-surface: #16241f;
    --bg-muted:   #1e2f29;

    --text-primary:   #e9efe9;
    --text-secondary: #c2cec6;
    --text-muted:     #93a39a;
    --text-faint:     #7d8d85;
    --text-medium:    #b3c1b9;

    --border-default: #263a33;
    --border-medium:  #334a42;

    --brand:        #7ccaa5;
    --brand-mid:    #66b791;
    --brand-dark:   #2f7a5e;
    --brand-subtle: #16302a;
    --brand-border: #2a4e42;
    --on-brand:     #0c1612;

    --gold:        #d6b463;
    --gold-dark:   #c29c45;
    --gold-text:   #dcbd72;
    --gold-subtle: #23261a;
    --gold-border: #4d4024;

    --status-paid-bg:     #14301f;
    --status-paid-text:   #8fd8a8;
    --status-paid-border: #285c3a;

    --status-pending-bg:        #2c2312;
    --status-pending-text:      #f0c56e;
    --status-pending-text-deep: #e6b14d;
    --status-pending-border:    #5a4520;

    --status-error-bg:    #321816;
    --status-error-text:  #f29a90;
    --status-error-border:#5e2a25;
    --status-error-hover: #3c1d1a;

    --status-info-bg:     #142338;
    --status-info-text:   #9cc2ee;
    --status-info-border: #2a4566;

    --status-success-text: #8fd8a8;
    --color-error: #f29a90;

    --status-cancelled-bg:     #321816;
    --status-cancelled-text:   #f29a90;
    --status-cancelled-border: #5e2a25;

    --calendar-occupied-bg:     #6e2e1a;
    --calendar-occupied-text:   #fbd2bd;
    --calendar-occupied-border: #8c3b22;
    --calendar-blocked-bg:      #263d59;
    --calendar-blocked-text:    #cfe0f4;
    --calendar-blocked-border:  #3a5a80;

    --accent-blue: #8fb4de;
    --accent-teal: #79c4b3;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 6px 16px -4px rgba(0, 0, 0, 0.55), 0 2px 4px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 18px 40px -12px rgba(0, 0, 0, 0.7), 0 4px 10px rgba(0, 0, 0, 0.35);
    --focus-ring: 0 0 0 3px rgba(124, 202, 165, 0.3);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    color-scheme: light dark;
  }

  body {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: 1.5;
    background: var(--bg-page);
    color: var(--text-primary);
    font-variant-numeric: lining-nums;
    text-rendering: optimizeLegibility;
    transition: background 0.2s ease, color 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Focus ring universal — WCAG 2.4.7 ── */
  *:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  /* inputs já usam border + shadow como indicador de foco */
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none;
  }

  button, input, textarea, select {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.005em;
    line-height: 1.15;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  table, time, [data-numeric] {
    font-variant-numeric: lining-nums tabular-nums;
  }

  img, svg, video {
    max-width: 100%;
  }

  ::selection {
    background: var(--brand);
    color: var(--on-brand);
  }

  /* ── Toasts (react-toastify) com os tokens do app ── */
  :root {
    --toastify-font-family: var(--font-sans);
    --toastify-color-light: var(--bg-surface);
    --toastify-color-dark: var(--bg-surface);
    --toastify-text-color-light: var(--text-primary);
    --toastify-text-color-dark: var(--text-primary);
    --toastify-color-success: var(--status-success-text);
    --toastify-color-error: var(--color-error);
    --toastify-color-warning: var(--status-pending-text);
    --toastify-color-info: var(--status-info-text);
    --toastify-color-progress-light: var(--brand);
    --toastify-toast-bd-radius: var(--radius-md);
  }

  .Toastify__toast {
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-lg);
    font-size: var(--text-sm);
  }

  ${media.sm} {
    .Toastify__toast-container {
      padding: max(8px, env(safe-area-inset-top)) 8px 0;
    }
  }

  /* ── Movimento reduzido — WCAG 2.3.3 ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
