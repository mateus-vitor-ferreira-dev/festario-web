/**
 * @module utils/getErrorMessage
 * @description Extrai a mensagem de erro de uma resposta Axios e a traduz para pt-BR.
 * Sonda as localizações típicas do envelope da API antes de cair no fallback.
 */
import { translateApiMessage } from "./translateApiMessage";

/**
 * Retorna uma mensagem de erro legível pelo usuário a partir de um erro Axios.
 * Ordem de sondagem: `response.data.message` → `response.data.error.message` →
 * `error.message` → `fallback`.
 *
 * @param {unknown} error - Erro capturado em um bloco catch
 * @param {string} [fallback="Ocorreu um erro inesperado."] - Texto exibido quando nenhuma mensagem é encontrada
 * @returns {string} Mensagem traduzida para pt-BR
 */
export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
    const e = error as { response?: { data?: { message?: string; error?: { message?: string } } }; message?: string } | null;
    const rawMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        fallback;

    return translateApiMessage(rawMessage);
}