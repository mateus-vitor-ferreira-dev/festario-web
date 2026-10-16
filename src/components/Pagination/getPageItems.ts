export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Monta a sequência de páginas com reticências: sempre a primeira, a última e
 * `siblings` vizinhas da atual — ex.: `1 … 4 5 6 … 12`. Uma reticência nunca
 * esconde uma única página (nesse caso a página aparece no lugar dela).
 */
export function getPageItems(page: number, totalPages: number, siblings = 1): PageItem[] {
    if (totalPages <= 0) return [];
    // 1 + última + atual + vizinhos + 2 reticências
    const maxSlots = siblings * 2 + 5;
    if (totalPages <= maxSlots) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const current = Math.min(Math.max(page, 1), totalPages);
    let start = Math.max(2, current - siblings);
    let end = Math.min(totalPages - 1, current + siblings);

    // mantém a quantidade de itens estável perto das pontas
    if (current - siblings <= 3) {
        start = 2;
        end = Math.max(end, 3 + siblings * 2);
    }
    if (current + siblings >= totalPages - 2) {
        end = totalPages - 1;
        start = Math.min(start, totalPages - 2 - siblings * 2);
    }

    const items: PageItem[] = [1];
    if (start > 2) items.push("ellipsis-start");
    for (let p = start; p <= end; p++) items.push(p);
    if (end < totalPages - 1) items.push("ellipsis-end");
    items.push(totalPages);
    return items;
}

/** "Mostrando 21–30 de 48" — números no formato pt-BR. */
export function formatRange(page: number, limit: number, count: number, total: number): string {
    const fmt = (n: number) => n.toLocaleString("pt-BR");
    if (total === 0 || count === 0) return `Nenhum resultado`;
    const from = (page - 1) * limit + 1;
    const to = from + count - 1;
    return `Mostrando ${fmt(from)}–${fmt(to)} de ${fmt(total)}`;
}
