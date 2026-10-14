/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: Record<string, unknown>) => void;
        renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        prompt: () => void;
      };
    };
  };
}
