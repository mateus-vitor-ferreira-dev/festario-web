import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import { subscriptionSummary } from "../../utils/subscription";
import { mockSubscription } from "../mocks/handlers";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function LocationProbe() {
    const l = useLocation();
    return <div data-testid="location">{l.pathname}{l.search}</div>;
}

function renderPanel(path = "/painel?tab=subscription") {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "d@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes><Route path="/painel" element={<Admin />} /></Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const subscription = (over: Record<string, unknown>) =>
    server.use(http.get(`${BASE}/tenant/subscription`, () => HttpResponse.json({ data: { ...mockSubscription, billingEnabled: true, ...over } })));

beforeEach(() => localStorage.clear());

describe("Aba Assinatura do painel", () => {
    it("aparece na barra de abas", async () => {
        renderPanel("/painel");
        expect(await screen.findByRole("button", { name: "Assinatura" })).toBeInTheDocument();
    });

    it("cobrança desligada: só informa, sem botão de autorizar", async () => {
        renderPanel();
        expect(await screen.findByRole("heading", { name: "Seu mês grátis vai até 31/12/2099." })).toBeInTheDocument();
        expect(screen.getByText(/A cobrança pelo app ainda não está ligada/)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Gerar autorização" })).not.toBeInTheDocument();
    });

    it("no teste: gera a autorização e mostra o QR Code e o copia e cola", async () => {
        subscription({ nextDueDate: "2026-12-10" });
        let body: unknown;
        server.use(http.post(`${BASE}/tenant/subscription/authorization`, async ({ request }) => {
            body = await request.json();
            return HttpResponse.json({
                data: {
                    ...mockSubscription, billingEnabled: true, status: "AUTORIZACAO_PENDENTE", nextDueDate: "2026-12-10",
                    automaticPayment: { state: "PENDING", payerName: "Maria Dona", payerDocument: "***.982.247-**", code: "00020126580014br.gov.bcb.pix", requestedAt: null, authorizedAt: null },
                },
            }, { status: 201 });
        }));
        const user = userEvent.setup();
        renderPanel();

        expect(await screen.findByRole("heading", { name: "Seu mês grátis vai até 10/12/2026." })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Gerar autorização" }));
        expect(screen.getByText("Informe o nome do titular da conta.")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome de quem paga")).toHaveFocus();

        await user.type(screen.getByLabelText("Nome de quem paga"), "Maria Dona");
        await user.type(screen.getByLabelText("CPF ou CNPJ"), "529.982.247-25");
        await user.click(screen.getByRole("button", { name: "Gerar autorização" }));

        expect(await screen.findByRole("heading", { name: "Aprove o Pix Automático no seu banco" })).toBeInTheDocument();
        expect(body).toEqual({ payerName: "Maria Dona", payerDocument: "529.982.247-25" });
        expect(screen.getByLabelText("Código Pix Copia e Cola")).toHaveValue("00020126580014br.gov.bcb.pix");
        expect(await screen.findByAltText("QR Code para autorizar o Pix Automático")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Falta aprovar o Pix Automático no seu banco." })).toBeInTheDocument();
    });

    it("em dia com Pix Automático: próxima cobrança e histórico", async () => {
        subscription({
            status: "ATIVA", inTrial: false, nextDueDate: "2027-01-10",
            automaticPayment: { state: "APPROVED", payerName: "Maria Dona", payerDocument: "***.982.247-**", requestedAt: null, authorizedAt: "2026-12-01T10:00:00Z" },
            charges: [{ id: "c1", dueDate: "2026-12-10", amountCents: 10000, status: "PAGA", method: "PIX_AUTOMATICO", paidAt: "2026-12-10T12:00:00Z" }],
        });
        renderPanel();
        expect(await screen.findByRole("heading", { name: "Sua assinatura está em dia." })).toBeInTheDocument();
        expect(screen.getByText(/vence em 10\/01\/2027 e é debitada pelo Pix Automático/)).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Pix Automático autorizado" })).toBeInTheDocument();
        const row = screen.getByRole("row", { name: /10\/12\/2026/ });
        expect(within(row).getByText("Paga")).toBeInTheDocument();
        expect(within(row).getByText("Pix Automático")).toBeInTheDocument();
    });

    it("em atraso: diz até quando e mostra os dias de tolerância", async () => {
        subscription({ status: "EM_ATRASO", nextDueDate: "2026-12-10", overdueDays: 3, graceEndsOn: "2026-12-17" });
        renderPanel();
        expect(await screen.findByRole("heading", { name: "A cobrança de 10/12/2026 ainda não foi paga." })).toBeInTheDocument();
        expect(screen.getByText("3 de 7 dias de tolerância usados. Último dia: 17/12/2026.")).toBeInTheDocument();
        expect(screen.getByText(/Fale com a equipe do Festário/)).toBeInTheDocument();
    });
});

describe("Aviso da assinatura no topo do painel", () => {
    it("somente leitura: avisa em todas as abas e leva para a Assinatura", async () => {
        subscription({ status: "SUSPENSA", readOnly: true, nextDueDate: "2026-12-10", overdueDays: 9 });
        const user = userEvent.setup();
        renderPanel("/painel?tab=reservations");
        const alert = await screen.findByRole("alert");
        expect(within(alert).getByRole("heading", { name: "Painel só para consulta" })).toBeInTheDocument();
        expect(within(alert).getByText(/Reservas e clientes seguem normais/)).toBeInTheDocument();
        await user.click(within(alert).getByRole("button", { name: "Regularizar assinatura" }));
        expect(screen.getByTestId("location")).toHaveTextContent("/painel?tab=subscription");
        expect(await screen.findByRole("heading", { name: "O painel está só para consulta." })).toBeInTheDocument();
    });

    it("teste acabando sem Pix Automático: lembra de autorizar", async () => {
        subscription({ status: "TRIAL", daysUntilDue: 3, nextDueDate: "2026-12-10" });
        renderPanel("/painel?tab=reservations");
        expect(await screen.findByRole("heading", { name: "Seu mês grátis acaba em 3 dias" })).toBeInTheDocument();
    });

    it("cobrança desligada: nenhum aviso", async () => {
        renderPanel("/painel?tab=reservations");
        expect(await screen.findByRole("heading", { name: "Painel do espaço" })).toBeInTheDocument();
        await new Promise((r) => setTimeout(r, 50));
        expect(screen.queryByRole("heading", { name: /Painel só para consulta|mês grátis acaba|atrasado/ })).not.toBeInTheDocument();
    });

    it("bloqueio da API vira mensagem em português simples", async () => {
        const { getErrorMessage } = await import("../../utils/getErrorMessage");
        const err = { response: { status: 403, data: { error: { code: "SUBSCRIPTION_READ_ONLY", message: "x" } } } };
        expect(getErrorMessage(err)).toMatch(/só para consulta/);
    });
});

describe("resumo da plataforma", () => {
    it("selo e vencimento", () => {
        expect(subscriptionSummary({ ...mockSubscription, status: "SUSPENSA", nextDueDate: "2026-12-10" } as never)).toEqual({ label: "Só para consulta", tone: "error", detail: "venceu 10/12/2026" });
        expect(subscriptionSummary({ ...mockSubscription, status: "ATIVA", nextDueDate: "2027-01-10" } as never)).toEqual({ label: "Em dia", tone: "paid", detail: "vence 10/01/2027" });
        expect(subscriptionSummary(undefined)).toBeNull();
    });
});
