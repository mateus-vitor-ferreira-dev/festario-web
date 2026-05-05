import React from "react";

export const GoogleOAuthProvider = ({ children }) => children;

export const lastLoginConfig = { onSuccess: null, onError: null };

export const GoogleLogin = ({ onSuccess, onError }) => {
    lastLoginConfig.onSuccess = onSuccess;
    lastLoginConfig.onError = onError;
    return React.createElement("button", { "data-testid": "google-login-btn" }, "Entrar com Google");
};

export const useGoogleLogin = ({ onSuccess, onError }) => {
    lastLoginConfig.onSuccess = onSuccess;
    lastLoginConfig.onError = onError;
    return () => {
        if (onSuccess) onSuccess({ access_token: "fake-access-token" });
    };
};

export const useGoogleOAuth = () => ({
    clientId: "test-client-id",
    scriptLoadedSuccessfully: true,
});
