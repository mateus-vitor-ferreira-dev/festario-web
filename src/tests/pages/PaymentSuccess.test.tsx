import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PaymentSuccess from "../../pages/PaymentSuccess";

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/payment/success"]}>
            <Routes>
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/reservations" element={<div>Reservations Page</div>} />
                <Route path="/home" element={<div>Home Page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("PaymentSuccess page", () => {
    it("renders success message", () => {
        renderPage();
        expect(screen.getByText(/pagamento confirmado/i)).toBeInTheDocument();
    });

    it("navigates to /reservations on primary button click", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /ver minhas reservas/i }));
        expect(screen.getByText("Reservations Page")).toBeInTheDocument();
    });

    it("navigates to /home on secondary button click", async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole("button", { name: /voltar para o início/i }));
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
});
