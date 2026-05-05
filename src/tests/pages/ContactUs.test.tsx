import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ContactUs from "../../pages/ContactUs";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/contato"]}>
            <Routes>
                <Route path="/contato" element={<ContactUs />} />
                <Route path="/negociacoes" element={<div>Negociações Page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("ContactUs page", () => {
    it("renders the page title", () => {
        renderPage();
        expect(screen.getByText("Contate-nos")).toBeInTheDocument();
    });

    it("renders the description text", () => {
        renderPage();
        expect(screen.getByText(/Fale diretamente com o nosso time/i)).toBeInTheDocument();
    });

    it("renders WhatsApp link with correct href", () => {
        renderPage();
        const link = screen.getByText("(35) 9 9971-8824").closest("a");
        expect(link).toHaveAttribute("href", "https://wa.me/5535999718824");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders email link", () => {
        renderPage();
        const link = screen.getByText("recanto.vilaricafestas@gmail.com").closest("a");
        expect(link).toHaveAttribute("href", "mailto:recanto.vilaricafestas@gmail.com");
    });

    it("renders Instagram link with correct href", () => {
        renderPage();
        const link = screen.getByText("@recanto.vilarica").closest("a");
        expect(link).toHaveAttribute("href", "https://www.instagram.com/recanto.vilarica");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders the section titles", () => {
        renderPage();
        expect(screen.getByText("Nossos canais")).toBeInTheDocument();
        expect(screen.getByText("WhatsApp")).toBeInTheDocument();
        expect(screen.getAllByText("E-mail").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Instagram")).toBeInTheDocument();
    });

    it("navigates to /negociacoes when chat button is clicked", async () => {
        const user = userEvent.setup();
        renderPage();
        const button = screen.getByText("Negociação pela plataforma").closest("button");
        await user.click(button);
        expect(screen.getByText("Negociações Page")).toBeInTheDocument();
    });
});
