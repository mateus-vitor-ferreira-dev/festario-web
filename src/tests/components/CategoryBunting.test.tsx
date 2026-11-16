import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CategoryBunting from "../../components/Marketplace/CategoryBunting";

describe("CategoryBunting", () => {
    it("marca a categoria escolhida e tocar nela de novo volta para todos", async () => {
        const onChange = vi.fn();
        const { rerender } = render(<CategoryBunting value="" onChange={onChange} />);
        expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "true");

        await userEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
        expect(onChange).toHaveBeenLastCalledWith("MAKEUP");

        rerender(<CategoryBunting value="MAKEUP" onChange={onChange} />);
        expect(screen.getByRole("button", { name: "Maquiagem" })).toHaveAttribute("aria-pressed", "true");
        await userEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
        expect(onChange).toHaveBeenLastCalledWith("");
    });
});
