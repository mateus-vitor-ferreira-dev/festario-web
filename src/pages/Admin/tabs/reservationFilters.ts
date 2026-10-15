/**
 * Configuração dos filtros da aba Reservas do admin.
 *
 * Para adicionar um filtro novo (ex.: `city`, já reservado no contrato da API):
 *   1. inclua a chave em `RESERVATION_FILTER_KEYS`;
 *   2. descreva o chip em `describeReservationChip`;
 *   3. renderize o campo na `FilterBar` do `ReservationsTab`.
 * A sincronização com a URL, o envio à API e o contador "Filtros (n)" vêm de graça.
 */
import type { SelectOption } from "../../../components/FilterBar";
import { STATUS_OPTIONS } from "./constants";

export const RESERVATION_FILTER_KEYS = [
    "q",
    "status",
    "venueId",
    "packageId",
    "startDate",
    "endDate",
    "minPrice",
    "maxPrice",
    "sort",
] as const;

export type ReservationFilterKey = (typeof RESERVATION_FILTER_KEYS)[number];

export const DEFAULT_RESERVATION_SORT = "startDate:desc";

export const RESERVATION_FILTER_DEFAULTS = { sort: DEFAULT_RESERVATION_SORT } as const;

/** `sort` muda a ordem, não o conjunto — não conta como filtro ativo. */
export const RESERVATION_NON_FILTER_KEYS = ["sort"] as const;

export const RESERVATION_STATUS_OPTIONS: SelectOption[] = STATUS_OPTIONS;

/** As opções de pacote vêm do salão (GET /admin/plans); esta é a primeira, sem filtro. */
export const ALL_PACKAGES_OPTION: SelectOption = { value: "", label: "Todos os pacotes" };

export const SORT_OPTIONS: SelectOption[] = [
    { value: "startDate:desc", label: "Evento mais recente" },
    { value: "startDate:asc", label: "Evento mais antigo" },
    { value: "totalPrice:desc", label: "Maior valor" },
    { value: "totalPrice:asc", label: "Menor valor" },
    { value: "createdAt:desc", label: "Criada por último" },
];

const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return y && m && d ? `${d}/${m}/${y}` : iso;
};

const fmtMoney = (v: string) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

/** Texto do chip de um filtro ativo, ex.: "Status: Pago". */
export function describeReservationChip(
    key: ReservationFilterKey,
    values: Record<ReservationFilterKey, string>,
    venueOptions: SelectOption[],
    packageOptions: SelectOption[] = [],
): string {
    const v = values[key];
    switch (key) {
        case "q": return `Cliente: ${v}`;
        case "status": return `Status: ${RESERVATION_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v}`;
        case "venueId": return `Espaço: ${venueOptions.find((o) => o.value === v)?.label ?? v}`;
        case "packageId": return `Pacote: ${packageOptions.find((o) => o.value === v)?.label ?? "selecionado"}`;
        case "startDate": return `A partir de ${fmtDate(v)}`;
        case "endDate": return `Até ${fmtDate(v)}`;
        case "minPrice": return `Valor mínimo: ${fmtMoney(v)}`;
        case "maxPrice": return `Valor máximo: ${fmtMoney(v)}`;
        default: return v;
    }
}
