import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Profile from "../../pages/Profile";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/profile"]}>
                <Routes>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("Profile page", () => {
    afterEach(() => localStorage.clear());

    it("shows loading state then renders profile form", async () => {
        renderPage();
        expect(screen.getByText(/carregando perfil/i)).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText(/meu perfil/i)).toBeInTheDocument()
        );
    });

    it("prefills form with user data", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByDisplayValue("Mateus")).toBeInTheDocument()
        );
        expect(screen.getByDisplayValue("mateus@email.com")).toBeInTheDocument();
    });

    it("shows USER role badge", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Usuário")).toBeInTheDocument()
        );
    });

    it("shows ADMIN role badge for admin users", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: { id: "user-1", name: "Admin", email: "admin@email.com", role: "ADMIN" },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Administrador")).toBeInTheDocument()
        );
    });

    it("saves profile changes successfully", async () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ token: "tk", user: { id: "user-1", name: "Mateus", email: "mateus@email.com", role: "USER" } })
        );
        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByDisplayValue("Mateus")).toBeInTheDocument()
        );

        const nameInput = screen.getByDisplayValue("Mateus");
        await user.clear(nameInput);
        await user.type(nameInput, "Mateus Atualizado");

        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

        await waitFor(() =>
            expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when save fails", async () => {
        server.use(
            http.patch(`${BASE}/users/user-1`, () =>
                HttpResponse.json({ success: false }, { status: 400 })
            )
        );
        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument()
        );

        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

        await waitFor(() =>
            expect(screen.getByText(/request failed with status code 400/i)).toBeInTheDocument()
        );
    });

    it("navigates to /home when cancel is clicked", async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument()
        );

        await user.click(screen.getByRole("button", { name: /cancelar/i }));
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("shows error toast when loading user fails", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao carregar os dados do perfil." },
                    { status: 500 }
                )
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar os dados do perfil/i)).toBeInTheDocument()
        );
    });

    it("shows error when name is empty on save", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByDisplayValue("Mateus")).toBeInTheDocument()
        );
        const nameInput = screen.getByDisplayValue("Mateus");
        await user.clear(nameInput);
        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));
        await waitFor(() =>
            expect(screen.getByText(/o nome é obrigatório/i)).toBeInTheDocument()
        );
    });

    it("shows error when email is empty on save", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByDisplayValue("mateus@email.com")).toBeInTheDocument()
        );
        const emailInput = screen.getByDisplayValue("mateus@email.com");
        await user.clear(emailInput);
        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));
        await waitFor(() =>
            expect(screen.getByText(/o e-mail é obrigatório/i)).toBeInTheDocument()
        );
    });

    it("updates localStorage with flat structure when stored.user is absent", async () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ token: "tk", name: "Mateus", email: "mateus@email.com" })
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));
        await waitFor(() =>
            expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
        );
        const stored = JSON.parse(localStorage.getItem("recanto:userData"));
        expect(stored.user?.name ?? stored.name).toBe("Mateus Atualizado");
    });

    it("shows '?' in avatar and handles null name/email in form", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: { id: "u-1", name: null, email: null, role: "USER", phone: null, birthDate: null },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("?")).toBeInTheDocument()
        );
        expect(document.querySelector('input[name="name"]').value).toBe("");
        expect(document.querySelector('input[name="email"]').value).toBe("");
    });

    it("populates birthDate field when user has a birthDate", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        id: "u-1",
                        name: "Mateus",
                        email: "mateus@email.com",
                        role: "USER",
                        phone: null,
                        birthDate: "1990-01-15T00:00:00.000Z",
                    },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(document.querySelector('input[name="birthDate"]').value).toBe("1990-01-15")
        );
    });

    it("shows two initials when user has multi-word name", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: { id: "u-1", name: "Mateus Ferreira", email: "mateus@email.com", role: "USER", phone: null, birthDate: null },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("MF")).toBeInTheDocument()
        );
    });

    it("clears birthDate field when empty string is submitted", async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument()
        );

        const birthDateInput = document.querySelector('input[name="birthDate"]');
        fireEvent.change(birthDateInput, { target: { value: "" } });

        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

        await waitFor(() =>
            expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows rate limit toast when loading profile returns 429", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({ success: false }, { status: 429 })
            )
        );

        renderPage();

        await waitFor(() =>
            expect(
                screen.getByText(/muitas requisições em pouco tempo/i)
            ).toBeInTheDocument()
        );
    });

    it("redirects to /home when loading profile returns 401", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({ success: false }, { status: 401 })
            )
        );

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Home Page")).toBeInTheDocument();
        });
    });

    // ─── Password change two-step flow ────────────────────────────────────────

    it("shows only current password field in step 1", async () => {
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/mín. 8 caracteres/i)).not.toBeInTheDocument();
    });

    it("shows error when verify-password returns 401", async () => {
        server.use(
            http.post(`${BASE}/users/me/verify-password`, () =>
                HttpResponse.json({ success: false, message: "Senha atual incorreta." }, { status: 401 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "ErradaSenha@1");
        await user.click(screen.getByRole("button", { name: /continuar/i }));

        await waitFor(() =>
            expect(screen.getByText(/senha atual incorreta/i)).toBeInTheDocument()
        );
        expect(screen.queryByPlaceholderText(/mín. 8 caracteres/i)).not.toBeInTheDocument();
    });

    it("advances to step 2 when current password is verified", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "Certa@123");
        await user.click(screen.getByRole("button", { name: /continuar/i }));

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/mín. 8 caracteres/i)).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /alterar senha/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    });

    it("goes back to step 1 when 'Voltar' is clicked", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "Certa@123");
        await user.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => screen.getByRole("button", { name: /voltar/i }));

        await user.click(screen.getByRole("button", { name: /voltar/i }));

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument()
        );
        expect(screen.queryByPlaceholderText(/mín. 8 caracteres/i)).not.toBeInTheDocument();
    });

    it("shows error when new passwords do not match", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "Certa@123");
        await user.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => screen.getByPlaceholderText(/mín. 8 caracteres/i));

        await user.type(screen.getByPlaceholderText(/mín. 8 caracteres/i), "NovaSenha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "DiferenteSenha@123");
        await user.click(screen.getByRole("button", { name: /alterar senha/i }));

        await waitFor(() =>
            expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
        );
    });

    it("shows validation error for weak new password", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "Certa@123");
        await user.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => screen.getByPlaceholderText(/mín. 8 caracteres/i));

        await user.type(screen.getByPlaceholderText(/mín. 8 caracteres/i), "fraca");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "fraca");
        await user.click(screen.getByRole("button", { name: /alterar senha/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });

    it("shows success and resets to step 1 after password change", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByRole("button", { name: /continuar/i }));

        await user.type(screen.getByPlaceholderText(/sua senha atual/i), "Certa@123");
        await user.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => screen.getByPlaceholderText(/mín. 8 caracteres/i));

        await user.type(screen.getByPlaceholderText(/mín. 8 caracteres/i), "NovaSenha@123");
        await user.type(screen.getByPlaceholderText(/repita a nova senha/i), "NovaSenha@123");
        await user.click(screen.getByRole("button", { name: /alterar senha/i }));

        await waitFor(() =>
            expect(screen.getByText(/senha alterada com sucesso/i)).toBeInTheDocument()
        );
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument()
        );
    });

});
