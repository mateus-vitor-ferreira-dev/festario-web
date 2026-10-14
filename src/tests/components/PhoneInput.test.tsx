import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PhoneInput from "../../components/PhoneInput";

describe("PhoneInput component", () => {
    it("associates the label with the phone number input", () => {
        render(<PhoneInput label="Telefone" name="phone" value="" onChange={vi.fn()} />);
        expect(screen.getByLabelText("Telefone")).toHaveAttribute("name", "phone");
    });

    it("links the error message to the phone number input", () => {
        render(<PhoneInput label="Telefone" name="phone" value="" onChange={vi.fn()} error="Telefone inválido" />);
        const input = screen.getByLabelText("Telefone");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("Telefone inválido");
    });
});
