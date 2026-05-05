import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorBoundary from "../../components/ErrorBoundary";

function Bomb() {
    throw new Error("test error");
}

describe("ErrorBoundary", () => {
    it("renders children when there is no error", () => {
        render(
            <ErrorBoundary fallback={<span>Error</span>}>
                <span>ok</span>
            </ErrorBoundary>
        );
        expect(screen.getByText("ok")).toBeInTheDocument();
    });

    it("renders fallback when child throws", () => {
        const consoleError = console.error;
        console.error = () => {};
        render(
            <ErrorBoundary fallback={<span>Erro ao gerar contrato</span>}>
                <Bomb />
            </ErrorBoundary>
        );
        expect(screen.getByText("Erro ao gerar contrato")).toBeInTheDocument();
        console.error = consoleError;
    });

    it("renders null when child throws and no fallback is provided", () => {
        const consoleError = console.error;
        console.error = () => {};
        const { container } = render(
            <ErrorBoundary>
                <Bomb />
            </ErrorBoundary>
        );
        expect(container.firstChild).toBeNull();
        console.error = consoleError;
    });
});
