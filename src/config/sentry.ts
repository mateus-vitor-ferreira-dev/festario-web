import * as Sentry from "@sentry/react";
import { env } from "./env";
import { getHttpStatus } from "../utils/errors";
import type { User } from "../types";

const dsn = env.sentryDsn;
const mode = env.mode;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: mode,
    // Rastrear 10% das sessões em produção para performance
    tracesSampleRate: mode === "production" ? 0.1 : 0,
    // Não capturar erros de rede esperados (4xx)
    beforeSend(event, hint) {
      const status = getHttpStatus(hint?.originalException);
      if (status !== undefined && status < 500) return null;
      return event;
    },
  });
}

export function setUserContext(user: User | null): void {
  if (!dsn) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
