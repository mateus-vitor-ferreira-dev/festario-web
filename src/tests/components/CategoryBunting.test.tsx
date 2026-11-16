import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CategoryBunting from "../../components/Marketplace/CategoryBunting";

describe("CategoryBunting", () => {
    it("tocar numa bandeira a leva para o meio e vira o filtro", async () => {
        const onChange = vi.fn();
        const { rerender } = render(<CategoryBunting value="" onChange={onChange} />);
        expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "true");

        await userEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
        expect(onChange).toHaveBeenLastCalledWith("MAKEUP");

        rerender(<CategoryBunting value="MAKEUP" onChange={onChange} />);
        expect(screen.getByRole("button", { name: "Maquiagem" })).toHaveAttribute("aria-pressed", "true");
        // a do meio é a única na ordem do Tab
        expect(screen.getByRole("button", { name: "Maquiagem" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("tabindex", "-1");

        // tocar de novo na escolhida não muda nada
        onChange.mockClear();
        await userEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("as setas andam uma bandeira e param nas pontas", async () => {
        const onChange = vi.fn();
        render(<CategoryBunting value="" onChange={onChange} />);
        expect(screen.getByRole("button", { name: "Categoria anterior" })).toBeDisabled();

        await userEvent.click(screen.getByRole("button", { name: "Próxima categoria" }));
        expect(onChange).toHaveBeenLastCalledWith("CATERING");
    });

    it("no teclado, ← → andam e Home/End vão para as pontas", async () => {
        const onChange = vi.fn();
        render(<CategoryBunting value="CATERING" onChange={onChange} />);
        screen.getByRole("button", { name: "Buffet" }).focus();

        await userEvent.keyboard("{ArrowRight}");
        expect(onChange).toHaveBeenLastCalledWith("BARBECUE");
        expect(screen.getByRole("button", { name: "Churrasco" })).toHaveFocus();

        await userEvent.keyboard("{End}");
        expect(onChange).toHaveBeenLastCalledWith("CLEANING");
        expect(screen.getByRole("button", { name: "Próxima categoria" })).toBeDisabled();

        await userEvent.keyboard("{Home}");
        expect(onChange).toHaveBeenLastCalledWith("");
    });
});
