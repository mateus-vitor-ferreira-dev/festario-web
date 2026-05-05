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
        localStorage.setItem("recanto:userData", "INVALID_JSON");
        renderHeader();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("handles missing name field safely", () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ user: {} })
        );
        renderHeader();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("shows Admin link when role is stored at root level", () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ name: "Admin Root", role: "ADMIN" })
        );
        renderHeader();
        expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    });

    it("does not show Admin link when nested user role is USER and root role is absent", () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({
                user: {
                    name: "Alex",
                    role: "USER",
                },
            })
        );
        renderHeader();
        expect(
            screen.queryByRole("link", { name: /admin/i })
        ).not.toBeInTheDocument();
    });

    it("falls back to root name when nested user exists without name", () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({
                name: "Alex Root",
                user: { role: "USER" },
            })
        );
        renderHeader();
        expect(screen.getByText(/alex/i)).toBeInTheDocument();
    });

    it("uses root role when nested user exists without role", () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({
                role: "ADMIN",
                user: { name: "Alex" },
            })
        );
        renderHeader();
        expect(screen.getByRole("link", { name: /admin/i })).toBeInTheDocument();
    });
});
