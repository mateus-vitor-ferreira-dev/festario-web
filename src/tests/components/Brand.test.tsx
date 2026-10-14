import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FestarioLogo, FestarioSymbol, FestarioWordmark } from "../../components/Brand";
import { BRAND_NAME } from "../../config/brand";

describe("Brand (Festário)", () => {
    it("o logotipo tem nome acessível com a marca", () => {
        render(<FestarioLogo />);
        expect(screen.getByRole("img", { name: BRAND_NAME })).toBeInTheDocument();
    });

    it("sem título, símbolo e nome são decorativos", () => {
        const { container } = render(<><FestarioSymbol /><FestarioWordmark /></>);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        container.querySelectorAll("svg").forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
    });

    it("tom onDark fixa as cores da versão para fundo escuro, sem depender do tema", () => {
        const { container } = render(<FestarioSymbol tone="onDark" title="Festário" />);
        const svg = container.querySelector("svg")!;
        expect(svg.style.getPropertyValue("--logo-body")).toBe("#f5f6fb");
        expect(svg.style.getPropertyValue("--logo-check")).toBe("#27357e");
    });

    it("no tema da página, as cores vêm dos tokens", () => {
        const { container } = render(<FestarioLogo />);
        expect(container.querySelector("rect")).toHaveAttribute("fill", "var(--logo-body)");
    });
});
