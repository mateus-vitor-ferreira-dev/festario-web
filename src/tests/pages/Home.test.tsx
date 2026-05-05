import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../../pages/Home";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <MemoryRouter>
            <Home />
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Home page", () => {
    afterEach(() => vi.restoreAllMocks());
    it("shows greeting and stats after loading", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/total de reservas/i)).toBeInTheDocument()
        );
        expect(screen.getAllByText(/espaços disponíveis/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/próximas reservas/i).length).toBeGreaterThan(0);
    });

    it("shows user first name in greeting", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/mateus/i)).toBeInTheDocument()
        );
    });

    it("shows empty state for upcoming reservations when list is empty", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/nenhuma reserva futura encontrada/i)).toBeInTheDocument()
        );
    });

    it("shows upcoming reservations when data is present", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-1",
                            status: "PENDING",
                            startDate: new Date(Date.now() + 86400000).toISOString(),
                            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                            venue: { name: "Salão Principal" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getAllByText("Salão Principal").length).toBeGreaterThan(0)
        );
        expect(screen.getByText("Pendente")).toBeInTheDocument();
    });

    it("shows venue price chip when basePrice is present", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/a partir de/i)).toBeInTheDocument()
        );
    });

    it("does not show price chip when basePrice is null", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ id: "venue-1", name: "Salão Principal", location: "Lavras", basePrice: null }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );
        expect(screen.queryByText(/a partir de/i)).not.toBeInTheDocument();
    });

    it("shows grants panel when user has available discounts", async () => {
        server.use(
            http.get(`${BASE}/promotions/my-grants`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "grant-1",
                            percentOff: 10,
                            validUntil: "2027-01-01T00:00:00.000Z",
                            campaign: { name: "Indique um amigo" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/seus descontos disponíveis/i)).toBeInTheDocument()
        );
        expect(screen.getByText("10% OFF")).toBeInTheDocument();
    });

    it("does not show grants panel when user has no discounts", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/total de reservas/i)).toBeInTheDocument()
        );
        expect(screen.queryByText(/seus descontos disponíveis/i)).not.toBeInTheDocument();
    });

    it("shows grant with no expiry date", async () => {
        server.use(
            http.get(`${BASE}/promotions/my-grants`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "grant-1",
                            percentOff: 15,
                            validUntil: null,
                            campaign: { name: "Fidelidade" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/sem data de expiração/i)).toBeInTheDocument()
        );
    });

    it("shows empty state when venues list is empty", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: true, data: [] })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/nenhum espaço encontrado/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when dashboard load fails", async () => {
        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar os dados da home/i)).toBeInTheDocument()
        );
    });

    it("shows past reservations are excluded from upcoming list", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "past-1",
                            status: "PAID",
                            startDate: new Date(Date.now() - 86400000).toISOString(),
                            endDate: new Date(Date.now() - 86400000 + 3600000).toISOString(),
                            venue: { name: "Salão do Passado" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/total de reservas/i)).toBeInTheDocument()
        );
        expect(screen.queryByText("Salão do Passado")).not.toBeInTheDocument();
    });

    it("shows loading state initially", () => {
        renderPage();
        expect(screen.getByText(/carregando seu painel/i)).toBeInTheDocument();
    });

    it("shows 'Bom dia' when hour < 12", async () => {
        vi.spyOn(Date.prototype, "getHours").mockReturnValue(8);
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/bom dia/i)).toBeInTheDocument()
        );
    });

    it("shows 'Boa tarde' when hour is between 12 and 18", async () => {
        vi.spyOn(Date.prototype, "getHours").mockReturnValue(15);
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/boa tarde/i)).toBeInTheDocument()
        );
    });

    it("shows 'Boa noite' when hour >= 18", async () => {
        vi.spyOn(Date.prototype, "getHours").mockReturnValue(20);
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/boa noite/i)).toBeInTheDocument()
        );
    });

    it("loads dashboard even when listMyGrants throws", async () => {
        server.use(
            http.get(`${BASE}/promotions/my-grants`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/total de reservas/i)).toBeInTheDocument()
        );
        expect(screen.queryByText(/seus descontos disponíveis/i)).not.toBeInTheDocument();
    });

    it("shows 'Reserva' when upcoming reservation has no venue", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-no-venue",
                            status: "PENDING",
                            startDate: new Date(Date.now() + 86400000).toISOString(),
                            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                            venue: null,
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Reserva")).toBeInTheDocument()
        );
    });

    it("shows raw status string when reservation status is unknown", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-unknown",
                            status: "UNKNOWN_STATUS",
                            startDate: new Date(Date.now() + 86400000).toISOString(),
                            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                            venue: { name: "Salão" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument()
        );
    });

    it("shows 'Localização não informada' when venue has no location", async () => {
        server.use(
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ id: "venue-1", name: "Salão Sem Local", location: null, basePrice: 50000 }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/localização não informada/i)).toBeInTheDocument()
        );
    });

    it("sorts upcoming reservations by startDate", async () => {
        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-later",
                            status: "PAID",
                            startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                            endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
                            venue: { name: "Salão B" },
                        },
                        {
                            id: "res-sooner",
                            status: "PENDING",
                            startDate: new Date(Date.now() + 86400000).toISOString(),
                            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                            venue: { name: "Salão A" },
                        },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão A")).toBeInTheDocument()
        );
        const items = screen.getAllByRole("listitem");
        expect(items[0]).toHaveTextContent("Salão A");
    });
});
