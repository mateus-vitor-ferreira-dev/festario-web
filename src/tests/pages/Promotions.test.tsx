import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Promotions from "../../pages/Promotions";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Promotions />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

const activeReferralStatus = [
    { type: "REFERRAL_NEXT_BOOKING", status: "active", campaign: { id: "c1", name: "Referral", startsAt: "2026-01-01", endsAt: "2026-12-31" } },
    { type: "LOYALTY_ALWAYS_HERE", status: "not_configured", campaign: null },
    { type: "RAFFLE_VIP", status: "not_configured", campaign: null },
];

describe("Promotions page", () => {
    it("renders all three campaign titles after loading", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getAllByText(/indique e ganhe/i).length).toBeGreaterThanOrEqual(1)
        );
        expect(screen.getAllByText(/programa de fidelidade/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/sorteio vip/i).length).toBeGreaterThanOrEqual(1);
    });

    it("shows 'Indisponível' for not_configured campaigns", async () => {
        renderPage();
        await waitFor(() => screen.getByText(/indique e ganhe/i));
        const badges = screen.getAllByText(/indisponível/i);
        expect(badges.length).toBeGreaterThanOrEqual(3);
    });

    it("toggles expand hint text when unavailable campaign is clicked", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getAllByText(/ver motivo/i).length > 0);

        expect(screen.getAllByText(/ver motivo/i).length).toBeGreaterThanOrEqual(1);
        await user.click(screen.getAllByText(/ver motivo/i)[0]);

        await waitFor(() =>
            expect(screen.getAllByText(/ocultar detalhes/i).length).toBeGreaterThanOrEqual(1)
        );
    });

    it("shows 'Ativa' badge when a campaign is active", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({ success: true, data: activeReferralStatus })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Ativa")).toBeInTheDocument()
        );
    });

    it("shows invite form when referral campaign is active", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({ success: true, data: activeReferralStatus })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByPlaceholderText(/e-mail do amigo/i)).toBeInTheDocument()
        );
    });

    it("sends referral invite and shows success toast", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({ success: true, data: activeReferralStatus })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByPlaceholderText(/e-mail do amigo/i));

        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /^indicar$/i }));

        await waitFor(() =>
            expect(screen.getByText(/indicação enviada com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows no-campaign banner when referral campaign is not active", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({ success: true, data: activeReferralStatus })
            ),
            http.post(`${BASE}/referrals`, () =>
                HttpResponse.json(
                    { success: false, error: { code: "NO_ACTIVE_REFERRAL_CAMPAIGN", message: "No campaign" } },
                    { status: 422 }
                )
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByPlaceholderText(/e-mail do amigo/i));

        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /^indicar$/i }));

        await waitFor(() =>
            expect(screen.getByText(/nenhuma campanha de indicação ativa/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when invite fails with generic error", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({ success: true, data: activeReferralStatus })
            ),
            http.post(`${BASE}/referrals`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getByPlaceholderText(/e-mail do amigo/i));

        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /^indicar$/i }));

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument()
        );
    });

    it("shows empty grants message when user has no grants", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/você ainda não tem descontos/i)).toBeInTheDocument()
        );
    });

    it("shows referral in list when user has referrals", async () => {
        server.use(
            http.get(`${BASE}/referrals`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{
                        id: "ref-1",
                        referredEmail: "amigo@email.com",
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                        campaign: { name: "Referral" },
                    }],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("amigo@email.com")).toBeInTheDocument()
        );
        expect(screen.getByText(/aguardando reserva do amigo/i)).toBeInTheDocument();
    });

    it("shows disabled reason when campaign status is 'disabled'", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { type: "REFERRAL_NEXT_BOOKING", status: "disabled", campaign: { id: "c1" } },
                        { type: "LOYALTY_ALWAYS_HERE", status: "not_configured", campaign: null },
                        { type: "RAFFLE_VIP", status: "not_configured", campaign: null },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getAllByText(/ver motivo/i));

        await user.click(screen.getAllByText(/ver motivo/i)[0]);

        await waitFor(() =>
            expect(screen.getByText(/temporariamente desativada/i)).toBeInTheDocument()
        );
    });

    it("shows scheduled reason when campaign status is 'scheduled'", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            type: "REFERRAL_NEXT_BOOKING",
                            status: "scheduled",
                            campaign: { id: "c1", startsAt: "2027-06-01T00:00:00.000Z" },
                        },
                        { type: "LOYALTY_ALWAYS_HERE", status: "not_configured", campaign: null },
                        { type: "RAFFLE_VIP", status: "not_configured", campaign: null },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getAllByText(/ver motivo/i));

        await user.click(screen.getAllByText(/ver motivo/i)[0]);

        await waitFor(() =>
            expect(screen.getByText(/ainda não começou/i)).toBeInTheDocument()
        );
    });

    it("shows ended reason when campaign status is 'ended'", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            type: "REFERRAL_NEXT_BOOKING",
                            status: "ended",
                            campaign: { id: "c1", endsAt: "2025-01-01T00:00:00.000Z" },
                        },
                        { type: "LOYALTY_ALWAYS_HERE", status: "not_configured", campaign: null },
                        { type: "RAFFLE_VIP", status: "not_configured", campaign: null },
                    ],
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() => screen.getAllByText(/ver motivo/i));

        await user.click(screen.getAllByText(/ver motivo/i)[0]);

        await waitFor(() =>
            expect(screen.getByText(/encerrou em/i)).toBeInTheDocument()
        );
    });

    it("shows instagram link when RAFFLE_VIP is active", async () => {
        server.use(
            http.get(`${BASE}/promotions/status`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        { type: "REFERRAL_NEXT_BOOKING", status: "not_configured", campaign: null },
                        { type: "LOYALTY_ALWAYS_HERE", status: "not_configured", campaign: null },
                        { type: "RAFFLE_VIP", status: "active", campaign: { id: "c2", startsAt: "2026-01-01", endsAt: "2026-12-31" } },
                    ],
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("link", { name: /ir para o instagram/i })).toBeInTheDocument()
        );
    });
});
