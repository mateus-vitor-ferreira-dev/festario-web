export function isAbortError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return error.name === "AbortError" || error.name === "CanceledError";
}

export function getHttpStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;
    const e = error as Record<string, unknown>;
    const response = e.response;
    if (!response || typeof response !== "object") return undefined;
    const status = (response as Record<string, unknown>).status;
    return typeof status === "number" ? status : undefined;
}

/** Código de erro da API (`{ error: { code } }`), quando houver. */
export function getApiErrorCode(error: unknown): string | undefined {
    const e = error as { response?: { data?: { error?: { code?: unknown }; code?: unknown } } } | null;
    const code = e?.response?.data?.error?.code ?? e?.response?.data?.code;
    return typeof code === "string" ? code : undefined;
}
