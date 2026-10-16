import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import GoogleButton from "../../components/GoogleButton";
import { lastLoginConfig } from "../mocks/react-oauth-google";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000";

function renderButton(navigateFn = vi.fn()) {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <GoogleButton navigate={navigateFn} />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("GoogleButton", () => {
    afterEach(() => localStorage.clear());

    it("renders Google login button", () => {
        renderButton();
        expect(screen.getByRole("button", { name: /entrar com google/i })).toBeInTheDocument();
    });

    it("calls onSuccess handler when button is clicked", async () => {
        const user = userEvent.setup();
        renderButton();
        const btn = screen.getByRole("button", { name: /entrar com google/i });
        await user.click(btn);
        expect(btn).toBeInTheDocument();
    });

    it("onSuccess: saves userData, shows toast and navigates to /home", async () => {
        server.use(
            http.post(`${BASE}/auth/google`, () =>
                HttpResponse.json({
                    success: true,
                    message: "Login com Google realizado.",
                    data: { token: "g-token", user: { id: "u-1", name: "Mateus" } },
                })
            )
        );
        const navigate = vi.fn();
        renderButton(navigate);

        await lastLoginConfig.onSuccess({ credential: "fake-id-token" });

        await waitFor(() =>
            expect(screen.getByText(/login com google realizado/i)).toBeInTheDocument()
        );
        expect(localStorage.getItem("festario:userData")).not.toBeNull();
        expect(navigate).toHaveBeenCalledWith("/home");
    });

    it("onSuccess: shows fallback toast message when message is absent", async () => {
        server.use(
            http.post(`${BASE}/auth/google`, () =>
                HttpResponse.json({
                    success: true,
                    data: { token: "g-token", user: { id: "u-1", name: "Mateus" } },
                })
            )
        );
        renderButton();
        await lastLoginConfig.onSuccess({ credential: "fake-id-token" });
        await waitFor(() =>
            expect(screen.getByText(/sucesso com google/i)).toBeInTheDocument()
        );
    });

    it("onSuccess: shows error toast when API call fails", async () => {
        server.use(
            http.post(`${BASE}/auth/google`, () =>
                HttpResponse.json(
                    { success: false, message: "Token inválido." },
                    { status: 401 }
                )
            )
        );
        renderButton();
        await lastLoginConfig.onSuccess({ credential: "bad-token" });
        await waitFor(() =>
            expect(screen.getByText(/token inválido/i)).toBeInTheDocument()
        );
    });

    it("onError: shows generic error toast", async () => {
        renderButton();
        lastLoginConfig.onError();
        await waitFor(() =>
            expect(screen.getByText(/erro ao autenticar com google/i)).toBeInTheDocument()
        );
    });

    it("onSuccess: shows error.message when only error.message is present in response", async () => {
        server.use(
            http.post(`${BASE}/auth/google`, () =>
                HttpResponse.json(
                    { success: false, error: { message: "Acesso negado via error field." } },
                    { status: 403 }
                )
            )
        );
        renderButton();
        await lastLoginConfig.onSuccess({ credential: "token" });
        await waitFor(() =>
            expect(screen.getByText(/acesso negado via error field/i)).toBeInTheDocument()
        );
    });

    it("onSuccess: shows error message from API on failure", async () => {
        server.use(
            http.post(`${BASE}/auth/google`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao autenticar com Google." },
                    { status: 500 }
                )
            )
        );
        renderButton();
        await lastLoginConfig.onSuccess({ credential: "token" });
        await waitFor(() =>
            expect(screen.getByText(/erro ao autenticar com google/i)).toBeInTheDocument()
        );
    });
});
