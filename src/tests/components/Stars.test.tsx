import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RatingLine, StarInput, StarsDisplay } from "../../components/Marketplace/Stars";

describe("Stars", () => {
    it("lê a média por extenso para o leitor de tela", () => {
        render(<StarsDisplay value={4.5} />);
        expect(screen.getByRole("img", { name: "4,5 de 5" })).toBeInTheDocument();
    });

    it("sem avaliação, diz isso em vez de mostrar zero estrelas", () => {
        render(<RatingLine average={null} count={0} />);
        expect(screen.getByText("Ainda sem avaliações")).toBeInTheDocument();
    });

    it("mostra média e total no singular e no plural", () => {
        const { rerender } = render(<RatingLine average={5} count={1} />);
        expect(screen.getByText("(1 avaliação)")).toBeInTheDocument();
        rerender(<RatingLine average={4.8} count={12} />);
        expect(screen.getByText("(12 avaliações)")).toBeInTheDocument();
    });

    it("a nota é um grupo de rádios", async () => {
        const onChange = vi.fn();
        render(<StarInput value={0} onChange={onChange} label="Sua nota" />);
        expect(screen.getByRole("group", { name: "Sua nota" })).toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", { name: /4 estrelas/ }));
        expect(onChange).toHaveBeenCalledWith(4);
    });
});
