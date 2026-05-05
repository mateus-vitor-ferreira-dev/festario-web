import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import SignUp from "../../pages/SignUp";
import { server } from "../mocks/server";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/cadastro"]}>
                <Routes>
                    <Route path="/cadastro" element={<SignUp />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

async function fillForm(user, overrides = {}) {
    const fields = {
        firstName: "Mateus",
        lastName: "Ferreira",
        email: "mateus@email.com",
        phone: "35999999999",
        password: "Senha@123",
        birthDate: "2000-01-01",
        ...overrides,
    };
    if (fields.firstName) await user.type(screen.getByPlaceholderText(/^seu nome$/i), fields.firstName);
    if (fields.lastName) await user.type(screen.getByPlaceholderText(/seu sobrenome/i), fields.lastName);
    if (fields.email) await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), fields.email);
    if (fields.phone) await user.type(document.querySelector('input[name="phone"]'), fields.phone);
    if (fields.password) await user.type(screen.getByPlaceholderText(/mín\. 8 caracteres/i), fields.password);
    if (fields.birthDate) {
        const dateInput = document.querySelector('input[name="birthDate"]');
        fireEvent.change(dateInput, { target: { value: fields.birthDate } });
    }
}

describe("SignUp page", () => {
    it("renders the signup form", () => {
        renderPage();
        expect(screen.getByPlaceholderText(/^seu nome$/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
    });

    it("shows error when name is empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe seu nome/i)).toBeInTheDocument()
        );
    });

    it("shows error when email is empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/^seu nome$/i), "Mateus");
        await user.type(screen.getByPlaceholderText(/seu sobrenome/i), "Ferreira");
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe seu e-mail/i)).toBeInTheDocument()
        );
    });

    it("shows error when phone is empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/^seu nome$/i), "Mateus");
        await user.type(screen.getByPlaceholderText(/seu sobrenome/i), "Ferreira");
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "m@email.com");
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe seu telefone/i)).toBeInTheDocument()
        );
    });

    it("shows error when password is empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/^seu nome$/i), "Mateus");
        await user.type(screen.getByPlaceholderText(/seu sobrenome/i), "Ferreira");
        await user.type(screen.getByPlaceholderText(/digite seu e-mail/i), "m@email.com");
        await user.type(document.querySelector('input[name="phone"]'), "35999999999");
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe sua senha/i)).toBeInTheDocument()
        );
    });

    it("shows error when birthDate is empty", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillForm(user, { birthDate: null });
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/informe sua data de nascimento/i)).toBeInTheDocument()
        );
    });

    it("shows error when password is too short", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillForm(user, { password: "Ab1@" });
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument()
        );
    });

    it("shows error when password has no uppercase letter", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillForm(user, { password: "senha@123" });
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/letra maiúscula/i)).toBeInTheDocument()
        );
    });

    it("shows error when password has no number", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillForm(user, { password: "Senha@abc" });
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/pelo menos 1 número/i)).toBeInTheDocument()
        );
    });

    it("shows error when password has no special character", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillForm(user, { password: "Senha1234" });
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/caractere especial/i)).toBeInTheDocument()
        );
    });

    it("navigates to /login on successful signup", async () => {
        server.use(
            http.post("http://localhost:3000/users", () =>
                HttpResponse.json({ success: true, data: {} }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText("Login Page")).toBeInTheDocument()
        );
    });

    it("toggles password visibility when eye button is clicked", async () => {
        const user = userEvent.setup();
        renderPage();
        const passwordInput = screen.getByPlaceholderText(/mín\. 8 caracteres/i);
        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: /mostrar senha/i }));
        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: /ocultar senha/i }));
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("shows error toast on API failure", async () => {
        server.use(
            http.post("http://localhost:3000/users", () =>
                HttpResponse.json(
                    { success: false, error: { message: "Email already in use" } },
                    { status: 409 }
                )
            )
        );
        const user = userEvent.setup();
        renderPage();
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: /criar conta/i }));
        await waitFor(() =>
            expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
        );
    });
});
