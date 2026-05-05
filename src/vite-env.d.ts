/// <reference types="vite/client" />

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
