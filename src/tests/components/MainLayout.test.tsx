import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import MainLayout from "../../components/MainLayout";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

describe("MainLayout", () => {
    it("renders header, outlet area and footer", () => {
        render(
            <ThemeProvider>
                <AuthProvider>
                    <MemoryRouter>
                        <MainLayout />
                    </MemoryRouter>
                </AuthProvider>
            </ThemeProvider>
        );
        expect(screen.getAllByText(/recanto vila rica/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/2026 Recanto Vila Rica/i)).toBeInTheDocument();
    });
});
