/**
 * Link vindo de dado de terceiros (salão, prestador) só vira `href` se for http(s). O React 19 já
 * bloqueia `javascript:`, mas a regra fica explícita aqui para não depender disso nem de outros
 * esquemas (`data:`, `vbscript:`, `file:`).
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw.trim());
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}

/**
 * E-mail de terceiro só vira `mailto:` se for um endereço simples. Sem isso, um endereço como
 * `a@b.com?bcc=outro@x.com&body=...` aceito por validações mais frouxas abre o cliente de e-mail
 * com destinatários e texto que a pessoa não escolheu. Fora do padrão, a tela mostra só o texto.
 */
const SIMPLE_EMAIL = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export function mailtoHref(email: string | null | undefined): string | null {
    const value = email?.trim();
    if (!value || value.length > 254 || !SIMPLE_EMAIL.test(value)) return null;
    return `mailto:${value}`;
}

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

/**
 * Link do Instagram a partir do @ (com ou sem a arroba) ou de uma URL completa. O @ é codificado
 * para não mudar o caminho do link; uma URL só passa se for http(s) e do próprio Instagram, para
 * o botão "Instagram" nunca levar a outro site.
 */
export function instagramHref(raw: string | null | undefined): string | null {
    const value = raw?.trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) {
        const url = safeHttpUrl(value);
        return url && INSTAGRAM_HOSTS.has(new URL(url).hostname) ? url : null;
    }
    const handle = value.replace(/^@/, "").trim();
    return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : null;
}
