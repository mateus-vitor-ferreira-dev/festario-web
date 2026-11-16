/** Move o item `from` para a posição `to` (cópia; a lista original não muda). */
export function moved<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}
