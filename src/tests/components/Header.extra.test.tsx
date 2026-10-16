import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../components/Header";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

function renderHeader() {
    return render(
        <ThemeProvider>
            <AuthProvider>
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

describe("Header extra coverage", () => {
    it("handles invalid JSON in localStorage gracefully", () => {
        localStorage.setItem("festario:userData", "INVALID_JSON");
        renderHeader();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("handles missing name field safely", () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ user: {} })
        );
        renderHeader();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("shows Plataforma link for migrated legacy session with ADMIN role", () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ id: "u1", name: "Admin Root", email: "a@a.com", role: "ADMIN", token: "t" })
        );
        renderHeader();
        expect(screen.getByRole("link", { name: /^plataforma$/i })).toBeInTheDocument();
    });

    it("does not show Admin link when nested user role is USER", () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ token: "t", user: { name: "Alex", role: "USER" } })
        );
        renderHeader();
        expect(
            screen.queryByRole("link", { name: /plataforma|painel/i })
        ).not.toBeInTheDocument();
    });

    it("shows Usuário when format is unrecognized (no token or required fields)", () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ name: "Alex Root", user: { role: "USER" } })
        );
        renderHeader();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("shows Usuário when format is unrecognized (partial nested user, no token)", () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({ role: "ADMIN", user: { name: "Alex" } })
        );
        renderHeader();
        expect(screen.queryByRole("link", { name: /plataforma|painel/i })).not.toBeInTheDocument();
    });
});
