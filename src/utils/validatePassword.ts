/**
 * Valida a força da senha conforme as regras do backend.
 *
 * @param {string} password
 * @returns {string | null} Mensagem de erro em pt-BR, ou null se válida
 */
export function validatePassword(password: string) {
    if (password.length < 8) {
        return "A senha deve ter pelo menos 8 caracteres.";
    }

    if (!/[A-Z]/.test(password)) {
        return "A senha deve conter pelo menos 1 letra maiúscula.";
    }

    if (!/[0-9]/.test(password)) {
        return "A senha deve conter pelo menos 1 número.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;']/.test(password)) {
        return "A senha deve conter pelo menos 1 caractere especial.";
    }

    return null;
}

/** As mesmas regras de `validatePassword`, para mostrar o progresso enquanto a pessoa digita. */
export const PASSWORD_RULES: ReadonlyArray<{ label: string; test: (password: string) => boolean }> = [
    { label: "8 caracteres ou mais", test: (p) => p.length >= 8 },
    { label: "1 letra maiúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "1 número", test: (p) => /[0-9]/.test(p) },
    { label: "1 caractere especial (!@#…)", test: (p) => /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;']/.test(p) },
];
