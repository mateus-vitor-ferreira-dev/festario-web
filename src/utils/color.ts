/**
 * Contraste de cor (WCAG): o mesmo cálculo da API, para o painel avisar antes de salvar. A cor do salão
 * vira fundo de botão com texto branco, então precisa de 4,5:1 contra o branco.
 */
export const AA = 4.5;
export const HEX = /^#[0-9a-fA-F]{6}$/;

function channel(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
}

/** "4,5:1" */
export const formatRatio = (r: number) => `${r.toFixed(1).replace(".", ",")}:1`;
