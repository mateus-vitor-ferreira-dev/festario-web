import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../../components/Footer";

describe("Footer", () => {
    it("renders copyright text", () => {
        render(<Footer />);
        expect(screen.getByText(/2026 Recanto Vila Rica/i)).toBeInTheDocument();
    });

    it("renders tagline text", () => {
        render(<Footer />);
        expect(screen.getByText(/reservas com praticidade/i)).toBeInTheDocument();
    });
});
