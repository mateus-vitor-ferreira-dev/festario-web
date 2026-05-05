/**
 * @module utils/translateApiMessage
 * @description Mapa estático de mensagens de erro da API (inglês → português) e
 * função de tradução. Utilizada por `getErrorMessage` antes de exibir erros ao usuário.
 */

/** @type {Record<string, string>} */
const messageMap = {
    "Past dates are not allowed": "Não é permitido selecionar datas passadas.",
    "Venue not found": "Salão não encontrado.",
    "Reservation not found": "Reserva não encontrada.",
    "Payment not found": "Pagamento não encontrado.",
    "Payment not found for this reservation": "Pagamento não encontrado para esta reserva.",
    "Reservation ID not found in session metadata": "ID da reserva não encontrado na sessão de pagamento.",
    "Reservation not found in webhook processing": "Reserva não encontrada no processamento do webhook.",
    "Authenticated user not found": "Usuário autenticado não encontrado.",
    "Token structure is invalid": "Estrutura do token inválida.",
    "Internal server error": "Erro interno do servidor.",
    "Record not found": "Registro não encontrado.",
    "Missing required fields": "Preencha os campos obrigatórios.",
    "Reservation id not returned": "Não foi possível obter o identificador da reserva.",
    "This action is not allowed for a finalized reservation":
        "Esta ação não é permitida para uma reserva finalizada.",
    "Authentication error": "Erro de autenticação.",
    "Resource not found": "Recurso não encontrado.",
    "Database error": "Erro no banco de dados.",
    "Unexpected database error": "Erro inesperado no banco de dados.",
    "Origin not allowed by CORS": "Origem não permitida.",
    "Email and password are required": "E-mail e senha são obrigatórios.",
    "Google access token is required": "O token de acesso do Google é obrigatório.",
    "User not found": "Usuário não encontrado.",
    "Blocked date not found": "Data bloqueada não encontrada.",
    "Kids area price is required": "O valor da área kids é obrigatório.",
    "Pool price is required": "O valor da piscina é obrigatório.",
    "Invalid or expired password reset token": "Link de redefinição inválido ou expirado. Solicite um novo.",
    "Too many contact messages, please try again later": "Muitas mensagens enviadas. Tente novamente mais tarde.",
    "Too many authentication attempts, please try again later": "Muitas tentativas. Tente novamente em instantes.",
    "Invalid or expired verification token": "Link de verificação inválido ou expirado. Solicite um novo.",
    "Email is already verified": "Seu e-mail já está verificado.",
    "Current password is required to change the password": "Informe a senha atual para alterá-la.",
    "Current password is incorrect": "Senha atual incorreta.",
};

/**
 * Traduz uma mensagem de erro da API para pt-BR quando existe entrada no mapa.
 * Retorna a própria mensagem original quando não há tradução disponível.
 *
 * @param {string | null | undefined} message - Mensagem recebida da API
 * @returns {string} Mensagem em pt-BR ou a original
 */
export function translateApiMessage(message: string): string {
    if (!message) return "Ocorreu um erro inesperado.";

    return (messageMap as Record<string, string>)[message] || message;
}