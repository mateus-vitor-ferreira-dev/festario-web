import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ContactUs from "../../pages/ContactUs";
import { server } from "../mocks/server";

const BASE_URL = "http://localhost:3000";

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
    it("mostra o nome do salão no título", async () => {
        renderPage();
        expect(await screen.findByRole("heading", { name: "Fale com Salão Lagoa" })).toBeInTheDocument();
    });

    it("renders the description text", () => {
        renderPage();
        expect(screen.getByText(/Fale direto com o salão pelos canais abaixo/i)).toBeInTheDocument();
    });

    it("renders WhatsApp link with correct href", async () => {
        renderPage();
        const link = (await screen.findByText("(31) 99784-2215")).closest("a");
        expect(link).toHaveAttribute("href", "https://wa.me/5531997842215");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders email, phone and address links", async () => {
        renderPage();
        expect((await screen.findByText("contato@salaolagoa.com.br")).closest("a")).toHaveAttribute("href", "mailto:contato@salaolagoa.com.br");
        expect(screen.getByText("(31) 3333-4444").closest("a")).toHaveAttribute("href", "tel:3133334444");
        expect(screen.getByText(/Av. Otacílio Negrão de Lima/).closest("a")?.getAttribute("href")).toContain("google.com/maps/search");
    });

    it("renders Instagram link with correct href", async () => {
        renderPage();
        const link = (await screen.findByText("@salaolagoa")).closest("a");
        expect(link).toHaveAttribute("href", "https://www.instagram.com/salaolagoa");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders the section titles", async () => {
        renderPage();
        expect(screen.getByText("Canais do salão")).toBeInTheDocument();
        expect(await screen.findByText("WhatsApp")).toBeInTheDocument();
        expect(screen.getAllByText("E-mail").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Instagram")).toBeInTheDocument();
    });

    it("só mostra os canais cadastrados; sem nenhum, orienta a usar o formulário", async () => {
        server.use(http.get(`${BASE_URL}/contact`, () => HttpResponse.json({ success: true, data: { name: "Salão Novo", whatsapp: null, phone: null, email: null, instagram: null, address: null } })));
        renderPage();
        expect(await screen.findByText(/ainda não cadastrou WhatsApp, telefone ou e-mail/i)).toBeInTheDocument();
        expect(screen.queryByText("WhatsApp")).not.toBeInTheDocument();
    });

    it("se o contato não carrega, avisa e mantém o formulário", async () => {
        server.use(http.get(`${BASE_URL}/contact`, () => HttpResponse.json({ error: { message: "x" } }, { status: 500 })));
        renderPage();
        expect(await screen.findByText(/não foi possível carregar os contatos/i, {}, { timeout: 4000 })).toBeInTheDocument();
        expect(screen.getAllByText("Enviar mensagem").length).toBeGreaterThan(0);
    });

    it("navigates to /negociacoes when chat button is clicked", async () => {
        const user = userEvent.setup();
        renderPage();
        const button = screen.getByText("Negociação pela plataforma").closest("button");
        await user.click(button);
        expect(screen.getByText("Negociações Page")).toBeInTheDocument();
    });
});
