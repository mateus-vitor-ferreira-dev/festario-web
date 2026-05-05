import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Login from "../../pages/Login";
import { server } from "../mocks/server";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<div>Home Page</div>} />
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

    it("navigates to /home on successful login", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "mateus@email.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "123456");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText("Home Page")).toBeInTheDocument()
        );
        expect(localStorage.getItem("recanto:userData")).not.toBeNull();
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
                HttpResponse.json({ success: false }, { status: 401 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "wrong@email.com");
        await user.type(screen.getByPlaceholderText(/digite sua senha/i), "wrongpass");
        await user.click(screen.getByRole("button", { name: /^entrar$/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao fazer login/i)).toBeInTheDocument()
        );
    });
});
