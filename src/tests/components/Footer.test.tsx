import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../../components/Footer";
import { BRAND_NAME } from "../../config/brand";

describe("Footer", () => {
    it("renders copyright text", () => {
        render(<Footer />);
        expect(screen.getByText(new RegExp(`${new Date().getFullYear()} ${BRAND_NAME}`, "i"))).toBeInTheDocument();
    });

    it("renders tagline text", () => {
        render(<Footer />);
        expect(screen.getByText(/dúvidas sobre sua reserva/i)).toBeInTheDocument();
    });
});
