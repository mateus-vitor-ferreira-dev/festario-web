/**
 * @module utils/reservationFormat
 * @description Utilitários de formatação usados em reservas: datas, horários, moeda e planos.
 */

/**
 * Mapa de códigos de plano para rótulos exibíveis em pt-BR.
 * @type {Record<"PROMOCIONAL" | "ESSENCIAL" | "COMPLETA", string>}
 */
export const PLAN_LABELS = {
    PROMOCIONAL: "Promocional",
    ESSENCIAL: "Essencial",
    COMPLETA: "Completa",
};

/**
 * Formata uma data para o padrão curto brasileiro: `DD/MM/AAAA`.
 * @param {string | Date} date
 * @returns {string}
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR");
}

/**
 * Formata uma data por extenso com dia da semana: ex. `"sábado, 19 de abril de 2026"`.
 * @param {string | Date} date
 * @returns {string}
 */
export function formatDateFull(date) {
    return new Date(date).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

/**
 * Formata hora no padrão `HH:MM`.
 * @param {string | Date} date
 * @returns {string}
 */
export function formatTime(date) {
    return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Formata um número como moeda brasileira: ex. `"R$ 1.500,00"`.
 * @param {number | string} value - Valor em reais (não centavos)
 * @returns {string}
 */
export function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Formata um valor em centavos como moeda brasileira: ex. `"R$ 650,00"`.
 * @param {number | string} cents - Valor em centavos
 * @returns {string}
 */
export function formatCents(cents) {
    return formatCurrency(Number(cents || 0) / 100);
}

/**
 * Calcula a duração em horas entre duas datas.
 * @param {string | Date} startDate
 * @param {string | Date} endDate
 * @returns {number} Duração arredondada em horas inteiras
 */
export function calcDuration(startDate, endDate) {
    const diffMs = new Date(endDate) - new Date(startDate);
    return Math.round(diffMs / (1000 * 60 * 60));
}
