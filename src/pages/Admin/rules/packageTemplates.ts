import type { SalonPackage } from "../../../types";

/**
 * Modelos para o dono não começar do zero: só dias, horário e duração, com nomes neutros. O preço fica
 * em branco de propósito — o valor é sempre do salão — e o dono confere tudo antes de salvar.
 */
export interface PackageTemplate {
    key: string;
    title: string;
    /** Uma linha do que o modelo traz, para escolher sem abrir. */
    summary: string;
    values: Pick<SalonPackage, "name" | "description" | "validWeekdays" | "validOnHolidays" | "earliestStartMinute" | "latestEndMinute" | "minDurationMinutes" | "maxDurationMinutes">;
}

const h = (hours: number) => hours * 60;

export const PACKAGE_TEMPLATES: PackageTemplate[] = [
    {
        key: "half-day",
        title: "Meio período",
        summary: "Qualquer dia, de 4 a 5 horas entre 10h e 23h",
        values: {
            name: "Meio período", description: "Festa de até 5 horas, em qualquer dia da semana.",
            validWeekdays: null, validOnHolidays: true,
            earliestStartMinute: h(10), latestEndMinute: h(23), minDurationMinutes: h(4), maxDurationMinutes: h(5),
        },
    },
    {
        key: "full-day",
        title: "Dia inteiro",
        summary: "Qualquer dia, de 8 a 13 horas entre 9h e 22h",
        values: {
            name: "Dia inteiro", description: "O espaço o dia todo, para festas longas e encontros de família.",
            validWeekdays: null, validOnHolidays: true,
            earliestStartMinute: h(9), latestEndMinute: h(22), minDurationMinutes: h(8), maxDurationMinutes: h(13),
        },
    },
    {
        key: "kids-weekend",
        title: "Festa infantil de fim de semana",
        summary: "Sábado, domingo e feriado, 4 horas entre 13h e 20h",
        values: {
            name: "Festa infantil", description: "Aniversário infantil de 4 horas no fim de semana.",
            validWeekdays: [6, 0], validOnHolidays: true,
            earliestStartMinute: h(13), latestEndMinute: h(20), minDurationMinutes: h(4), maxDurationMinutes: h(4),
        },
    },
    {
        key: "night",
        title: "Noite de sexta e sábado",
        summary: "Sexta e sábado, de 5 a 7 horas entre 19h e 2h",
        values: {
            name: "Noite", description: "Festa à noite, que pode passar da meia-noite.",
            validWeekdays: [5, 6], validOnHolidays: false,
            earliestStartMinute: h(19), latestEndMinute: h(26), minDurationMinutes: h(5), maxDurationMinutes: h(7),
        },
    },
];
