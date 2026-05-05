import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root, [data-theme="light"] {
    --bg-page:    #f9fafb;
    --bg-surface: #ffffff;
    --bg-muted:   #f3f4f6;

    --text-primary:   #111827;
    --text-secondary: #374151;
    --text-muted:     #6b7280;
    --text-faint:     #9ca3af;
    --text-medium:    #4b5563;

    --border-default: #e5e7eb;
    --border-medium:  #d1d5db;

    --brand:        #1f4f41;
    --brand-dark:   #133428;
    --brand-subtle: #f0fdf9;
    --brand-border: #d1fae5;

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

    --accent-green: #16a34a;
    --accent-olive: #2563eb;
    --accent-teal:  #0d9488;
    --accent-gold:  #c9a84c;
  }

  [data-theme="dark"] {
    --bg-page:    #0f172a;
    --bg-surface: #1e293b;
    --bg-muted:   #334155;

    --text-primary:   #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted:     #94a3b8;
    --text-faint:     #64748b;
    --text-medium:    #94a3b8;

    --border-default: #334155;
    --border-medium:  #475569;

    --brand:        #34d399;
    --brand-dark:   #059669;
    --brand-subtle: #022c22;
    --brand-border: #065f46;

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

    --accent-green: #34d399;
    --accent-olive: #60a5fa;
    --accent-teal:  #2dd4bf;
    --accent-gold:  #fbbf24;
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
    font-family: Inter, sans-serif;
    background: var(--bg-page);
    color: var(--text-primary);
    transition: background 0.2s ease, color 0.2s ease;
  }

  button, input {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;
