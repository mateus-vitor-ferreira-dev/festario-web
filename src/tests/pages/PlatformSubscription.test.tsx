import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Platform from "../../pages/Platform";
import TenantDetail from "../../pages/Platform/TenantDetail";
import { mockSubscription, mockTenants } from "../mocks/handlers";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderAt(url: string) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "admin-1", name: "Admin", email: "a@a.com", role: "ADMIN" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/plataforma" element={<Platform />} />
                    <Route path="/plataforma/espacos/:slug" element={<TenantDetail />} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const suspended = { ...mockSubscription, billingEnabled: true, status: "SUSPENSA", readOnly: true, inTrial: false, nextDueDate: "2026-12-10", overdueDays: 9 };

beforeEach(() => localStorage.clear());

describe("Plataforma: situação da cobrança", () => {
    it("coluna Cobrança com o selo e o vencimento", async () => {
        server.use(http.get(`${BASE}/platform/tenants`, () => HttpResponse.json({
            data: [{ ...mockTenants[0], subscription: suspended }, { ...mockTenants[1], subscription: { ...mockSubscription, billingEnabled: false } }],
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        })));
        renderAt("/plataforma");
        expect(await screen.findByRole("columnheader", { name: "Cobrança" })).toBeInTheDocument();
        const row = screen.getByRole("row", { name: /Salão Jardim das Flores/ });
        expect(within(row).getByText("Só para consulta")).toBeInTheDocument();
        expect(within(row).getByText("venceu 10/12/2026")).toBeInTheDocument();
        expect(within(screen.getByRole("row", { name: /Recanto Vila Rica/ })).getByLabelText("Cobrança desligada")).toBeInTheDocument();
    });

    it("detalhe: marca como pago por fora e o painel volta ao normal", async () => {
        let note: unknown;
        server.use(
            http.get(`${BASE}/platform/tenants/:id/subscription`, () => HttpResponse.json({ data: suspended })),
            http.post(`${BASE}/platform/tenants/:id/subscription/mark-paid`, async ({ request }) => {
                note = await request.json();
                return HttpResponse.json({
                    data: {
                        ...suspended, status: "ATIVA", readOnly: false, overdueDays: 0, nextDueDate: "2027-01-10",
                        charges: [{ id: "c1", dueDate: "2026-12-10", amountCents: 10000, status: "PAGA", method: "MANUAL", paidAt: "2026-12-19T12:00:00Z", note: "Pix direto" }],
                    },
                });
            }),
        );
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");

        const section = await screen.findByRole("region", { name: "Assinatura" });
        expect(await within(section).findByText("Só para consulta", { selector: "span" })).toBeInTheDocument();
        await user.click(within(section).getByRole("button", { name: "Marcar como pago" }));
        const dialog = screen.getByRole("dialog", { name: "Registrar pagamento feito por fora" });
        await user.type(within(dialog).getByLabelText("Observação (opcional)"), "Pix direto");
        await user.click(within(dialog).getByRole("button", { name: "Marcar como pago" }));

        expect(await within(section).findByText("Em dia")).toBeInTheDocument();
        expect(note).toEqual({ note: "Pix direto" });
        expect(within(section).getByText("Pago por fora")).toBeInTheDocument();
        expect(within(section).getByText("Normal")).toBeInTheDocument();
    });

    it("detalhe: estende o teste até uma data", async () => {
        const trial = { ...mockSubscription, billingEnabled: true, nextDueDate: "2026-11-20" };
        let until: unknown;
        server.use(
            http.get(`${BASE}/platform/tenants/:id/subscription`, () => HttpResponse.json({ data: trial })),
            http.post(`${BASE}/platform/tenants/:id/subscription/extend`, async ({ request }) => {
                until = ((await request.json()) as { until: string }).until;
                return HttpResponse.json({ data: { ...trial, nextDueDate: until } });
            }),
        );
        const user = userEvent.setup();
        renderAt("/plataforma/espacos/salao-jardim-das-flores");

        const section = await screen.findByRole("region", { name: "Assinatura" });
        await user.click(await within(section).findByRole("button", { name: "Estender teste" }));
        const dialog = screen.getByRole("dialog", { name: "Estender o teste" });
        const input = within(dialog).getByLabelText("Nova data");
        await user.clear(input);
        await user.type(input, "2027-01-15");
        await user.click(within(dialog).getByRole("button", { name: "Estender teste" }));

        expect(until).toBe("2027-01-15");
        expect(await within(section).findByText("15/01/2027")).toBeInTheDocument();
    });
});
