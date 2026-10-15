/**
 * @module utils/reservationFormat
 * @description Utilitários de formatação usados em reservas: datas, horários, moeda e pacote.
 */

/**
 * Nome do pacote contratado: a cópia gravada na reserva (#42) ou, em reserva antiga, o código
 * ("SABADO_TARDE" → "Sabado tarde").
 */
export function packageLabel(reservation: { packageSnapshot?: { name?: string } | null; planCode?: string | null }): string {
    const name = reservation.packageSnapshot?.name;
    if (name) return name;
    const code = reservation.planCode;
    return code ? (code.charAt(0) + code.slice(1).toLowerCase()).replace(/_/g, " ") : "—";
}

/**
 * Formata uma data para o padrão curto brasileiro: `DD/MM/AAAA`.
 * @param {string | Date} date
 * @returns {string}
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("pt-BR");
}

/**
 * Formata uma data por extenso com dia da semana: ex. `"sábado, 19 de abril de 2026"`.
 * @param {string | Date} date
 * @returns {string}
 */
export function formatDateFull(date: string | Date): string {
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
export function formatTime(date: string | Date): string {
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
export function formatCurrency(value: number | string): string {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Formata um valor em centavos como moeda brasileira: ex. `"R$ 1.234,56"`.
 * @param {number | string} cents - Valor em centavos
 * @returns {string}
 */
export function formatCents(cents: number | string): string {
    return formatCurrency(Number(cents || 0) / 100);
}

/**
 * Calcula a duração em horas entre duas datas.
 * @param {string | Date} startDate
 * @param {string | Date} endDate
 * @returns {number} Duração arredondada em horas inteiras
 */
export function calcDuration(startDate: string | Date, endDate: string | Date): number {
    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
}
