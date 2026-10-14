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

    it("associates the label with the input even without an explicit id", () => {
        render(<Input label="E-mail" name="email" />);
        expect(screen.getByLabelText("E-mail")).toHaveAttribute("name", "email");
    });

    it("keeps an explicit id when provided", () => {
        render(<Input id="custom-id" label="Nome" />);
        expect(screen.getByLabelText("Nome")).toHaveAttribute("id", "custom-id");
    });

    it("links the error message to the input via aria-describedby", () => {
        render(<Input label="Senha" error="Senha obrigatória" />);
        const input = screen.getByLabelText("Senha");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("Senha obrigatória");
    });

    it("associates the label with the password field when the toggle is shown", () => {
        render(<Input label="Senha" showPasswordToggle />);
        expect(screen.getByLabelText("Senha", { selector: "input" })).toHaveAttribute("type", "password");
    });
});
