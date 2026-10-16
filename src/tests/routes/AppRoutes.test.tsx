import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { AppRoutes } from "../../routes";

function renderRoutes(initialPath = "/") {
    return render(
        <ThemeProvider>
            <AuthProvider>
                <MemoryRouter initialEntries={[initialPath]}>
                    <AppRoutes />
                </MemoryRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

describe("AppRoutes", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    // Timeout maior que o padrão (1000ms) porque lazy loading pode ser lento
    // quando muitos testes rodam em paralelo no CI ou em máquinas lentas.
    const LAZY_TIMEOUT = { timeout: 8000 };

    it("redirects '/' to '/cadastro'", async () => {
        renderRoutes("/");
        expect(await screen.findByRole("button", { name: /criar conta/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("renders SignUp at /cadastro", async () => {
        renderRoutes("/cadastro");
        expect(await screen.findByRole("button", { name: /criar conta/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("renders Login at /login", async () => {
        renderRoutes("/login");
        expect(await screen.findByRole("button", { name: /^entrar$/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("redirects unauthenticated user to /login from /home", async () => {
        renderRoutes("/home");
        expect(await screen.findByRole("button", { name: /^entrar$/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("renders Home for authenticated user at /home", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { id: "u-1", role: "USER" } })
        );
        renderRoutes("/home");
        // espera o conteúdo estável da Home (o "Carregando seu painel" é transitório)
        expect(await screen.findByText(/total de reservas/i, {}, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("redirects USER from the old /admin link (now /painel) to the salon showcase", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { id: "u-1", role: "USER" } })
        );
        renderRoutes("/admin");
        expect(await screen.findByRole("heading", { name: /salões de festa/i }, LAZY_TIMEOUT)).toBeInTheDocument();
        expect(screen.queryByText(/painel do espaço/i)).not.toBeInTheDocument();
    });

    it("redirects the old /admin link to /painel for ADMIN", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { id: "u-1", name: "Admin", role: "ADMIN" } })
        );
        renderRoutes("/admin");
        expect(await screen.findByRole("heading", { name: /painel do espaço/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("blocks OWNER from /plataforma and shows the panel instead", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { id: "u-1", name: "Dona", role: "OWNER" } })
        );
        renderRoutes("/plataforma");
        expect(await screen.findByRole("heading", { name: /painel do espaço/i }, LAZY_TIMEOUT)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /^plataforma$/i })).not.toBeInTheDocument();
    });

    it("renders the platform for ADMIN", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { id: "u-1", name: "Admin", role: "ADMIN" } })
        );
        renderRoutes("/plataforma");
        expect(await screen.findByRole("heading", { name: /^plataforma$/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });

    it("renders the public invite page without session", async () => {
        renderRoutes(`/convite/${"a".repeat(64)}`);
        expect(await screen.findByRole("heading", { name: /criar conta de dono/i }, LAZY_TIMEOUT)).toBeInTheDocument();
    });
});
