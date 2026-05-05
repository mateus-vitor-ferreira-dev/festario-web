import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import Referrals from "../../pages/Referrals";
import { server } from "../mocks/server";

function renderPage() {
    return render(
        <MemoryRouter>
            <Referrals />
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Referrals page", () => {
    afterEach(() => localStorage.clear());

    it("shows loading state then empty list", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/você ainda não fez nenhuma indicação/i)).toBeInTheDocument()
        );
    });

    it("shows referral list when data is returned", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "ref-1",
                            referredEmail: "amigo@email.com",
                            status: "PENDING",
                            createdAt: "2026-01-01T00:00:00.000Z",
                            campaign: { name: "Indique um amigo" },
                        },
                    ],
                })
            )
        );

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("amigo@email.com")).toBeInTheDocument()
        );
        expect(screen.getByText("Aguardando")).toBeInTheDocument();
    });

    it("sends invite and refreshes the list on success", async () => {
        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/e-mail do amigo/i)).toBeInTheDocument()
        );

        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /indicar/i }));

        await waitFor(() =>
            expect(screen.getByText(/indicação enviada com sucesso/i)).toBeInTheDocument()
        );
    });

    it("shows no-campaign banner when backend returns NO_ACTIVE_REFERRAL_CAMPAIGN", async () => {
        server.use(
            http.post("http://localhost:3000/referrals", () =>
                HttpResponse.json(
                    { success: false, error: { code: "NO_ACTIVE_REFERRAL_CAMPAIGN", message: "No active campaign" } },
                    { status: 422 }
                )
            )
        );

        const user = userEvent.setup();
        renderPage();

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/e-mail do amigo/i)).toBeInTheDocument()
        );

        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /indicar/i }));

        await waitFor(() =>
            expect(screen.getByText(/não há uma campanha de indicação ativa/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when loading referrals fails", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({ success: false, message: "Erro ao carregar indicações." }, { status: 500 })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument()
        );
    });

    it("shows generic error toast when invite fails with unknown error", async () => {
        server.use(
            http.post("http://localhost:3000/referrals", () =>
                HttpResponse.json({ success: false, error: { code: "OTHER_ERROR", message: "Erro genérico." } }, { status: 500 })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByPlaceholderText(/e-mail do amigo/i)).toBeInTheDocument()
        );
        await user.type(screen.getByPlaceholderText(/e-mail do amigo/i), "amigo@email.com");
        await user.click(screen.getByRole("button", { name: /indicar/i }));
        await waitFor(() =>
            expect(screen.getByText(/erro genérico/i)).toBeInTheDocument()
        );
    });

    it("handles null data from listReferrals without crashing", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({ success: true, data: null })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/você ainda não fez nenhuma indicação/i)).toBeInTheDocument()
        );
    });

    it("ignores form submit when email is empty (defensive early return)", async () => {
        const postMock = vi.fn(() =>
            HttpResponse.json({ success: true }, { status: 201 })
        );
        server.use(http.post("http://localhost:3000/referrals", postMock));

        const { container } = renderPage();
        await waitFor(() =>
            expect(container.querySelector("form")).toBeInTheDocument()
        );
        fireEvent.submit(container.querySelector("form"));
        await new Promise((r) => setTimeout(r, 100));
        expect(postMock).not.toHaveBeenCalled();
    });

    it("shows raw status string for unknown referral status", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "ref-x",
                            referredEmail: "amigo@email.com",
                            status: "UNKNOWN_STATUS",
                            createdAt: "2026-01-01T00:00:00.000Z",
                            campaign: { name: "Campanha X" },
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

    it("shows REWARDED status badge correctly", async () => {
        server.use(
            http.get("http://localhost:3000/referrals", () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "ref-1",
                            referredEmail: "amigo@email.com",
                            status: "REWARDED",
                            createdAt: "2026-01-01T00:00:00.000Z",
                            campaign: { name: "Indique um amigo" },
                        },
                    ],
                })
            )
        );

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Recompensado")).toBeInTheDocument()
        );
    });
});
