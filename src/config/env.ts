export const env = {
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? "",
    mode: import.meta.env.MODE,
    isTest: import.meta.env.MODE === "test" || Boolean((import.meta.env as Record<string, unknown>).VITEST),
} as const;
