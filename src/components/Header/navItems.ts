import { isManagerRole, isPlatformAdmin, MY_BUSINESS_PATH, PANEL_PATH, PLATFORM_PATH, SALONS_PATH, SERVICES_PATH } from "../../utils/roles";

export interface NavItem {
    to: string;
    label: string;
    /** O item fica marcado também nas páginas de dentro (ex.: /s/:slug em Salões). */
    match: (pathname: string) => boolean;
}

const starts = (prefix: string) => (p: string) => p === prefix || p.startsWith(`${prefix}/`);

/**
 * Navegação principal: só os destinos de todo dia. Cliente: vitrines e as listas dele.
 * Dono e equipe: vitrines e o painel; a plataforma só para a equipe.
 */
export function primaryItems(role: string | null | undefined): NavItem[] {
    const showcase: NavItem[] = [
        { to: SALONS_PATH, label: "Salões", match: (p) => p === SALONS_PATH || p.startsWith("/s/") },
        { to: SERVICES_PATH, label: "Serviços", match: starts(SERVICES_PATH) },
    ];
    if (isManagerRole(role)) {
        return [
            ...(isPlatformAdmin(role) ? [{ to: PLATFORM_PATH, label: "Plataforma", match: starts(PLATFORM_PATH) }] : []),
            { to: PANEL_PATH, label: "Painel", match: starts(PANEL_PATH) },
            ...showcase,
        ];
    }
    return [
        ...showcase,
        { to: "/reservations", label: "Reservas", match: (p) => p === "/reservations" || p.startsWith("/checkout") || p.startsWith("/monte-a-festa") },
        { to: "/orcamentos", label: "Orçamentos", match: starts("/orcamentos") },
    ];
}

/** O que fica no menu da conta: o perfil e o que se usa de vez em quando. */
export function accountItems(role: string | null | undefined): NavItem[] {
    return [
        { to: "/profile", label: "Meu perfil", match: starts("/profile") },
        ...(!isManagerRole(role) ? [{ to: MY_BUSINESS_PATH, label: "Meu negócio", match: starts(MY_BUSINESS_PATH) }] : []),
        ...(!isManagerRole(role) ? [{ to: "/promocoes", label: "Promoções", match: starts("/promocoes") }] : []),
        { to: "/negociacoes", label: "Negociações", match: starts("/negociacoes") },
        { to: "/contate-nos", label: "Contate-nos", match: starts("/contate-nos") },
    ];
}
