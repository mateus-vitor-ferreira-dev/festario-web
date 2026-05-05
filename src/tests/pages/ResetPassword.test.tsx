import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import ResetPassword from "../../pages/ResetPassword";
import { server } from "../mocks/server";

function renderPage(search = "?token=valid-token") {
    return render(
        <MemoryRouter initialEntries={[`/reset-password${search}`]}>
            <Routes>
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("ResetPassword page", () => {
    afterEach(() => localStorage.clear());

    it("renders the reset password form when token is present", () => {
        renderPage();
        expect(screen.getByPlaceholderText(/mín\. 8 caracteres/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/repita a nova senha/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /redefinir senha/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /voltar para o login/i })).toBeInTheDocument();
    });

    it("renders invalid link message when token is absent", () => {
        renderPage("");
        expect(screen.getByText(/link não é válido/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /voltar para o login/i })).toBeInTheDocument();
        // Should not render the form
        expect(
            screen.queryByRole("button", { name: /redefinir senha/i })
        ).not.toBeInTheDocument();
    });

    it("shows error when both fields are empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe a nova senha/i)).toBeInTheDocument()
        );
    });

    it("shows error when only password is filled", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByText(/confirme a nova senha/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when passwords do not match", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Diferente@456");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
        );
    });

    it("navigates to /login on successful reset", async () => {
        server.use(
            http.post("http://localhost:3000/auth/reset-password", () =>
                HttpResponse.json({ success: true, message: "Senha redefinida." })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByText("Login Page")).toBeInTheDocument()
        );
    });

    it("shows success toast message on successful reset", async () => {
        server.use(
            http.post("http://localhost:3000/auth/reset-password", () =>
                HttpResponse.json({ success: true })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(
                screen.getByText(/senha redefinida com sucesso/i)
            ).toBeInTheDocument()
        );
    });

    it("shows API error message on failure", async () => {
        server.use(
            http.post("http://localhost:3000/auth/reset-password", () =>
                HttpResponse.json(
                    { success: false, message: "Token inválido ou expirado." },
                    { status: 400 }
                )
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByText(/token inválido ou expirado/i)).toBeInTheDocument()
        );
    });

    it("shows generic error message when API returns no message", async () => {
        server.use(
            http.post("http://localhost:3000/auth/reset-password", () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(
                screen.getByText(/token inválido ou expirado\. solicite um novo link/i)
            ).toBeInTheDocument()
        );
    });

    it("shows loading state while request is in flight", async () => {
        let resolveRequest;
        server.use(
            http.post("http://localhost:3000/auth/reset-password", () =>
                new Promise((resolve) => {
                    resolveRequest = () =>
                        resolve(HttpResponse.json({ success: true }));
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), "Senha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "Senha@123");
        await user.click(screen.getByRole("button", { name: /redefinir senha/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /redefinindo\.\.\./i })).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /redefinindo\.\.\./i })).toBeDisabled();
        resolveRequest();
    });
});
