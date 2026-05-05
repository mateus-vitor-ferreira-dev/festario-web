import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root, [data-theme="light"] {
    /* ── Backgrounds (warm green temperature) ── */
    --bg-page:    #f5f9f7;
    --bg-surface: #ffffff;
    --bg-muted:   #edf3f0;

    /* ── Text (green-temperature neutrals) ── */
    --text-primary:   #0e1c15;
    --text-secondary: #2d3d35;
    --text-muted:     #5a7068;
    --text-faint:     #8aa99e;
    --text-medium:    #3d5549;

    /* ── Borders ── */
    --border-default: #dce8e3;
    --border-medium:  #c4d4ce;

    /* ── Brand — forest green scale ── */
    --brand:        #1f4f41;
    --brand-mid:    #2d6a57;
    --brand-dark:   #133428;
    --brand-subtle: #eef7f3;
    --brand-border: #bde3d5;

    /* ── Gold — second accent, full scale ── */
    --gold:        #c9a84c;
    --gold-dark:   #a07c2a;
    --gold-subtle: #fdf7e8;
    --gold-border: #f0dfa0;

    /* ── Status ── */
    --status-paid-bg:     #ecfdf3;
    --status-paid-text:   #166534;
    --status-paid-border: #bbf7d0;

    --status-pending-bg:        #fffbeb;
    --status-pending-text:      #b45309;
    --status-pending-text-deep: #92400e;
    --status-pending-border:    #fde68a;

    --status-error-bg:    #fef2f2;
    --status-error-text:  #b91c1c;
    --status-error-border:#fecaca;
    --status-error-hover: #fee2e2;

    --status-info-bg:     #eff6ff;
    --status-info-text:   #1d4ed8;
    --status-info-border: #bfdbfe;

    --status-success-text: #16a34a;
    --color-error: #ef4444;

    /* ── Status cancelled ── */
    --status-cancelled-bg:     #fef2f2;
    --status-cancelled-text:   #b91c1c;
    --status-cancelled-border: #fecaca;

    /* ── Calendário — datas ocupadas e bloqueadas ── */
    --calendar-occupied-bg:     #7c2d12;
    --calendar-occupied-text:   #fdba74;
    --calendar-occupied-border: #9a3412;
    --calendar-blocked-bg:      #4c1d95;
    --calendar-blocked-text:    #c4b5fd;
    --calendar-blocked-border:  #6d28d9;

    /* ── Accents (apenas os que são usados) ── */
    --accent-blue: #2563eb;
    --accent-teal: #0d9488;

    /* ── Shadows ── */
    --shadow-sm: 0 1px 3px rgba(14, 28, 21, 0.08), 0 1px 2px rgba(14, 28, 21, 0.05);
    --shadow-md: 0 4px 12px rgba(14, 28, 21, 0.10), 0 2px 4px rgba(14, 28, 21, 0.06);
    --shadow-lg: 0 8px 24px rgba(14, 28, 21, 0.12), 0 4px 8px rgba(14, 28, 21, 0.06);

    /* ── Radius ── */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
  }

  [data-theme="dark"] {
    /* ── Backgrounds — neutral dark (WhatsApp / Instagram / Android style)
       Sem tinte verde: a marca aparece só nos acentos, não no fundo. ── */
    --bg-page:    #111111;
    --bg-surface: #1c1c1c;
    --bg-muted:   #272727;

    /* ── Text — off-white hierárquico ── */
    --text-primary:   #e8e8e8;
    --text-secondary: #a0a0a0;
    --text-muted:     #666666;
    --text-faint:     #3a3a3a;
    --text-medium:    #c0c0c0;

    /* ── Borders — sutis, quase invisíveis ── */
    --border-default: #2c2c2c;
    --border-medium:  #383838;

    /* ── Brand — verde como ACENTO, nunca como fundo ── */
    --brand:        #3ecf8e;
    --brand-mid:    #2db87a;
    --brand-dark:   #1da066;
    --brand-subtle: #0d1f15;
    --brand-border: #163d26;

    /* ── Gold ── */
    --gold:        #f0c040;
    --gold-dark:   #d4a020;
    --gold-subtle: #1a1200;
    --gold-border: #3d2c00;

    /* ── Status ── */
    --status-paid-bg:     #0a2018;
    --status-paid-text:   #4ade80;
    --status-paid-border: #15803d;

    --status-pending-bg:        #1a1000;
    --status-pending-text:      #fbbf24;
    --status-pending-text-deep: #f59e0b;
    --status-pending-border:    #78350f;

    --status-error-bg:    #1a0808;
    --status-error-text:  #f87171;
    --status-error-border:#7f1d1d;
    --status-error-hover: #220c0c;

    --status-info-bg:     #080f1c;
    --status-info-text:   #93c5fd;
    --status-info-border: #1e3a5f;

    --status-success-text: #4ade80;
    --color-error: #f87171;

    /* ── Status cancelled ── */
    --status-cancelled-bg:     #1a0808;
    --status-cancelled-text:   #f87171;
    --status-cancelled-border: #7f1d1d;

    /* ── Calendário — datas ocupadas e bloqueadas ── */
    --calendar-occupied-bg:     #7c2d12;
    --calendar-occupied-text:   #fdba74;
    --calendar-occupied-border: #9a3412;
    --calendar-blocked-bg:      #3b0764;
    --calendar-blocked-text:    #d8b4fe;
    --calendar-blocked-border:  #6d28d9;

    /* ── Accents ── */
    --accent-blue: #60a5fa;
    --accent-teal: #2dd4bf;

    /* ── Shadows — mais pesadas no escuro para dar profundidade ── */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.35);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.65), 0 2px 4px rgba(0, 0, 0, 0.45);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.75), 0 4px 8px rgba(0, 0, 0, 0.55);

    /* ── Radius ── */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
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
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background: var(--bg-page);
    color: var(--text-primary);
    transition: background 0.2s ease, color 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button, input, textarea, select {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;
