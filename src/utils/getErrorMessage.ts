/**
 * @module utils/getErrorMessage
 * @description Extrai a mensagem de erro de uma resposta Axios e a traduz para pt-BR.
 * Sonda as localizações típicas do envelope da API antes de cair no fallback.
 */
import { translateApiMessage } from "./translateApiMessage";
import { getApiErrorCode } from "./errors";

/**
 * Mensagens por código de erro (papéis, espaços e convites). Têm prioridade sobre
 * a mensagem da API porque dizem o que fazer em seguida.
 */
export const API_ERROR_CODE_MESSAGES: Record<string, string> = {
    TENANT_ACCESS_DENIED: "Sua conta pertence a outro espaço. Entre pelo link do seu espaço.",
    TENANT_INACTIVE: "Este espaço está desativado no momento. Fale com a equipe da plataforma para reativá-lo.",
    TENANT_NOT_FOUND: "Espaço não encontrado. Confira o endereço do link de acesso.",
    TENANT_SLUG_IN_USE: "Já existe um estabelecimento com esse endereço. Escolha outro.",
    INVITE_NOT_FOUND: "Convite não encontrado. Confira o link ou peça um novo convite.",
    INVITE_EXPIRED: "Este convite venceu. Peça um novo convite à equipe da plataforma.",
    INVITE_REVOKED: "Este convite foi cancelado. Peça um novo convite à equipe da plataforma.",
    INVITE_ALREADY_ACCEPTED: "Este convite já foi aceito. Entre com o e-mail e a senha cadastrados.",
    EMAIL_ALREADY_IN_USE: "Este e-mail já tem uma conta.",
};

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
    const code = getApiErrorCode(error);
    if (code && API_ERROR_CODE_MESSAGES[code]) return API_ERROR_CODE_MESSAGES[code];

    const e = error as { response?: { data?: { message?: string; error?: { message?: string } } }; message?: string } | null;
    const rawMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        fallback;

    return translateApiMessage(rawMessage);
}
/**
 * Mensagem para falhas de carregamento de dados: distingue falta de conexão e
 * erro do servidor (5xx) antes de usar a mensagem da API.
 */
export function getLoadErrorMessage(error: unknown, fallback: string): string {
    const e = error as { response?: { status: number } } | null;
    if (!e?.response) return "Sem conexão com o servidor. Verifique sua internet.";
    if (e.response.status >= 500) return "Erro interno do servidor. Tente novamente em instantes.";
    return getErrorMessage(error, fallback);
}
