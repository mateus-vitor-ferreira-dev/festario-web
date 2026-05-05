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
    /* ── Backgrounds (dark green — premium, on-brand) ── */
    --bg-page:    #0c1a14;
    --bg-surface: #152a1f;
    --bg-muted:   #1e3828;

    /* ── Text ── */
    --text-primary:   #e5f0eb;
    --text-secondary: #b0ccbe;
    --text-muted:     #6fa090;
    --text-faint:     #3d6a58;
    --text-medium:    #8abfac;

    /* ── Borders ── */
    --border-default: #1e3828;
    --border-medium:  #2a4a38;

    /* ── Brand — same family as light, just brighter ── */
    --brand:        #52c4a0;
    --brand-mid:    #3da886;
    --brand-dark:   #2d8a6a;
    --brand-subtle: #0a1f17;
    --brand-border: #134830;

    /* ── Gold ── */
    --gold:        #ddb85a;
    --gold-dark:   #c9a84c;
    --gold-subtle: #150f00;
    --gold-border: #3d2800;

    /* ── Status ── */
    --status-paid-bg:     #052e16;
    --status-paid-text:   #86efac;
    --status-paid-border: #166534;

    --status-pending-bg:        #1c1400;
    --status-pending-text:      #fcd34d;
    --status-pending-text-deep: #fbbf24;
    --status-pending-border:    #713f12;

    --status-error-bg:    #1c0a0a;
    --status-error-text:  #fca5a5;
    --status-error-border:#7f1d1d;
    --status-error-hover: #200c0c;

    --status-info-bg:     #0c1a3a;
    --status-info-text:   #93c5fd;
    --status-info-border: #1e3a5f;

    --status-success-text: #4ade80;
    --color-error: #f87171;

    /* ── Accents ── */
    --accent-blue: #60a5fa;
    --accent-teal: #2dd4bf;

    /* ── Shadows ── */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.30), 0 1px 2px rgba(0, 0, 0, 0.18);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.22);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.40), 0 4px 8px rgba(0, 0, 0, 0.25);

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
