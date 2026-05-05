import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import Header from "../../components/Header";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { server } from "../mocks/server";

function renderHeader(userData = null, path = "/home") {
    if (userData) {
        localStorage.setItem("recanto:userData", JSON.stringify(userData));
    } else {
        localStorage.removeItem("recanto:userData");
    }

    return render(
        <ThemeProvider>
            <AuthProvider>
                <MemoryRouter initialEntries={[path]}>
                    <Routes>
                        <Route path="*" element={<Header />} />
                    </Routes>
                    <div id="pages">
                        <Routes>
                            <Route path="/login" element={<div>Login Page</div>} />
                        </Routes>
                    </div>
                </MemoryRouter>
                <ToastContainer />
            </AuthProvider>
        </ThemeProvider>
    );
}

const UNVERIFIED_USER = {
    token: "fake-token",
    user: { name: "Mateus", role: "USER", emailVerified: false },
};

const VERIFIED_USER = {
    token: "fake-token",
    user: { name: "Mateus", role: "USER", emailVerified: true },
};

describe("Header component", () => {
    afterEach(() => localStorage.clear());

    it("renders nav links", () => {
        renderHeader({ user: { name: "Mateus", role: "USER" } });
        expect(screen.getByRole("link", { name: /início/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /espaços/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /reservas/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /promoções/i })).toBeInTheDocument();
    });

    it("shows Admin link only for ADMIN role", () => {
        renderHeader({ user: { name: "Admin", role: "ADMIN" } });
        expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    });

    it("does not show Admin link for USER role", () => {
        renderHeader({ user: { name: "Mateus", role: "USER" } });
        expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
    });

    it("shows user initials in avatar", () => {
        renderHeader({ user: { name: "Mateus Ferreira", role: "USER" } });
        expect(screen.getByText("MF")).toBeInTheDocument();
    });

    it("falls back to Usuário when name is empty", () => {
        renderHeader({ user: { name: "", role: "USER" } });
        expect(screen.getByText("Usuário")).toBeInTheDocument();
    });

    it("shows single initial when name has only one word", () => {
        renderHeader({ user: { name: "Mateus", role: "USER" } });
        expect(screen.getByText("M")).toBeInTheDocument();
    });

    it("falls back to userData.name when user object is absent", () => {
        renderHeader({ name: "Mateus", role: "USER" });
        expect(screen.getByText(/mateus/i)).toBeInTheDocument();
    });

    it("shows Usuário when no userData is in localStorage", () => {
        renderHeader(null);
        expect(screen.getByText("Usuário")).toBeInTheDocument();
    });

    it("removes userData and redirects on logout", async () => {
        renderHeader({ user: { name: "Mateus", role: "USER" }, token: "tk" });
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /sair/i }));
        expect(localStorage.getItem("recanto:userData")).toBeNull();
    });

    it("renders sun icon when dark theme is active", () => {
        localStorage.setItem("recanto:theme", "dark");
        renderHeader({ user: { name: "Mateus", role: "USER" } });
        expect(screen.getByTitle(/mudar para tema claro/i)).toBeInTheDocument();
    });

    it("toggles theme from dark to light on button click", async () => {
        localStorage.setItem("recanto:theme", "dark");
        renderHeader({ user: { name: "Mateus", role: "USER" } });
        const user = userEvent.setup();
        const btn = screen.getByTitle(/mudar para tema claro/i);
        await user.click(btn);
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
});

describe("Header — unverified email banner", () => {
    afterEach(() => localStorage.clear());

    it("shows verification banner when emailVerified is false", () => {
        renderHeader(UNVERIFIED_USER);
        expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reenviar e-mail/i })).toBeInTheDocument();
    });

    it("does not show verification banner when emailVerified is true", () => {
        renderHeader(VERIFIED_USER);
        expect(screen.queryByText(/verifique seu e-mail/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /reenviar e-mail/i })
        ).not.toBeInTheDocument();
    });

    it("shows success toast after resending verification email", async () => {
        server.use(
            http.post("http://localhost:3000/auth/resend-verification", () =>
                HttpResponse.json({ success: true })
            )
        );
        const user = userEvent.setup();
        renderHeader(UNVERIFIED_USER);
        await user.click(screen.getByRole("button", { name: /reenviar e-mail/i }));
        await waitFor(() =>
            expect(
                screen.getByText(/e-mail de verificação reenviado/i)
            ).toBeInTheDocument()
        );
    });

    it("shows info toast when email is already verified (API responds accordingly)", async () => {
        server.use(
            http.post("http://localhost:3000/auth/resend-verification", () =>
                HttpResponse.json(
                    { success: false, message: "Email is already verified" },
                    { status: 400 }
                )
            )
        );
        const user = userEvent.setup();
        renderHeader(UNVERIFIED_USER);
        await user.click(screen.getByRole("button", { name: /reenviar e-mail/i }));
        await waitFor(() =>
            expect(screen.getByText(/seu e-mail já está verificado/i)).toBeInTheDocument()
        );
    });

    it("shows generic error toast on unknown API failure", async () => {
        server.use(
            http.post("http://localhost:3000/auth/resend-verification", () =>
                HttpResponse.json(
                    { success: false, message: "Internal server error" },
                    { status: 500 }
                )
            )
        );
        const user = userEvent.setup();
        renderHeader(UNVERIFIED_USER);
        await user.click(screen.getByRole("button", { name: /reenviar e-mail/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao reenviar/i)).toBeInTheDocument()
        );
    });

    it("disables the resend button and shows loading text while request is in flight", async () => {
        let resolveRequest;
        server.use(
            http.post("http://localhost:3000/auth/resend-verification", () =>
                new Promise((resolve) => {
                    resolveRequest = () =>
                        resolve(HttpResponse.json({ success: true }));
                })
            )
        );
        const user = userEvent.setup();
        renderHeader(UNVERIFIED_USER);
        await user.click(screen.getByRole("button", { name: /reenviar e-mail/i }));
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /enviando\.\.\./i })
            ).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /enviando\.\.\./i })).toBeDisabled();
        resolveRequest();
    });
});
