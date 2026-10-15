import { createGlobalStyle } from "styled-components";
import { media } from "./breakpoints";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* ── Tipografia — superfamília Alegreya ("convite") ──
       Display: títulos, datas, preços. Sans: toda a interface. */
    --font-display: "Alegreya", Georgia, "Times New Roman", serif;
    --font-sans:    "Alegreya Sans", system-ui, -apple-system, "Segoe UI", sans-serif;

    /* Escala clássica (Bringhurst): 13 · 15 · 16 · 20 · 24 · 30 · 38 · 48.
       --text-2xs (12px) é o piso para micro-rótulos — nada menor que isso. */
    --text-2xs:  12px;
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

    /* ── Tamanhos de controle e ícone (alvo de toque >= 44px, WCAG 2.5.8) ── */
    --control-h: 48px;
    --icon-sm: 16px;
    --icon-md: 20px;
    --icon-lg: 24px;

    /* Largura máxima do conteúdo das páginas */
    --content-max: 1200px;
  }

  /* ── Telas grandes: um degrau a mais na escala para continuar fácil de ler ── */
  @media (min-width: 1600px) {
    :root {
      --text-2xs:  13px;
      --text-xs:   14px;
      --text-sm:   16px;
      --text-base: 17px;
      --text-lg:   21px;
      --text-xl:   26px;
      --text-2xl:  32px;
      --text-3xl:  42px;
      --text-4xl:  52px;
      --control-h: 52px;
      --icon-md:   22px;
      --icon-lg:   26px;
      --content-max: 1320px;
    }
  }

  @media (min-width: 1920px) {
    :root {
      --text-2xs:  14px;
      --text-xs:   15px;
      --text-sm:   17px;
      --text-base: 18px;
      --text-lg:   22px;
      --text-xl:   28px;
      --text-2xl:  34px;
      --text-3xl:  46px;
      --text-4xl:  56px;
      --control-h: 56px;
      --icon-md:   24px;
      --icon-lg:   28px;
      --content-max: 1440px;
    }
  }

  /* Paleta Festário (docs/marca/tokens.css): anil, milho e pitanga.
     Os pares de texto e fundo passam em AA nos dois temas. Milho é só decorativo
     sobre fundo claro (1,84:1): texto em ouro usa --gold-text. */
  :root, [data-theme="light"] {
    /* ── Fundos — névoa e papel ── */
    --bg-page:    #f5f6fb;
    --bg-surface: #ffffff;
    --bg-muted:   #ebedf6;

    /* ── Texto — anil escuro e grafite ── */
    --text-primary:   #141936;
    --text-secondary: #2b3152;
    --text-muted:     #5a6079;
    --text-faint:     #5f6580;
    --text-medium:    #3d4363;

    /* ── Bordas ── */
    --border-default: #dfe2ee;
    --border-medium:  #c5c9dc;

    /* ── Marca — anil ── */
    --brand:        #27357e;
    --brand-mid:    #34449a;
    --brand-dark:   #1c275f;
    --brand-subtle: #eceefa;
    --brand-border: #c2c8ec;
    --on-brand:     #ffffff;

    /* ── Milho — decorativo; --gold-text (ocre) para texto sobre claro ── */
    --gold:        #f4b41a;
    --gold-dark:   #d4960a;
    --gold-text:   #7f5600;
    --gold-subtle: #fdf4dc;
    --gold-border: #f2d68c;

    /* ── Pitanga — celebração (bandeirinha central) ── */
    --festive:      #d8344a;

    /* ── Status ── */
    --status-paid-bg:     #e8f5ec;
    --status-paid-text:   #1b6334;
    --status-paid-border: #b6dcc1;

    --status-pending-bg:        #fcf2df;
    --status-pending-text:      #8a5605;
    --status-pending-text-deep: #714604;
    --status-pending-border:    #ebd197;

    --status-error-bg:    #fcecef;
    --status-error-text:  #b8233a;
    --status-error-border:#f2c3cb;
    --status-error-hover: #f8dde2;

    --status-info-bg:     #e8f1f8;
    --status-info-text:   #1d5a86;
    --status-info-border: #bfd6e8;

    --status-success-text: #1b7341;
    --color-error: #b8233a;

    --status-cancelled-bg:     #fcecef;
    --status-cancelled-text:   #b8233a;
    --status-cancelled-border: #f2c3cb;

    /* ── Calendário — ocupado (pitanga profunda) e bloqueado (grafite) ── */
    --calendar-occupied-bg:     #8e2236;
    --calendar-occupied-text:   #fde3e7;
    --calendar-occupied-border: #a62c42;
    --calendar-blocked-bg:      #474c66;
    --calendar-blocked-text:    #e6e8f2;
    --calendar-blocked-border:  #5b6180;

    /* ── Acentos de apoio (gráficos/indicadores) ── */
    --accent-blue: #2d5fa0;
    --accent-teal: #217a6c;

    /* ── Marca (logotipo inline): corpo, check e nome ── */
    --logo-body:  #27357e;
    --logo-check: #ffffff;
    --logo-ink:   #141936;

    /* ── Elevação — só para o que flutua (menus, modais, chat) ── */
    --shadow-sm: 0 1px 2px rgba(20, 25, 54, 0.06);
    --shadow-md: 0 6px 16px -4px rgba(20, 25, 54, 0.12), 0 2px 4px rgba(20, 25, 54, 0.05);
    --shadow-lg: 0 18px 40px -12px rgba(20, 25, 54, 0.22), 0 4px 10px rgba(20, 25, 54, 0.06);
    --focus-ring: 0 0 0 3px rgba(39, 53, 126, 0.24);
    --overlay: rgba(15, 19, 48, 0.55);

    /* Cor do salão (vem da API): só acento — selo, filete da capa. Sem cor própria, é o anil da marca. */
    --salon-accent: var(--salon-color, var(--brand));
  }

  [data-theme="dark"] {
    --salon-accent: var(--salon-color-dark, var(--brand-mid));
    /* ── Noite — anil profundo, nunca preto neutro ── */
    --bg-page:    #0f1330;
    --bg-surface: #1a1f45;
    --bg-muted:   #242a56;

    --text-primary:   #f5f6fb;
    --text-secondary: #dcdff0;
    --text-muted:     #b4b9d8;
    --text-faint:     #a3a9cc;
    --text-medium:    #c9cde6;

    --border-default: #2a3060;
    --border-medium:  #3a4178;

    --brand:        #9aa8f2;
    --brand-mid:    #adb8f5;
    --brand-dark:   #c3cbf8;
    --brand-subtle: #222a5c;
    --brand-border: #3c4687;
    --on-brand:     #0f1330;

    --gold:        #f4b41a;
    --gold-dark:   #f7c548;
    --gold-text:   #f6c650;
    --gold-subtle: #2a2734;
    --gold-border: #5c4c22;

    --festive:      #e8566a;

    --status-paid-bg:     #12301f;
    --status-paid-text:   #8fd8a8;
    --status-paid-border: #285c3a;

    --status-pending-bg:        #2e2614;
    --status-pending-text:      #f0c56e;
    --status-pending-text-deep: #e6b14d;
    --status-pending-border:    #5a4520;

    --status-error-bg:    #3a1823;
    --status-error-text:  #ffa3b1;
    --status-error-border:#6a2a39;
    --status-error-hover: #45202b;

    --status-info-bg:     #13284a;
    --status-info-text:   #9ccbee;
    --status-info-border: #2a4a70;

    --status-success-text: #8fd8a8;
    --color-error: #ffa3b1;

    --status-cancelled-bg:     #3a1823;
    --status-cancelled-text:   #ffa3b1;
    --status-cancelled-border: #6a2a39;

    --calendar-occupied-bg:     #6e1b2b;
    --calendar-occupied-text:   #fdd5dc;
    --calendar-occupied-border: #8e2236;
    --calendar-blocked-bg:      #3a3f5c;
    --calendar-blocked-text:    #e2e5f3;
    --calendar-blocked-border:  #50567a;

    --accent-blue: #94b8ea;
    --accent-teal: #79c4b3;

    --logo-body:  #f5f6fb;
    --logo-check: #27357e;
    --logo-ink:   #f5f6fb;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 6px 16px -4px rgba(0, 0, 0, 0.55), 0 2px 4px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 18px 40px -12px rgba(0, 0, 0, 0.7), 0 4px 10px rgba(0, 0, 0, 0.35);
    --focus-ring: 0 0 0 3px rgba(154, 168, 242, 0.35);
    --overlay: rgba(5, 7, 20, 0.65);
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
