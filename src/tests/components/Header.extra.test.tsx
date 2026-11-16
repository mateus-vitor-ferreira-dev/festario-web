import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../components/Header";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { seedSession } from "../helpers/session";

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
        expect(screen.getAllByText(/usuário/i).length).toBeGreaterThan(0);
    });

    it("handles missing name field safely", () => {
        seedSession({ user: {} });
        renderHeader();
        expect(screen.getAllByText(/usuário/i).length).toBeGreaterThan(0);
    });

    it("shows Plataforma link for an ADMIN session", () => {
        seedSession({ token: "t", user: { id: "u1", name: "Admin Root", email: "a@a.com", role: "ADMIN" } });
        renderHeader();
        expect(screen.getByRole("link", { name: /^plataforma$/i })).toBeInTheDocument();
    });

    it("does not show Admin link when nested user role is USER", () => {
        seedSession({ token: "t", user: { name: "Alex", role: "USER" } });
        renderHeader();
        expect(
            screen.queryByRole("link", { name: /plataforma|painel/i })
        ).not.toBeInTheDocument();
    });

    it("shows Usuário when format is unrecognized (no token or required fields)", () => {
        seedSession({ name: "Alex Root", user: { role: "USER" } });
        renderHeader();
        expect(screen.getAllByText(/usuário/i).length).toBeGreaterThan(0);
    });

    it("shows Usuário when format is unrecognized (partial nested user, no token)", () => {
        seedSession({ role: "ADMIN", user: { name: "Alex" } });
        renderHeader();
        expect(screen.queryByRole("link", { name: /plataforma|painel/i })).not.toBeInTheDocument();
    });
});
