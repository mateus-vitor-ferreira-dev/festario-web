import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

import { getPublicTenant } from "../services/venue";
import type { PublicTenant } from "../types";
import { useAuth } from "./AuthContext";

interface SalonBrandValue {
    /** Salão aberto no navegador (o padrão, ou o do convite/painel); nulo enquanto carrega ou se falhar. */
    salon: PublicTenant | null;
    /** Recarrega depois que o dono muda a logo ou a cor. */
    refresh: () => void;
}

const SalonBrandContext = createContext<SalonBrandValue>({ salon: null, refresh: () => undefined });

/**
 * Marca do salão aberto (logo, nome e cor), lida uma vez por salão. A cor vira as variáveis
 * `--salon-color` e `--salon-color-dark`: o CSS usa só como acento, nunca no lugar dos tokens de
 * contraste. Falhar ao carregar não quebra nada: o app segue com a marca da plataforma.
 */
export function SalonBrandProvider({ children }: { children: ReactNode }) {
    const { tenant } = useAuth();
    const [salon, setSalon] = useState<PublicTenant | null>(null);
    const [version, setVersion] = useState(0);
    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        getPublicTenant(controller.signal)
            .then(setSalon)
            .catch(() => { if (!controller.signal.aborted) setSalon(null); });
        return () => controller.abort();
    }, [tenant?.slug, version]);

    useEffect(() => {
        const root = document.documentElement.style;
        if (salon?.primaryColor) {
            root.setProperty("--salon-color", salon.primaryColor);
            root.setProperty("--salon-color-dark", salon.primaryColorDark ?? salon.primaryColor);
        } else {
            root.removeProperty("--salon-color");
            root.removeProperty("--salon-color-dark");
        }
    }, [salon?.primaryColor, salon?.primaryColorDark]);

    return <SalonBrandContext.Provider value={{ salon, refresh }}>{children}</SalonBrandContext.Provider>;
}

export function useSalonBrand(): SalonBrandValue {
    return useContext(SalonBrandContext);
}
