/**
 * @module services/auth
 * @description Funções para o fluxo de recuperação de senha.
 */
import api from "./api";

/**
 * Solicita o envio de um e-mail com link de redefinição de senha.
 * Sempre retorna sucesso — o backend não revela se o e-mail existe.
 *
 * @see POST /auth/forgot-password
 */
export async function forgotPassword(
    email: string,
): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
}

/**
 * Redefine a senha usando o token recebido por e-mail.
 *
 * @see POST /auth/reset-password
 * @param token - Token do link de redefinição (query param `?token=`)
 * @param password - Nova senha (mín. 8 chars, maiúscula, número e especial)
 */
export async function resetPassword(
    token: string,
    password: string,
): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data;
}

/**
 * Reenvia o e-mail de verificação para o usuário autenticado.
 * Requer JWT válido no header Authorization.
 *
 * @see POST /auth/resend-verification
 */
export async function resendVerification(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/auth/resend-verification");
    return data;
}

/**
 * Verifica se a senha atual do usuário autenticado está correta.
 * Lança erro 401 se a senha estiver incorreta.
 *
 * @see POST /users/me/verify-password
 */
export async function verifyCurrentPassword(
    currentPassword: string,
): Promise<void> {
    await api.post("/users/me/verify-password", { currentPassword });
}
