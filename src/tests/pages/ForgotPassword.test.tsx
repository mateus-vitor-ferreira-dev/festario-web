import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import ForgotPassword from "../../pages/ForgotPassword";
import { server } from "../mocks/server";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/forgot-password"]}>
            <Routes>
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("ForgotPassword page", () => {
    afterEach(() => localStorage.clear());

    it("renders the forgot password form", () => {
        renderPage();
        expect(screen.getByPlaceholderText(/digite seu e-mail cadastrado/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /enviar link de redefinição/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /voltar para o login/i })).toBeInTheDocument();
    });

    it("shows error toast when submitting with empty email", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /enviar link de redefinição/i }));
        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/informe seu e-mail/i)
        );
    });

    it("shows success message after successful submit", async () => {
        server.use(
            http.post("http://localhost:3000/auth/forgot-password", () =>
                HttpResponse.json({ success: true, message: "E-mail enviado." })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(
            screen.getByPlaceholderText(/digite seu e-mail cadastrado/i),
            "mateus@email.com"
        );
        await user.click(screen.getByRole("button", { name: /enviar link de redefinição/i }));
        await waitFor(() =>
            expect(screen.getByText(/mateus@email\.com/i)).toBeInTheDocument()
        );
        expect(
            screen.getByText(/receberá um link de redefinição em breve/i)
        ).toBeInTheDocument();
        // Form is replaced by the success box, no submit button anymore
        expect(
            screen.queryByRole("button", { name: /enviar link de redefinição/i })
        ).not.toBeInTheDocument();
    });

    it("shows error toast on API failure", async () => {
        server.use(
            http.post("http://localhost:3000/auth/forgot-password", () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(
            screen.getByPlaceholderText(/digite seu e-mail cadastrado/i),
            "mateus@email.com"
        );
        await user.click(screen.getByRole("button", { name: /enviar link de redefinição/i }));
        await waitFor(() =>
            expect(screen.getByText(/ocorreu um erro. tente novamente/i)).toBeInTheDocument()
        );
    });

    it("shows loading state while request is in flight", async () => {
        let resolveRequest;
        server.use(
            http.post("http://localhost:3000/auth/forgot-password", () =>
                new Promise((resolve) => {
                    resolveRequest = () =>
                        resolve(HttpResponse.json({ success: true }));
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await user.type(
            screen.getByPlaceholderText(/digite seu e-mail cadastrado/i),
            "mateus@email.com"
        );
        await user.click(screen.getByRole("button", { name: /enviar link de redefinição/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /enviando\.\.\./i })).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /enviando\.\.\./i })).toBeDisabled();
        resolveRequest();
    });
});
