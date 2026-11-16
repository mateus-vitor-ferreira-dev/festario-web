import * as Sentry from "@sentry/react";
import { env } from "./env";
import { getHttpStatus } from "../utils/errors";
import type { User } from "../types";

const dsn = env.sentryDsn;

/** Parâmetros de URL que carregam segredo: o token da troca de senha, da verificação de e-mail e do convite. */
const SECRET_PARAMS = /([?&](?:token|code|hmac|refreshToken|access_token)=)[^&#]*/gi;

/** Rotas com segredo no próprio caminho: o link do convite do dono. */
const SECRET_PATHS = /(\/convite\/)[^/?#]+/gi;

/** A URL sem o valor dos segredos (o nome do parâmetro fica, para o erro continuar legível). */
export function scrubUrl(url: string): string {
    return url.replace(SECRET_PARAMS, "$1[removido]").replace(SECRET_PATHS, "$1[removido]");
}
const mode = env.mode;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: mode,
    // Sem IP, cookies nem dados do usuário além do ID definido em setUserContext
    sendDefaultPii: false,
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
        delete event.request.cookies;
        if (event.request.url) event.request.url = scrubUrl(event.request.url);
        if (typeof event.request.query_string === "string") event.request.query_string = scrubUrl(`?${event.request.query_string}`).slice(1);
        else delete event.request.query_string;
      }

      return event;
    },
    // A navegação e as chamadas à API ficam no rastro do erro: tira o token das URLs ali também.
    beforeBreadcrumb(breadcrumb) {
      const data = breadcrumb.data;
      if (data) {
        for (const key of ["url", "from", "to"] as const) {
          if (typeof data[key] === "string") data[key] = scrubUrl(data[key]);
        }
      }
      if (typeof breadcrumb.message === "string") breadcrumb.message = scrubUrl(breadcrumb.message);
      return breadcrumb;
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
