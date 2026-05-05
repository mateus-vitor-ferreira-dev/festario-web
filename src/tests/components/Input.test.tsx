import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Input from "../../components/Input";

describe("Input component", () => {
    it("renders input without label or error", () => {
        render(<Input placeholder="Digite algo" />);
        expect(screen.getByPlaceholderText("Digite algo")).toBeInTheDocument();
    });

    it("renders label when provided", () => {
        render(<Input label="Nome" placeholder="Seu nome" />);
        expect(screen.getByText("Nome")).toBeInTheDocument();
    });

    it("does not render label element when label is not provided", () => {
        render(<Input placeholder="Sem label" />);
        expect(screen.queryByText("Nome")).not.toBeInTheDocument();
    });

    it("renders error message when error prop is provided", () => {
        render(<Input error="Campo obrigatório" />);
        expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
    });

    it("does not render error element when error is not provided", () => {
        render(<Input placeholder="Sem erro" />);
        expect(screen.queryByText("Campo obrigatório")).not.toBeInTheDocument();
    });

    it("passes additional props to the underlying input", () => {
        render(<Input type="email" placeholder="seu@email.com" />);
        expect(screen.getByPlaceholderText("seu@email.com")).toHaveAttribute("type", "email");
    });
});
