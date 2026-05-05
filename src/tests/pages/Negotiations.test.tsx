import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Negotiations from "../../pages/Negotiations";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const mockNegotiation = {
    id: "neg-1",
    subject: "Quero reservar para 80 pessoas",
    status: "OPEN",
    user: { id: "user-1", name: "Mateus" },
    messages: [{ content: "Olá, gostaria de negociar." }],
    createdAt: new Date().toISOString(),
};

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/negociacoes"]}>
            <Routes>
                <Route path="/negociacoes" element={<Negotiations />} />
                <Route path="/negociacoes/:id" element={<div>Chat Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Negotiations page", () => {
    it("shows loading state initially", () => {
        renderPage();
        expect(screen.getByText(/carregando negociações/i)).toBeInTheDocument();
    });

    it("shows empty state when there are no negotiations", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/você ainda não possui negociações/i)).toBeInTheDocument()
        );
    });

    it("renders negotiations list", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: true, data: [mockNegotiation] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Quero reservar para 80 pessoas")).toBeInTheDocument()
        );
        expect(screen.getByText("Aberta")).toBeInTheDocument();
        expect(screen.getByText("Olá, gostaria de negociar.")).toBeInTheDocument();
    });

    it("shows correct status labels", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { ...mockNegotiation, id: "neg-2", status: "PENDING_APPROVAL" },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Proposta enviada")).toBeInTheDocument()
        );
    });

    it("navigates to chat when negotiation card is clicked", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: true, data: [mockNegotiation] })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Quero reservar para 80 pessoas")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Quero reservar para 80 pessoas"));
        expect(screen.getByText("Chat Page")).toBeInTheDocument();
    });

    it("creates a new negotiation and navigates to chat", async () => {
        server.use(
            http.post(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-new", status: "OPEN" } }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /nova negociação/i }));
        await waitFor(() =>
            expect(screen.getByText("Chat Page")).toBeInTheDocument()
        );
    });

    it("shows error toast when load fails", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar negociações." }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when create fails", async () => {
        server.use(
            http.post(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: false, message: "Erro ao iniciar negociação." }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /nova negociação/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao iniciar negociação/i)).toBeInTheDocument()
        );
    });

    it("shows fallback for unknown status", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ ...mockNegotiation, status: "UNKNOWN_STATUS" }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument()
        );
    });
});
