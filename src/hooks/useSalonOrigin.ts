/**
 * @module hooks/useSalonOrigin
 * @description De onde a vitrine mede a distância: o endereço do perfil, a localização do navegador
 * ou um CEP digitado. Fica na sessão do navegador (não na URL): um link compartilhado não carrega a
 * posição de quem compartilhou, e a vitrine e a página do salão medem do mesmo ponto.
 */
import { useCallback, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { listSalons } from "../services/salon";
import { getErrorMessage } from "../utils/getErrorMessage";
import type { SalonOriginParams } from "../types";

export const SALON_ORIGIN_KEY = "festario:vitrine-origem";

export type SalonOriginChoice =
    | { kind: "none" }
    | { kind: "profile" }
    | { kind: "coords"; lat: number; lng: number }
    | { kind: "cep"; cep: string; label: string | null };

/** ~110 m: basta para ordenar salões e evita guardar a posição exata. */
const roundCoord = (n: number) => Math.round(n * 1000) / 1000;

function readStored(): SalonOriginChoice | null {
    try {
        const raw: unknown = JSON.parse(sessionStorage.getItem(SALON_ORIGIN_KEY) || "null");
        if (!raw || typeof raw !== "object") return null;
        const o = raw as Record<string, unknown>;
        if (o.kind === "none" || o.kind === "profile") return { kind: o.kind };
        if (o.kind === "coords" && typeof o.lat === "number" && typeof o.lng === "number") return { kind: "coords", lat: o.lat, lng: o.lng };
        if (o.kind === "cep" && typeof o.cep === "string") return { kind: "cep", cep: o.cep, label: typeof o.label === "string" ? o.label : null };
        return null;
    } catch {
        return null;
    }
}

function store(choice: SalonOriginChoice) {
    try {
        sessionStorage.setItem(SALON_ORIGIN_KEY, JSON.stringify(choice));
    } catch {
        // sem armazenamento (aba privada): a escolha vale só até recarregar
    }
}

export type LocateStatus = "idle" | "locating";

export interface SalonOriginApi {
    choice: SalonOriginChoice;
    /** Parâmetros que a API recebe (`lat`/`lng`, `cep` ou `origin=profile`). */
    params: SalonOriginParams;
    /** De onde mede, com a preposição certa: "de Jardim Vila Rica, Lavras - MG", "da sua localização atual"; nulo sem localização. */
    label: string | null;
    /** O perfil tem endereço localizado e pode ser a origem. */
    canUseProfile: boolean;
    status: LocateStatus;
    /** Mensagem do último pedido de localização ou CEP que falhou. */
    error: string | null;
    chooseProfile: () => void;
    locate: () => void;
    /** Confere o CEP na API antes de trocar a origem; um CEP inválido não apaga a origem atual. */
    chooseCep: (cep: string) => Promise<boolean>;
    clear: () => void;
}

export function useSalonOrigin(): SalonOriginApi {
    const { user } = useAuth();
    const canUseProfile = Boolean(user?.hasLocation);
    const [stored, setStored] = useState<SalonOriginChoice | null>(readStored);
    const [status, setStatus] = useState<LocateStatus>("idle");
    const [error, setError] = useState<string | null>(null);

    // Sem escolha na sessão, o endereço do perfil é o ponto de partida natural.
    let choice: SalonOriginChoice = stored ?? (canUseProfile ? { kind: "profile" } : { kind: "none" });
    if (choice.kind === "profile" && !canUseProfile) choice = { kind: "none" };

    const choose = useCallback((next: SalonOriginChoice) => {
        store(next);
        setStored(next);
        setError(null);
    }, []);

    const params = useMemo<SalonOriginParams>(() => {
        if (choice.kind === "profile") return { origin: "profile" };
        if (choice.kind === "coords") return { lat: choice.lat, lng: choice.lng };
        if (choice.kind === "cep") return { cep: choice.cep };
        return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(choice)]);

    const profilePlace = [user?.neighborhood, user?.city && user?.state ? `${user.city} - ${user.state}` : user?.city].filter(Boolean).join(", ");
    const label = choice.kind === "profile" ? (profilePlace ? `de ${profilePlace}` : "do endereço do seu perfil")
        : choice.kind === "coords" ? "da sua localização atual"
        : choice.kind === "cep" ? (choice.label ? `de ${choice.label}` : `do CEP ${choice.cep}`)
        : null;

    const chooseProfile = useCallback(() => choose({ kind: "profile" }), [choose]);
    const clear = useCallback(() => choose({ kind: "none" }), [choose]);

    const locate = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setError("Este navegador não informa a localização. Digite o seu CEP.");
            return;
        }
        setStatus("locating");
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setStatus("idle");
                choose({ kind: "coords", lat: roundCoord(pos.coords.latitude), lng: roundCoord(pos.coords.longitude) });
            },
            (err) => {
                setStatus("idle");
                setError(err.code === err.PERMISSION_DENIED
                    ? "A localização foi bloqueada no navegador. Digite o seu CEP ou libere a localização nas configurações do site."
                    : "Não foi possível obter a sua localização agora. Digite o seu CEP.");
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
        );
    }, [choose]);

    const chooseCep = useCallback(async (raw: string) => {
        const digits = raw.replace(/\D/g, "");
        if (digits.length !== 8) {
            setError("O CEP tem 8 números, como 37200-000.");
            return false;
        }
        const cep = `${digits.slice(0, 5)}-${digits.slice(5)}`;
        setStatus("locating");
        setError(null);
        try {
            const { origin } = await listSalons({ cep, limit: 1 });
            choose({ kind: "cep", cep, label: origin?.label ?? null });
            return true;
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível usar este CEP. Confira os números."));
            return false;
        } finally {
            setStatus("idle");
        }
    }, [choose]);

    return { choice, params, label, canUseProfile, status, error, chooseProfile, locate, chooseCep, clear };
}
