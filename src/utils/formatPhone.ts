/**
 * @module utils/formatPhone
 * @description Formatação de telefone brasileiro para exibição e input mascarado.
 */

/**
 * Formata um número de telefone brasileiro enquanto o usuário digita.
 * Suporta celular (11 dígitos): `(XX) XXXXX-XXXX`
 * e fixo (10 dígitos): `(XX) XXXX-XXXX`.
 *
 * @param {string | number | null | undefined} value - Valor bruto (dígitos ou formatado)
 * @returns {string} Telefone formatado ou string vazia se vazio
 */
export function formatPhone(value: string): string {
    const digits = String(value ?? "").replace(/\D/g, "").slice(0, 11);
    const len = digits.length;

    if (len === 0) return "";
    if (len <= 2) return `(${digits}`;
    if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
