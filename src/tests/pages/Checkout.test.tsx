import { render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Checkout from "../../pages/Checkout";
import type { ReservationPayment } from "../../types";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const reservation = {
    id: "res-1a2b3c4d",
    status: "PENDING",
    packageSnapshot: { name: "Sábado à tarde" },
    totalPrice: 1200,
    guestCount: 80,
    startDate: "2026-12-12T17:00:00.000Z",
    endDate: "2026-12-12T22:00:00.000Z",
    venue: { name: "Salão Principal" },
};

function payment(over: Partial<ReservationPayment> = {}, summary: Partial<ReservationPayment["summary"]> = {}): ReservationPayment {
    return {
        reservationId: reservation.id, reservationStatus: "PENDING", mode: "MANUAL",
        summary: { totalCents: 120000, requiredCents: 36000, paidCents: 0, refundedCents: 0, netCents: 0, balanceCents: 120000, missingToConfirmCents: 36000, confirmed: false, ...summary },
        depositCents: 36000, balanceDueAt: "2026-12-05T17:00:00.000Z", confirmBy: "2026-11-20T21:30:00.000Z",
        refundDueCents: null, refundPercentage: null, entries: [],
        instructions: { text: "PIX (chave e-mail): financeiro@exemplo.com.br", whatsapp: "(35) 99999-0000", phone: null, email: "contato@exemplo.com.br", instagram: "@salao" },
        venue: { id: "v1", name: "Salão Principal" }, tenant: { slug: "salao", name: "Salão das Flores" },
        ...over,
    };
}

function mock(res: Record<string, unknown>, pay: ReservationPayment) {
    server.use(
        http.get(`${BASE}/reservations/${reservation.id}`, () => HttpResponse.json({ data: res })),
        http.get(`${BASE}/payments/reservation/${reservation.id}`, () => HttpResponse.json({ data: pay })),
    );
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={[`/checkout/${reservation.id}`]}>
            <Routes>
                <Route path="/checkout/:reservationId" element={<Checkout />} />
                <Route path="/reservations" element={<div>Reservations Page</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>,
    );
}

describe("Pagamento da reserva (combinado com o salão)", () => {
    it("pendente: quanto confirma, prazo, como pagar e o WhatsApp com a mensagem pronta", async () => {
        mock(reservation, payment());
        renderPage();
        expect(screen.getByText(/carregando dados da reserva/i)).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "Combine o pagamento com o salão" })).toBeInTheDocument();
        expect(screen.getByText(/precisa receber R\$\s?360,00 de sinal/)).toBeInTheDocument();
        expect(screen.getByText(/financeiro@exemplo\.com\.br/)).toBeInTheDocument();
        expect(screen.getByText(/se o salão não registrar o pagamento até lá/i)).toBeInTheDocument();
        expect(screen.getByRole("meter", { name: /pagamento da reserva/i })).toHaveAttribute("aria-valuetext", expect.stringMatching(/sinal de R\$\s?360,00 confirma/));

        const wa = screen.getByRole("link", { name: /combinar pelo whatsapp/i });
        const href = decodeURIComponent(wa.getAttribute("href")!);
        expect(href).toMatch(/^https:\/\/wa\.me\/5535999990000\?text=/);
        expect(href).toMatch(/pagar o sinal de R\$\s?360,00 da minha reserva no Salão Principal/);
        expect(href).toContain("Código: res-1a2b");
        expect(screen.getByRole("link", { name: /instagram @salao/i })).toHaveAttribute("href", "https://instagram.com/salao");
        expect(screen.getByText(/nenhum ainda/i)).toBeInTheDocument();
    });

    it("confirmada com o sinal: mostra o saldo e o prazo do restante", async () => {
        mock({ ...reservation, status: "PAID" }, payment({
            reservationStatus: "PAID", confirmBy: null,
            entries: [{ id: "e1", kind: "PAYMENT", method: "PIX", amountCents: 36000, paidAt: "2026-11-19T15:00:00.000Z", note: "Sinal", createdAt: "2026-11-19T15:00:00.000Z", recordedBy: { id: "o", name: "Dona" } }],
        }, { paidCents: 36000, netCents: 36000, balanceCents: 84000, missingToConfirmCents: 0, confirmed: true }));
        renderPage();
        expect(await screen.findByRole("heading", { name: "Reserva confirmada" })).toBeInTheDocument();
        expect(screen.getByText(/falta o restante: R\$\s?840,00, até 05\/12\/2026/i)).toBeInTheDocument();
        const entries = screen.getByRole("region", { name: /pagamentos registrados/i });
        expect(within(entries).getByText(/pagamento · PIX/i)).toBeInTheDocument();
        expect(within(entries).getByText(/sinal/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /combinar pelo whatsapp/i })).toBeInTheDocument();
    });

    it("quitada: sem como pagar", async () => {
        mock({ ...reservation, status: "PAID" }, payment({ reservationStatus: "PAID", confirmBy: null }, { paidCents: 120000, netCents: 120000, balanceCents: 0, missingToConfirmCents: 0, confirmed: true }));
        renderPage();
        expect(await screen.findByRole("heading", { name: "Reserva confirmada e quitada" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Como pagar" })).not.toBeInTheDocument();
    });

    it("cancelada: a devolução pela política, que o salão faz", async () => {
        mock({ ...reservation, status: "CANCELLED" }, payment({ reservationStatus: "CANCELLED", confirmBy: null, refundDueCents: 28800, refundPercentage: 80 }, { paidCents: 36000, netCents: 36000, confirmed: true }));
        renderPage();
        expect(await screen.findByText(/você recebe R\$\s?288,00 de volta \(80%\)\. O salão faz a devolução/)).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument();
    });

    it("sem instruções e sem contatos: diz para falar com o salão", async () => {
        mock(reservation, payment({ instructions: { text: null, whatsapp: null, phone: null, email: null, instagram: null } }));
        renderPage();
        expect(await screen.findByText(/o salão combina a forma de pagamento com você/i)).toBeInTheDocument();
    });

    it("volta para as reservas quando não consegue carregar", async () => {
        server.use(http.get(`${BASE}/reservations/${reservation.id}`, () => HttpResponse.json({ message: "não encontrada" }, { status: 404 })));
        renderPage();
        await waitFor(() => expect(screen.getByText("Reservations Page")).toBeInTheDocument());
    });
});
