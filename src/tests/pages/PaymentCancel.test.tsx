import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PaymentCancel from "../../pages/PaymentCancel";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/payment/cancel"]}>
            <Routes>
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/reservations" element={<div>Reservations Page</div>} />
                <Route path="/venues" element={<div>Venues Page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("PaymentCancel page", () => {
    it("renders cancellation message", () => {
        renderPage();
        expect(screen.getByText(/pagamento cancelado/i)).toBeInTheDocument();
    });

    it("navigates to /reservations on primary button click", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /ver minhas reservas/i }));
        expect(screen.getByText("Reservations Page")).toBeInTheDocument();
    });

    it("navigates to /venues on secondary button click", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /explorar espaços/i }));
        expect(screen.getByText("Venues Page")).toBeInTheDocument();
    });
});
