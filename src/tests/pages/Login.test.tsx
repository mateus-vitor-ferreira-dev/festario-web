import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Login from "../../pages/Login";
import { server } from "../mocks/server";

function renderPage(path = "/login") {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/saloes" element={<div>Salons Page</div>} />
                    <Route path="/s/:slug" element={<div>Salon Page</div>} />
                    <Route path="/cadastro" element={<div>Cadastro Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("Login page", () => {
    afterEach(() => localStorage.clear());

    it("renders the login form", () => {
        renderPage();
        expect(screen.getByPlaceholderText(/digite seu e-mail/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/digite sua senha/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^entrar$/i })).toBeInTheDocument();
    });

    it("shows error when submitting with empty fields", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe e-mail e senha/i)).toBeInTheDocument()
        );
    });

    it("navigates the client to the salon showcase on successful login", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "mateus@email.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "123456");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText("Salons Page")).toBeInTheDocument()
        );
        expect(localStorage.getItem("festario:userData")).not.toBeNull();
    });

    it("shows fallback success toast when response has no message", async () => {
        server.use(
            http.post("http://localhost:3000/auth/login", () =>
                HttpResponse.json({
                    success: true,
                    data: { token: "fake-token", user: { id: "u-1", name: "Mateus", email: "m@email.com", role: "USER" } },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "m@email.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "123456");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText(/login realizado com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows error toast on failed login", async () => {
        server.use(
            http.post("http://localhost:3000/auth/login", () =>
                HttpResponse.json(
                    { success: false, message: "Email ou senha incorretos." },
                    { status: 401 }
                )
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "wrong@email.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "wrongpass");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument()
        );
    });

    describe("voltar depois de entrar", () => {
        const okLogin = () => server.use(http.post("http://localhost:3000/auth/login", () =>
            HttpResponse.json({ success: true, data: { token: "t", user: { id: "u-1", name: "Mateus", email: "m@email.com", role: "USER" } } })));

        async function signIn() {
            const user = userEvent.setup();
            await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "m@email.com");
            await user.type(screen.getByPlaceholderText(/digite sua senha/i), "senha123");
            await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        }

        it("volta para o salão de onde a pessoa veio para reservar", async () => {
            okLogin();
            renderPage(`/login?voltar=${encodeURIComponent("/s/jardim?reservar=v1")}`);
            expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", `/cadastro?voltar=${encodeURIComponent("/s/jardim?reservar=v1")}`);
            await signIn();
            expect(await screen.findByText("Salon Page")).toBeInTheDocument();
        });

        it("ignora endereço externo e segue para a vitrine", async () => {
            okLogin();
            renderPage(`/login?voltar=${encodeURIComponent("//site-malicioso.com")}`);
            await signIn();
            expect(await screen.findByText("Salons Page")).toBeInTheDocument();
        });
    });
});
