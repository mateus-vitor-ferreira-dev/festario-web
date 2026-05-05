import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Checkout from "../../pages/Checkout";
import { server } from "../mocks/server";

async function triggerPollingCycle(mockFn) {
    await act(async () => {
        const cb = mockFn.mock.calls.at(-1)?.[0];
        if (cb) await cb();
    });
}

const BASE = "http://localhost:3000";

const mockReservation = {
    id: "res-1",
    status: "PENDING",
    planCode: "ESSENCIAL",
    totalPrice: 850,
    startDate: "2026-06-01T10:00:00.000Z",
    endDate: "2026-06-01T18:00:00.000Z",
    venue: { name: "Salão Principal" },
};

const mockPixData = {
    txid: "txid-abc123",
    qrCode: "base64encodedimage",
    copyPaste: "00020126330014br.gov.bcb.pix",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
};

function renderPage(reservationId = "res-1") {
    return render(
        <MemoryRouter initialEntries={[`/checkout/${reservationId}`]}>
            <Routes>
                <Route path="/checkout/:reservationId" element={<Checkout />} />
                <Route path="/reservations" element={<div>Reservations Page</div>} />
                <Route path="/payment/success" element={<div>Payment Success</div>} />
            </Routes>
            <ToastContainer />
        </MemoryRouter>
    );
}

describe.skip("Checkout PIX flow", () => {
    beforeEach(() => {
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({ success: true, data: mockReservation })
            )
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        server.resetHandlers();
    });

    it("switches to PIX method and shows Gerar QR Code button", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));

        expect(screen.getByRole("button", { name: /gerar qr code pix/i })).toBeInTheDocument();
    });

    it("generates PIX QR Code and shows QR screen", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({ success: true, data: mockPixData })
            )
        );

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() =>
            expect(screen.getByAltText(/qr code pix/i)).toBeInTheDocument()
        );
        expect(screen.getByText(/código copia e cola/i)).toBeInTheDocument();
        expect(screen.getByText(mockPixData.copyPaste)).toBeInTheDocument();
    });

    it("shows error toast when PIX generation fails", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao gerar QR Code PIX." },
                    { status: 500 }
                )
            )
        );

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() =>
            expect(screen.getByText(/erro ao gerar qr code pix/i)).toBeInTheDocument()
        );
    });

    it("copies PIX code to clipboard and shows Copiado feedback", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({ success: true, data: mockPixData })
            )
        );

        const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() => expect(screen.getByText(/copiar código/i)).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /copiar código/i }));

        await waitFor(() =>
            expect(screen.getByText(/copiado!/i)).toBeInTheDocument()
        );
        expect(writeText).toHaveBeenCalledWith(mockPixData.copyPaste);
    });

    it("shows error toast when clipboard copy fails", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({ success: true, data: mockPixData })
            )
        );

        vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() => expect(screen.getByText(/copiar código/i)).toBeInTheDocument());
        await user.click(screen.getByRole("button", { name: /copiar código/i }));

        await waitFor(() =>
            expect(screen.getByText(/não foi possível copiar/i)).toBeInTheDocument()
        );
    });

    it("restores QR Code when reservation has pending PIX payment", async () => {
        const futureDate = new Date(Date.now() + 3600000).toISOString();
        server.use(
            http.get(`${BASE}/reservations/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        ...mockReservation,
                        payment: {
                            status: "PENDING",
                            pixTxId: "txid-abc",
                            pixQrCode: "base64image",
                            pixCopyPaste: "pix-copy-paste-code",
                            pixExpiresAt: futureDate,
                        },
                    },
                })
            )
        );

        renderPage();
        await waitFor(() =>
            expect(screen.getByAltText(/qr code pix/i)).toBeInTheDocument()
        );
        expect(screen.getByText("pix-copy-paste-code")).toBeInTheDocument();
    });

    it("navigates to /payment/success when polling returns PAID", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({ success: true, data: mockPixData })
            ),
            http.get(`${BASE}/payments/reservation/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: { payment: { status: "PAID" }, reservationStatus: "PAID" },
                })
            )
        );

        const intervalSpy = vi.spyOn(global, "setInterval");
        vi.spyOn(global, "clearInterval").mockImplementation(() => {});

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() => expect(screen.getByAltText(/qr code pix/i)).toBeInTheDocument());

        await triggerPollingCycle(intervalSpy);

        await waitFor(() =>
            expect(screen.getByText("Payment Success")).toBeInTheDocument()
        );
    });

    it("navigates to /reservations when polling returns EXPIRED", async () => {
        server.use(
            http.post(`${BASE}/payments/pix/res-1`, () =>
                HttpResponse.json({ success: true, data: mockPixData })
            ),
            http.get(`${BASE}/payments/reservation/res-1`, () =>
                HttpResponse.json({
                    success: true,
                    data: { payment: { status: "EXPIRED" }, reservationStatus: "EXPIRED" },
                })
            )
        );

        const intervalSpy = vi.spyOn(global, "setInterval");
        vi.spyOn(global, "clearInterval").mockImplementation(() => {});

        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Salão Principal")).toBeInTheDocument()
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /^pix$/i }));
        await user.click(screen.getByRole("button", { name: /gerar qr code pix/i }));

        await waitFor(() => expect(screen.getByAltText(/qr code pix/i)).toBeInTheDocument());

        await triggerPollingCycle(intervalSpy);

        await waitFor(() =>
            expect(screen.getByText("Reservations Page")).toBeInTheDocument()
        );
    });
});
