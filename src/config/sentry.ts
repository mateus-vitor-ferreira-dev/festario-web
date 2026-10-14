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

      // Remover dados que podem conter PII ou tokens de autenticação
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["authorization"];
        delete event.request.headers["Cookie"];
        delete event.request.headers["cookie"];
      }
      if (event.request) {
        delete event.request.data; // body pode conter senhas/tokens
      }

      return event;
    },
  });
}

export function setUserContext(user: User | null): void {
  if (!dsn) return;
  if (user) {
    // Nunca enviar PII (email, nome) ao Sentry — apenas o ID anônimo
    Sentry.setUser({ id: user.id });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
