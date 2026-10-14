import { useGoogleOAuth } from "@react-oauth/google";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import type { NavigateFunction } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { homePathFor } from "../../utils/roles";
import * as S from "./styles";

interface GoogleButtonProps {
    navigate: NavigateFunction;
}

export default function GoogleButton({ navigate }: GoogleButtonProps) {
    const { login } = useAuth();
    const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
    const overlayRef = useRef(null);

    const handleCredentialResponse = useCallback(
        async ({ credential }: { credential: string }) => {
            if (!credential) {
                toast.error("Erro ao autenticar com Google.");
                return;
            }
            try {
                const { data } = await api.post("/auth/google", { id_token: credential });
                login(data.data);
                toast.success(data.message || "Sucesso com Google.");
                navigate(homePathFor(data.data?.user?.role));
            } catch (error) {
                toast.error(getErrorMessage(error, "Erro ao autenticar com Google."));
            }
        },
        [login, navigate]
    );

    useEffect(() => {
        if (!scriptLoadedSuccessfully || !clientId || !overlayRef.current) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(overlayRef.current, {
            type: "standard",
            size: "large",
            theme: "outline",
        });
    }, [scriptLoadedSuccessfully, clientId, handleCredentialResponse]);

    return (
        <S.GoogleBtnWrapper style={{ position: "relative" }}>
            <S.GoogleButton type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Entrar com Google
            </S.GoogleButton>

            {/* Invisible Google button overlay — captures clicks and returns id_token */}
            <div
                ref={overlayRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.001,
                    overflow: "hidden",
                    cursor: "pointer",
                    zIndex: 1,
                }}
            />
        </S.GoogleBtnWrapper>
    );
}
