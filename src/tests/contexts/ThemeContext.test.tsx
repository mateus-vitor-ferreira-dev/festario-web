import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "../../contexts/ThemeContext";

function ThemeConsumer() {
    const { theme, toggleTheme } = useTheme();
    return (
        <>
            <span data-testid="theme">{theme}</span>
            <button onClick={toggleTheme}>toggle</button>
        </>
    );
}

function renderWithProvider() {
    return render(
        <ThemeProvider>
            <ThemeConsumer />
        </ThemeProvider>
    );
}

describe("ThemeContext", () => {
    it("defaults to light theme", () => {
        localStorage.removeItem("recanto:theme");
        renderWithProvider();
        expect(screen.getByTestId("theme").textContent).toBe("light");
    });

    it("reads saved theme from localStorage", () => {
        localStorage.setItem("recanto:theme", "dark");
        renderWithProvider();
        expect(screen.getByTestId("theme").textContent).toBe("dark");
        localStorage.removeItem("recanto:theme");
    });

    it("toggles from light to dark", async () => {
        localStorage.removeItem("recanto:theme");
        renderWithProvider();
        await userEvent.click(screen.getByText("toggle"));
        expect(screen.getByTestId("theme").textContent).toBe("dark");
    });

    it("toggles from dark back to light", async () => {
        localStorage.setItem("recanto:theme", "dark");
        renderWithProvider();
        await userEvent.click(screen.getByText("toggle"));
        expect(screen.getByTestId("theme").textContent).toBe("light");
        localStorage.removeItem("recanto:theme");
    });

    it("sets data-theme attribute on documentElement", async () => {
        localStorage.removeItem("recanto:theme");
        renderWithProvider();
        await act(async () => {});
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
});
