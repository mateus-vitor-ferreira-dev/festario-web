import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Admin from "../../pages/Admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <MemoryRouter>
            <Admin />
            <ToastContainer />
        </MemoryRouter>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

describe("Admin - Dashboard tab", () => {
    it("shows summary metrics after loading", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("10")).toBeInTheDocument()
        );
        expect(screen.getByText(/total de reservas/i)).toBeInTheDocument();
        expect(screen.getByText(/receita confirmada/i)).toBeInTheDocument();
    });
});

// ─── Reservations ─────────────────────────────────────────────────────────────

describe("Admin - Reservations tab", () => {
    it("shows empty state when no reservations", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^reservas$/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhuma reserva encontrada/i)).toBeInTheDocument()
        );
    });

    it("shows reservations list with filters", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-1",
                            userId: "user-1",
                            venueId: "venue-1",
                            status: "PAID",
                            planCode: "ESSENCIAL",
                            totalPrice: 85000,
                            startDate: "2026-06-01T10:00:00.000Z",
                            endDate: "2026-06-01T18:00:00.000Z",
                            user: { name: "Mateus" },
                            venue: { name: "Salão Principal" },
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^reservas$/i }));

        await waitFor(() =>
            expect(screen.getByText("Mateus")).toBeInTheDocument()
        );
        expect(screen.getByText("Salão Principal")).toBeInTheDocument();
    });

    it("shows disabled Anterior button on first page", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-1",
                            status: "PENDING",
                            planCode: "ESSENCIAL",
                            totalPrice: 85000,
                            startDate: "2026-06-01T10:00:00.000Z",
                            endDate: "2026-06-01T18:00:00.000Z",
                            user: { name: "Mateus" },
                            venue: { name: "Salão Principal" },
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^reservas$/i }));

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled()
        );
    });

    it("shows truncated userId and venueId when user and venue are null, and '—' for missing planCode", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-null",
                            userId: "user-abc123456",
                            venueId: "venue-xyz",
                            status: "UNKNOWN_STATUS",
                            planCode: null,
                            totalPrice: 0,
                            startDate: "2026-06-01T10:00:00.000Z",
                            endDate: "2026-06-01T18:00:00.000Z",
                            user: null,
                            venue: null,
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^reservas$/i }));

        await waitFor(() =>
            expect(screen.getByText("user-abc...")).toBeInTheDocument()
        );
        expect(screen.getByText("venue-xyz")).toBeInTheDocument();
        expect(screen.getByText("—")).toBeInTheDocument();
        expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
    });

    it("enables Próxima button and navigates to page 2 when there are 15 results", async () => {
        const reservations = Array.from({ length: 15 }, (_, i) => ({
            id: `res-${i}`,
            userId: `user-${i}`,
            venueId: `venue-${i}`,
            status: "PAID",
            planCode: "ESSENCIAL",
            totalPrice: 1000,
            startDate: "2026-06-01T10:00:00.000Z",
            endDate: "2026-06-01T18:00:00.000Z",
            user: { name: `User ${i}` },
            venue: { name: `Salão ${i}` },
        }));
        server.use(
            http.get(`${BASE}/admin/reservations`, () =>
                HttpResponse.json({ success: true, data: reservations })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^reservas$/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /próxima/i })).not.toBeDisabled()
        );

        await user.click(screen.getByRole("button", { name: /próxima/i }));
        await waitFor(() =>
            expect(screen.getByText(/página 2/i)).toBeInTheDocument()
        );
    });
});

// ─── Campaigns ────────────────────────────────────────────────────────────────

describe("Admin - Campaigns tab", () => {
    it("shows empty state when no campaigns", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhuma campanha cadastrada/i)).toBeInTheDocument()
        );
    });

    it("opens and closes create campaign modal", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /nova campanha/i }));

        await user.click(screen.getByRole("button", { name: /nova campanha/i }));
        expect(screen.getByText(/nova campanha/i, { selector: "h2, h3" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /cancelar/i }));
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument()
        );
    });

    it("shows campaigns list with toggle and status badge", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-1",
                            name: "Indique um amigo",
                            code: "REFERRAL_2026",
                            type: "REFERRAL_NEXT_BOOKING",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));

        await waitFor(() =>
            expect(screen.getByText("Indique um amigo")).toBeInTheDocument()
        );
        expect(screen.getByText("Ativa")).toBeInTheDocument();
    });

    it("toggles campaign active state", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-1",
                            name: "Indique um amigo",
                            code: "REFERRAL_2026",
                            type: "REFERRAL_NEXT_BOOKING",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            ),
            http.patch(`${BASE}/admin/campaigns/camp-1`, () =>
                HttpResponse.json({ success: true, data: { id: "camp-1", isActive: false } })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /desativar/i }));

        await user.click(screen.getByRole("button", { name: /desativar/i }));
        await waitFor(() =>
            expect(screen.getByText(/desativada com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows RAFFLE_VIP campaign with draw button when active", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-2",
                            name: "Sorteio VIP",
                            code: "RAFFLE_2026",
                            type: "RAFFLE_VIP",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /realizar sorteio/i })).toBeInTheDocument()
        );
    });

    it("draws raffle winner and shows winner modal", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-2",
                            name: "Sorteio VIP",
                            code: "RAFFLE_2026",
                            type: "RAFFLE_VIP",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            ),
            http.post(`${BASE}/admin/campaigns/camp-2/draw-winner`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        winner: { name: "Maria", email: "maria@email.com", phone: "35999999999" },
                        totalEntries: 5,
                        campaignName: "Sorteio VIP",
                    },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /realizar sorteio/i }));

        await user.click(screen.getByRole("button", { name: /realizar sorteio/i }));
        await waitFor(() =>
            expect(screen.getByText("Maria")).toBeInTheDocument()
        );
        expect(screen.getByText("maria@email.com")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /copiar mensagem/i })).toBeInTheDocument();
    });

    it("shows Ativar button for an inactive campaign", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-inactive",
                            name: "Campanha Inativa",
                            code: "INACTIVE_2026",
                            type: "REFERRAL_NEXT_BOOKING",
                            isActive: false,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000).toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^ativar$/i })).toBeInTheDocument()
        );
    });

    it("shows LOYALTY_ALWAYS_HERE campaign with 'O ANO TODO' date display", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-loyalty",
                            name: "Programa Fidelidade",
                            code: "LOYALTY_2026",
                            type: "LOYALTY_ALWAYS_HERE",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 365).toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() =>
            expect(screen.getByText("O ANO TODO")).toBeInTheDocument()
        );
    });

    it("draws raffle winner without phone and shows singular 'participante'", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-raffle",
                            name: "Sorteio VIP",
                            code: "RAFFLE_2026",
                            type: "RAFFLE_VIP",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            ),
            http.post(`${BASE}/admin/campaigns/camp-raffle/draw-winner`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        winner: { name: "João", email: "joao@email.com", phone: null },
                        totalEntries: 1,
                        campaignName: "Sorteio VIP",
                    },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /realizar sorteio/i }));

        await user.click(screen.getByRole("button", { name: /realizar sorteio/i }));
        await waitFor(() =>
            expect(screen.getByText("João")).toBeInTheDocument()
        );
        expect(screen.getByText(/1 participante$/i)).toBeInTheDocument();
        expect(screen.queryByText("null")).not.toBeInTheDocument();
    });

    it("copies winner message and shows 'Copiado!' feedback", async () => {
        server.use(
            http.get(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "camp-copy",
                            name: "Sorteio VIP",
                            code: "RAFFLE_COPY",
                            type: "RAFFLE_VIP",
                            isActive: true,
                            startsAt: new Date(Date.now() - 86400000).toISOString(),
                            endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                        },
                    ],
                })
            ),
            http.post(`${BASE}/admin/campaigns/camp-copy/draw-winner`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        winner: { name: "Ana", email: "ana@email.com", phone: "35999990000" },
                        totalEntries: 3,
                        campaignName: "Sorteio VIP",
                    },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /realizar sorteio/i }));
        await user.click(screen.getByRole("button", { name: /realizar sorteio/i }));
        await waitFor(() => screen.getByRole("button", { name: /copiar mensagem/i }));

        await user.click(screen.getByRole("button", { name: /copiar mensagem/i }));
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /copiado/i })).toBeInTheDocument()
        );
    });

    it("closes create campaign modal when clicking the overlay", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /nova campanha/i }));

        await user.click(screen.getByRole("button", { name: /nova campanha/i }));
        const cancelButton = await screen.findByRole("button", { name: /cancelar/i });
        expect(cancelButton).toBeInTheDocument();

        // Traverse: cancel → ModalActions → form → ModalBox → ModalOverlay
        const overlay = cancelButton.closest("form")?.parentElement?.parentElement;
        if (overlay) {
            const { fireEvent: fe } = await import("@testing-library/react");
            fe.click(overlay);
        }

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument()
        );
    });

    it("creates a campaign via the modal form", async () => {
        server.use(
            http.post(`${BASE}/admin/campaigns`, () =>
                HttpResponse.json({ success: true, data: { id: "camp-new", name: "Nova Campanha" } }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /campanhas/i }));
        await waitFor(() => screen.getByRole("button", { name: /nova campanha/i }));

        await user.click(screen.getByRole("button", { name: /nova campanha/i }));

        await user.type(screen.getByPlaceholderText(/ex: indique um amigo/i), "Nova Campanha");
        await user.type(screen.getByPlaceholderText(/ex: referral_2026/i), "NOVA_2026");

        const allDateInputs = document.querySelectorAll('input[type="date"]');
        if (allDateInputs[0]) {
            const { fireEvent: fe } = await import("@testing-library/react");
            fe.change(allDateInputs[0], { target: { value: "2026-01-01" } });
            fe.change(allDateInputs[1], { target: { value: "2026-12-31" } });
        }

        await user.click(screen.getByRole("button", { name: /^criar campanha$/i }));
        await waitFor(() =>
            expect(screen.getByText(/criada com sucesso/i)).toBeInTheDocument()
        );
    });
});

// ─── Holidays ─────────────────────────────────────────────────────────────────

describe("Admin - Holidays tab", () => {
    it("shows empty state when no holidays", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhum feriado cadastrado/i)).toBeInTheDocument()
        );
    });

    it("shows holidays list", async () => {
        server.use(
            http.get(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ id: "h-1", name: "Natal", date: "2026-12-25T00:00:00.000Z", type: "national" }],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        await waitFor(() =>
            expect(screen.getByText("Natal")).toBeInTheDocument()
        );
    });

    it("deletes a holiday", async () => {
        server.use(
            http.get(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ id: "h-1", name: "Natal", date: "2026-12-25T00:00:00.000Z", type: "national" }],
                })
            ),
            http.delete(`${BASE}/admin/holidays/h-1`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /remover/i }));

        await user.click(screen.getByRole("button", { name: /remover/i }));
        await waitFor(() =>
            expect(screen.queryByText("Natal")).not.toBeInTheDocument()
        );
    });

    it("syncs national holidays", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync`, () =>
                HttpResponse.json({ success: true, data: { synced: 12 } })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /sincronizar feriados nacionais/i }));

        await user.click(screen.getByRole("button", { name: /sincronizar feriados nacionais/i }));
        await waitFor(() =>
            expect(screen.getByText(/12 feriados nacionais sincronizados/i)).toBeInTheDocument()
        );
    });

    it("syncs municipal holidays", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync-municipal`, () =>
                HttpResponse.json({ success: true, data: { synced: 3 } })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /sincronizar feriados municipais/i }));

        await user.click(screen.getByRole("button", { name: /sincronizar feriados municipais/i }));
        await waitFor(() =>
            expect(screen.getByText(/3 feriados municipais de lavras sincronizados/i)).toBeInTheDocument()
        );
    });

    it("opens create holiday modal and creates a holiday", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({ success: true, data: { id: "h-new", name: "Feriado Teste" } }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /\+ novo feriado/i }));

        await user.click(screen.getByRole("button", { name: /\+ novo feriado/i }));
        await user.type(screen.getByPlaceholderText(/ex: consciência negra/i), "Feriado Teste");

        const dateInput = document.querySelector('input[type="date"]');
        const { fireEvent: fe } = await import("@testing-library/react");
        fe.change(dateInput, { target: { value: "2026-11-20" } });

        await user.click(screen.getByRole("button", { name: /^criar feriado$/i }));
        await waitFor(() =>
            expect(screen.getByText(/feriado criado com sucesso/i)).toBeInTheDocument()
        );
    });

    it("changes year filter", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("combobox"));

        const yearSelect = screen.getByRole("combobox");
        await user.selectOptions(yearSelect, String(new Date().getFullYear() + 1));

        await waitFor(() =>
            expect(screen.getByText(/nenhum feriado cadastrado/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when summary load fails", async () => {
        server.use(
            http.get(`${BASE}/admin/reservations/summary`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        renderPage();

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i);
        });
    });

    it("shows error toast when deleting holiday fails", async () => {
        server.use(
            http.get(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "holiday-1",
                            name: "Natal",
                            date: "2026-12-25",
                            type: "national",
                        },
                    ],
                })
            ),
            http.delete(`${BASE}/admin/holidays/:holidayId`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        const deleteButton = await screen.findByRole("button", {
            name: /remover/i,
        });

        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i);
        });
    });

    it("shows error toast when syncing national holidays fails", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        await user.click(
            screen.getByRole("button", { name: /sincronizar feriados nacionais/i })
        );

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i);
        });
    });

    it("shows error toast when syncing municipal holidays fails", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays/sync-municipal`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        await user.click(
            screen.getByRole("button", { name: /sincronizar feriados municipais/i })
        );

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i);
        });
    });

    it("shows error toast when creating holiday fails", async () => {
        server.use(
            http.post(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await user.click(screen.getByRole("button", { name: /novo feriado/i }));

        await user.type(
            screen.getByPlaceholderText(/consciência negra/i),
            "Feriado Teste"
        );

        const dateInput = document.querySelector("input[type='date']");
        await user.type(dateInput, "2026-12-25");

        await user.click(screen.getByRole("button", { name: /criar feriado/i }));

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i);
        });
    });

    it("closes holiday modal via Cancelar button", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /\+ novo feriado/i }));
        await user.click(screen.getByRole("button", { name: /\+ novo feriado/i }));

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/consciência negra/i)).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /^cancelar$/i }));

        await waitFor(() =>
            expect(screen.queryByPlaceholderText(/consciência negra/i)).not.toBeInTheDocument()
        );
    });

    it("changes holiday type in modal", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));
        await waitFor(() => screen.getByRole("button", { name: /\+ novo feriado/i }));
        await user.click(screen.getByRole("button", { name: /\+ novo feriado/i }));

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/consciência negra/i)).toBeInTheDocument()
        );

        const typeSelect = screen.getAllByRole("combobox").at(-1);
        await user.selectOptions(typeSelect, "municipal");
        expect(typeSelect).toHaveValue("municipal");
    });

    it("shows error toast when holidays fail to load", async () => {
        server.use(
            http.get(`${BASE}/admin/holidays`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /feriados/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });

});

// ─── Blocked Dates Tab ────────────────────────────────────────────────────────

describe("Admin - Blocked Dates tab", () => {
    it("shows empty state when no blocked dates", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhuma data bloqueada/i)).toBeInTheDocument()
        );
    });

    it("shows blocked dates list when data is loaded", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "bd-1",
                            venueId: "venue-1",
                            venue: { name: "Salão" },
                            startDate: "2026-05-01T00:00:00.000Z",
                            endDate: "2026-05-03T23:59:59.000Z",
                            reason: "Manutenção",
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));

        await waitFor(() =>
            expect(screen.getByText("Salão")).toBeInTheDocument()
        );
        expect(screen.getByText("Manutenção")).toBeInTheDocument();
    });

    it("shows '—' for reason when reason is null", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "bd-2",
                            venueId: "venue-1",
                            venue: { name: "Salão" },
                            startDate: "2026-06-01T00:00:00.000Z",
                            endDate: "2026-06-02T23:59:59.000Z",
                            reason: null,
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));

        await waitFor(() =>
            expect(screen.getByText("Salão")).toBeInTheDocument()
        );
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("shows venueId when venue object is null", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "bd-3",
                            venueId: "venue-xyz",
                            venue: null,
                            startDate: "2026-07-01T00:00:00.000Z",
                            endDate: "2026-07-02T23:59:59.000Z",
                            reason: "Reforma",
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));

        await waitFor(() =>
            expect(screen.getByText("venue-xyz")).toBeInTheDocument()
        );
    });

    it("opens and closes the create modal via Cancelar button", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /bloquear período/i }));

        await user.click(screen.getByRole("button", { name: /bloquear período/i }));
        expect(screen.getByText(/bloquear período/i, { selector: "h2, h3, [class*='ModalTitle']" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^cancelar$/i }));
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^cancelar$/i })).not.toBeInTheDocument()
        );
    });

    it("closes modal when clicking the overlay", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /bloquear período/i }));

        await user.click(screen.getByRole("button", { name: /bloquear período/i }));
        const cancelButton = await screen.findByRole("button", { name: /^cancelar$/i });

        // Click the overlay (parent of ModalBox)
        const overlay = cancelButton.closest("form")?.parentElement?.parentElement;
        if (overlay) {
            const { fireEvent: fe } = await import("@testing-library/react");
            fe.click(overlay);
        }

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^cancelar$/i })).not.toBeInTheDocument()
        );
    });

    it("creates a blocked date successfully", async () => {
        server.use(
            http.post(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({ success: true, data: { id: "bd-new" } }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /bloquear período/i }));

        await user.click(screen.getByRole("button", { name: /bloquear período/i }));
        await screen.findByRole("button", { name: /^cancelar$/i });

        // Fill datetime-local inputs
        const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
        const { fireEvent: fe } = await import("@testing-library/react");
        fe.change(dateInputs[0], { target: { value: "2026-05-01T08:00" } });
        fe.change(dateInputs[1], { target: { value: "2026-05-03T20:00" } });

        await user.type(screen.getByPlaceholderText(/manutenção da piscina/i), "Manutenção");

        // Submit (the button inside the modal form)
        const submitBtn = screen.getAllByRole("button", { name: /bloquear período/i }).find(
            (btn) => btn.type === "submit"
        );
        await user.click(submitBtn);

        await waitFor(() =>
            expect(screen.getByText(/data bloqueada criada com sucesso/i)).toBeInTheDocument()
        );
    });

    it("deletes a blocked date", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "bd-del",
                            venueId: "venue-1",
                            venue: { name: "Salão" },
                            startDate: "2026-08-01T00:00:00.000Z",
                            endDate: "2026-08-02T00:00:00.000Z",
                            reason: "Evento privado",
                        },
                    ],
                })
            ),
            http.delete(`${BASE}/blocked-dates/bd-del`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /^remover$/i }));

        await user.click(screen.getByRole("button", { name: /^remover$/i }));
        await waitFor(() =>
            expect(screen.queryByText("Evento privado")).not.toBeInTheDocument()
        );
    });

    it("shows error toast when blocked dates fail to load", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });

    it("shows error toast when creating blocked date fails", async () => {
        server.use(
            http.post(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /bloquear período/i }));

        await user.click(screen.getByRole("button", { name: /bloquear período/i }));
        await screen.findByRole("button", { name: /^cancelar$/i });

        const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
        const { fireEvent: fe } = await import("@testing-library/react");
        fe.change(dateInputs[0], { target: { value: "2026-05-01T08:00" } });
        fe.change(dateInputs[1], { target: { value: "2026-05-03T20:00" } });

        const submitBtn = screen.getAllByRole("button", { name: /bloquear período/i }).find(
            (btn) => btn.type === "submit"
        );
        await user.click(submitBtn);

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i)
        );
    });

    it("shows error toast when deleting blocked date fails", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "bd-err",
                            venueId: "venue-1",
                            venue: { name: "Salão" },
                            startDate: "2026-09-01T00:00:00.000Z",
                            endDate: "2026-09-02T00:00:00.000Z",
                            reason: "Fechado",
                        },
                    ],
                })
            ),
            http.delete(`${BASE}/blocked-dates/bd-err`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^datas bloqueadas$/i }));
        await waitFor(() => screen.getByRole("button", { name: /^remover$/i }));

        await user.click(screen.getByRole("button", { name: /^remover$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i)
        );
    });
});

// ─── Plans Tab ────────────────────────────────────────────────────────────────

describe("Admin - Plans tab", () => {
    it("shows empty state when no plans", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhum plano cadastrado/i)).toBeInTheDocument()
        );
    });

    it("shows plans list when data is loaded", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "p-1",
                            code: "ESSENCIAL",
                            name: "Plano Essencial",
                            basePriceAmount: 2500,
                            partyDurationHours: 6,
                            venueId: null,
                            venue: null,
                            includesPool: false,
                            includesCleaning: true,
                            validOnHolidays: false,
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));

        await waitFor(() =>
            expect(screen.getByText("Plano Essencial")).toBeInTheDocument()
        );
        expect(screen.getByText("ESSENCIAL")).toBeInTheDocument();
        expect(screen.getByText("Global")).toBeInTheDocument();
        expect(screen.getByText("6h")).toBeInTheDocument();
    });

    it("shows venue name when plan has venue", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "p-2",
                            code: "COMPLETA",
                            name: "Plano Completo",
                            basePriceAmount: 5000,
                            partyDurationHours: 8,
                            venueId: "venue-1",
                            venue: { name: "Salão Principal" },
                            includesPool: true,
                            includesCleaning: true,
                            validOnHolidays: true,
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));

        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );
    });

    it("opens create modal and closes via Cancelar", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /novo plano/i }));

        await user.click(screen.getByRole("button", { name: /novo plano/i }));
        expect(screen.getByText(/novo plano/i, { selector: "h2, h3, [class*='ModalTitle']" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^cancelar$/i }));
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^cancelar$/i })).not.toBeInTheDocument()
        );
    });

    it("closes modal via overlay click", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /novo plano/i }));

        await user.click(screen.getByRole("button", { name: /novo plano/i }));
        const cancelBtn = await screen.findByRole("button", { name: /^cancelar$/i });

        const overlay = cancelBtn.closest("form")?.parentElement?.parentElement;
        if (overlay) {
            const { fireEvent: fe } = await import("@testing-library/react");
            fe.click(overlay);
        }

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^cancelar$/i })).not.toBeInTheDocument()
        );
    });

    it("creates a plan successfully", async () => {
        server.use(
            http.post(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: true, data: { id: "p-new", name: "Novo Plano" } }, { status: 201 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /novo plano/i }));

        await user.click(screen.getByRole("button", { name: /novo plano/i }));
        await screen.findByRole("button", { name: /^cancelar$/i });

        await user.type(screen.getByPlaceholderText(/pacote essencial/i), "Plano Teste");
        await user.type(screen.getByPlaceholderText(/ex: 2500.00/i), "2500");
        await user.type(screen.getByPlaceholderText(/ex: 6/i), "6");

        await user.click(screen.getByRole("button", { name: /^criar plano$/i }));

        await waitFor(() =>
            expect(screen.getByText(/plano criado/i)).toBeInTheDocument()
        );
    });

    it("opens edit modal with plan data and updates plan", async () => {
        const plan = {
            id: "p-edit",
            code: "ESSENCIAL",
            name: "Plano Original",
            basePriceAmount: 2000,
            partyDurationHours: 5,
            endsAtHour: 22,
            keyDeliveryOffsetHours: 2,
            includedKidsMonitorHours: 4,
            venueId: null,
            venue: null,
            includesPool: false,
            includesCleaning: false,
            validOnHolidays: false,
        };
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: true, data: [plan] })
            ),
            http.put(`${BASE}/admin/plans/p-edit`, () =>
                HttpResponse.json({ success: true, data: { ...plan, name: "Plano Editado" } })
            ),
            http.patch(`${BASE}/admin/plans/p-edit`, () =>
                HttpResponse.json({ success: true, data: { ...plan, name: "Plano Editado" } })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /^editar$/i }));

        await user.click(screen.getByRole("button", { name: /^editar$/i }));
        expect(screen.getByText(/editar plano/i, { selector: "h2, h3, [class*='ModalTitle']" })).toBeInTheDocument();

        // Code select should be disabled in edit mode
        const codeSelect = screen.getAllByRole("combobox").find(
            (el) => el.disabled
        );
        expect(codeSelect).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

        await waitFor(() =>
            expect(screen.getByText(/plano atualizado/i)).toBeInTheDocument()
        );
    });

    it("deletes a plan", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "p-del",
                            code: "PROMOCIONAL",
                            name: "Plano a Remover",
                            basePriceAmount: 1000,
                            partyDurationHours: 4,
                            venueId: null,
                            venue: null,
                            includesPool: false,
                            includesCleaning: false,
                            validOnHolidays: false,
                        },
                    ],
                })
            ),
            http.delete(`${BASE}/admin/plans/p-del`, () =>
                HttpResponse.json({ success: true, data: {} })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByText("Plano a Remover"));

        await user.click(screen.getByRole("button", { name: /^remover$/i }));
        await waitFor(() =>
            expect(screen.queryByText("Plano a Remover")).not.toBeInTheDocument()
        );
    });

    it("toggles checkboxes in the create modal", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /novo plano/i }));

        await user.click(screen.getByRole("button", { name: /novo plano/i }));
        await screen.findByRole("button", { name: /^cancelar$/i });

        const poolCheckbox = screen.getByRole("checkbox", { name: /inclui piscina/i });
        const cleaningCheckbox = screen.getByRole("checkbox", { name: /inclui limpeza/i });
        const holidaysCheckbox = screen.getByRole("checkbox", { name: /válido em feriados/i });

        expect(poolCheckbox).not.toBeChecked();
        await user.click(poolCheckbox);
        expect(poolCheckbox).toBeChecked();

        await user.click(cleaningCheckbox);
        expect(cleaningCheckbox).toBeChecked();

        await user.click(holidaysCheckbox);
        expect(holidaysCheckbox).toBeChecked();
    });

    it("shows error toast when plans fail to load", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });

    it("shows error toast when creating plan fails", async () => {
        server.use(
            http.post(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /novo plano/i }));

        await user.click(screen.getByRole("button", { name: /novo plano/i }));
        await screen.findByRole("button", { name: /^cancelar$/i });

        await user.type(screen.getByPlaceholderText(/pacote essencial/i), "Plano Erro");
        await user.type(screen.getByPlaceholderText(/ex: 2500.00/i), "1000");
        await user.type(screen.getByPlaceholderText(/ex: 6/i), "4");

        await user.click(screen.getByRole("button", { name: /^criar plano$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i)
        );
    });

    it("shows error toast when deleting plan fails", async () => {
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "p-err",
                            code: "ESSENCIAL",
                            name: "Plano com Erro",
                            basePriceAmount: 2000,
                            partyDurationHours: 6,
                            venueId: null,
                            venue: null,
                            includesPool: false,
                            includesCleaning: false,
                            validOnHolidays: false,
                        },
                    ],
                })
            ),
            http.delete(`${BASE}/admin/plans/p-err`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByText("Plano com Erro"));

        await user.click(screen.getByRole("button", { name: /^remover$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i)
        );
    });

    it("shows error toast when updating plan fails", async () => {
        const plan = {
            id: "p-upd-err",
            code: "ESSENCIAL",
            name: "Plano Update Fail",
            basePriceAmount: 2000,
            partyDurationHours: 5,
            endsAtHour: null,
            keyDeliveryOffsetHours: null,
            includedKidsMonitorHours: null,
            venueId: null,
            venue: null,
            includesPool: false,
            includesCleaning: false,
            validOnHolidays: false,
        };
        server.use(
            http.get(`${BASE}/admin/plans`, () =>
                HttpResponse.json({ success: true, data: [plan] })
            ),
            http.put(`${BASE}/admin/plans/p-upd-err`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            ),
            http.patch(`${BASE}/admin/plans/p-upd-err`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^planos$/i }));
        await waitFor(() => screen.getByRole("button", { name: /^editar$/i }));

        await user.click(screen.getByRole("button", { name: /^editar$/i }));
        await screen.findByRole("button", { name: /salvar alterações/i });

        await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/500/i)
        );
    });
});

// ─── Users Tab ────────────────────────────────────────────────────────────────

describe("Admin - Users tab", () => {
    it("shows empty state when no users", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument()
        );
    });

    it("shows user list when data is loaded", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "u-1",
                            name: "João",
                            email: "joao@email.com",
                            phone: "11999999999",
                            role: "USER",
                            createdAt: "2026-01-01T00:00:00.000Z",
                            _count: { reservations: 3 },
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));

        await waitFor(() =>
            expect(screen.getByText("João")).toBeInTheDocument()
        );
        expect(screen.getByText("joao@email.com")).toBeInTheDocument();
        expect(screen.getByText("11999999999")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows '—' for phone when phone is null", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "u-2",
                            name: "Maria",
                            email: "maria@email.com",
                            phone: null,
                            role: "ADMIN",
                            createdAt: "2026-02-01T00:00:00.000Z",
                            _count: { reservations: 0 },
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));

        await waitFor(() =>
            expect(screen.getByText("Maria")).toBeInTheDocument()
        );
        expect(screen.getByText("—")).toBeInTheDocument();
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
    });

    it("searches for users by submitting the search form", async () => {
        let capturedUrl = "";
        server.use(
            http.get(`${BASE}/admin/users`, ({ request }) => {
                capturedUrl = request.url;
                return HttpResponse.json({ success: true, data: [] });
            })
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));
        await waitFor(() =>
            expect(screen.getByPlaceholderText(/buscar por nome ou e-mail/i)).toBeInTheDocument()
        );

        await user.type(screen.getByPlaceholderText(/buscar por nome ou e-mail/i), "João");
        await user.click(screen.getByRole("button", { name: /^buscar$/i }));

        await waitFor(() =>
            expect(capturedUrl).toContain("search=Jo%C3%A3o")
        );
    });

    it("clears search when clicking Limpar button", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));
        await waitFor(() =>
            expect(screen.getByPlaceholderText(/buscar por nome ou e-mail/i)).toBeInTheDocument()
        );

        const searchInput = screen.getByPlaceholderText(/buscar por nome ou e-mail/i);
        await user.type(searchInput, "João");
        await user.click(screen.getByRole("button", { name: /^buscar$/i }));

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^limpar$/i })).toBeInTheDocument()
        );

        await user.click(screen.getByRole("button", { name: /^limpar$/i }));

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^limpar$/i })).not.toBeInTheDocument()
        );
        expect(searchInput).toHaveValue("");
    });

    it("shows Anterior disabled on first page and enables Próxima when hasMore is true", async () => {
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            id: `u-${i}`,
            name: `Usuário ${i}`,
            email: `user${i}@email.com`,
            phone: null,
            role: "USER",
            createdAt: "2026-01-01T00:00:00.000Z",
            _count: { reservations: 0 },
        }));
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({ success: true, data: manyUsers })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));

        await waitFor(() =>
            expect(screen.getByText("Usuário 0")).toBeInTheDocument()
        );

        expect(screen.getByRole("button", { name: /^anterior$/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /^próxima$/i })).not.toBeDisabled();
    });

    it("navigates to next page when clicking Próxima", async () => {
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            id: `u-${i}`,
            name: `Usuário ${i}`,
            email: `user${i}@email.com`,
            phone: null,
            role: "USER",
            createdAt: "2026-01-01T00:00:00.000Z",
            _count: { reservations: 0 },
        }));
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({ success: true, data: manyUsers })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));
        await waitFor(() => screen.getByText("Usuário 0"));

        await user.click(screen.getByRole("button", { name: /^próxima$/i }));

        await waitFor(() =>
            expect(screen.getByText(/página 2/i)).toBeInTheDocument()
        );
    });

    it("navigates back to page 1 when clicking Anterior from page 2", async () => {
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            id: `u-${i}`,
            name: `Usuário ${i}`,
            email: `user${i}@email.com`,
            phone: null,
            role: "USER",
            createdAt: "2026-01-01T00:00:00.000Z",
            _count: { reservations: 0 },
        }));
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({ success: true, data: manyUsers })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));
        await waitFor(() => screen.getByText("Usuário 0"));

        await user.click(screen.getByRole("button", { name: /^próxima$/i }));
        await waitFor(() => screen.getByText(/página 2/i));

        await user.click(screen.getByRole("button", { name: /^anterior$/i }));
        await waitFor(() =>
            expect(screen.getByText(/página 1/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when users fail to load", async () => {
        server.use(
            http.get(`${BASE}/admin/users`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByText(/total de reservas/i));

        await user.click(screen.getByRole("button", { name: /^usuários$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });
});

// ─── Negotiations Tab ─────────────────────────────────────────────────────────

describe("Admin - Negotiations tab", () => {
    it("shows empty state when there are no negotiations", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getByText(/nenhuma negociação encontrada/i)).toBeInTheDocument()
        );
    });

    it("shows negotiations list with status badge", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "neg-1",
                            subject: "Reserva especial",
                            status: "OPEN",
                            user: { id: "u-1", name: "Mateus", email: "m@email.com" },
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getByText("Reserva especial")).toBeInTheDocument()
        );
        expect(screen.getAllByText("Aberta").length).toBeGreaterThan(0);
        expect(screen.getByText("m@email.com")).toBeInTheDocument();
    });

    it("shows '—' when negotiation user is absent", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "neg-2",
                            subject: "Sem usuário",
                            status: "CLOSED",
                            user: null,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getAllByText("—").length).toBeGreaterThan(0)
        );
    });

    it("filters negotiations by status", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { id: "neg-1", subject: "Open neg", status: "OPEN", user: { name: "A", email: "a@e.com" }, createdAt: new Date().toISOString() },
                        { id: "neg-2", subject: "Closed neg", status: "CLOSED", user: { name: "B", email: "b@e.com" }, createdAt: new Date().toISOString() },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getByText("Open neg")).toBeInTheDocument()
        );
        const selects = screen.getAllByRole("combobox");
        await user.selectOptions(selects[0], "CLOSED");
        expect(screen.queryByText("Open neg")).not.toBeInTheDocument();
        expect(screen.getByText("Closed neg")).toBeInTheDocument();
    });

    it("shows error toast when negotiations load fails", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar negociações." }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar negociações/i)).toBeInTheDocument()
        );
    });

    it("shows unknown status as raw value", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { id: "neg-3", subject: "Unknown", status: "SOME_NEW_STATUS", user: { name: "C", email: "c@e.com" }, createdAt: new Date().toISOString() },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /negociações/i }));
        await waitFor(() =>
            expect(screen.getByText("SOME_NEW_STATUS")).toBeInTheDocument()
        );
    });
});
