import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import ReservationIntent from "../../pages/ReservationIntent";
import { server } from "../mocks/server";

vi.mock("../../components/AvailabilityCalendar", () => ({
    default: ({ onChange, selectedDate }) => (
        <input
            type="date"
            aria-label="Data do evento"
            value={selectedDate || ""}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

const BASE = "http://localhost:3000";

const mockVenue = {
    id: "venue-1",
    name: "Salão Principal",
    location: "Lavras - MG",
    description: "Salão para eventos",
    capacity: 150,
    hasKidsArea: false,
    hasPool: false,
};

function renderPage(venueId = "venue-1") {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[`/reservation-intent/${venueId}`]}>
                <Routes>
                    <Route path="/reservation-intent/:venueId" element={<ReservationIntent />} />
                    <Route path="/checkout/:reservationId" element={<div>Checkout Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

/** Preenche data e horários via fireEvent (jsdom não associa label ao input sem htmlFor) */
// 2027-06-20 = domingo, válido para planos ESSENCIAL e COMPLETA (Sexta–Domingo)
function fillDateTime(container, { date = "2027-06-20", start = "10:00", end = "18:00" } = {}) {
    const dateInput = container.querySelector('input[type="date"]');
    const timeInputs = container.querySelectorAll('input[type="time"]');
    if (date) fireEvent.change(dateInput, { target: { value: date } });
    if (start) fireEvent.change(timeInputs[0], { target: { value: start } });
    if (end) fireEvent.change(timeInputs[1], { target: { value: end } });
}

describe("ReservationIntent page", () => {
    it("shows loading state then renders venue details", async () => {
        renderPage();
        expect(screen.getByText(/carregando dados do salão/i)).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getAllByText("Salão Principal").length).toBeGreaterThan(0)
        );
        expect(screen.getByText("150 pessoas")).toBeInTheDocument();
        expect(screen.getByText("Lavras - MG")).toBeInTheDocument();
    });

    it("shows 'Salão não encontrado' when venue returns null", async () => {
        server.use(
            http.get(`${BASE}/venues/:id`, () =>
                HttpResponse.json({ success: true, data: null })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/salão não encontrado/i)).toBeInTheDocument()
        );
    });

    it("shows error toast when venue load fails", async () => {
        server.use(
            http.get(`${BASE}/venues/:id`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao carregar os dados do salão." },
                    { status: 500 }
                )
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar os dados do salão/i)).toBeInTheDocument()
        );
    });

    it("renders all three plans", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getAllByText("Salão Principal").length).toBeGreaterThan(0)
        );
        expect(screen.getByText("Promocional")).toBeInTheDocument();
        expect(screen.getByText("Essencial")).toBeInTheDocument();
        expect(screen.getByText("Completa")).toBeInTheDocument();
    });

    it("selecting a plan updates the summary", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        expect(screen.getAllByText("Essencial").length).toBeGreaterThan(1);
    });

    it("plan selector is a keyboard-operable radiogroup", async () => {
        const user = userEvent.setup();
        renderPage();
        const group = await screen.findByRole("radiogroup", { name: /escolha a modalidade/i });
        const radios = screen.getAllByRole("radio");
        expect(group).toBeInTheDocument();
        expect(radios).toHaveLength(3);
        expect(radios[0]).toHaveAttribute("tabindex", "0");
        expect(radios[1]).toHaveAttribute("tabindex", "-1");

        radios[0].focus();
        await user.keyboard("{ArrowDown}");
        expect(radios[1]).toHaveFocus();
        await user.keyboard("{Enter}");

        await waitFor(() => expect(radios[1]).toHaveAttribute("aria-checked", "true"));
        expect(radios[1]).toHaveAttribute("tabindex", "0");
        expect(radios[0]).toHaveAttribute("aria-checked", "false");
    });

    it("formats the selected date in pt-BR in the summary", async () => {
        const { container } = renderPage();
        await screen.findByRole("radiogroup");
        fillDateTime(container, { date: "2027-06-20", start: "", end: "" });
        expect(await screen.findByText(/20 de jun\.? de 2027/i)).toBeInTheDocument();
    });

    it("shows base plan price in estimated card when date/time not filled", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Promocional")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Promocional"));
        await waitFor(() =>
            expect(screen.getAllByText(/r\$ 650/i).length).toBeGreaterThan(0)
        );
    });

    it("fetches quote when plan and date/time are all filled", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container);

        await waitFor(() =>
            expect(screen.getAllByText(/r\$ 850/i).length).toBeGreaterThan(0),
            { timeout: 2000 }
        );
    });

    it("shows quote with discount when discountApplied is true", async () => {
        server.use(
            http.post(`${BASE}/reservations/quote`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        totalCents: 76500,
                        subtotalCents: 85000,
                        discountCents: 8500,
                        discountApplied: true,
                        items: [{ description: "Aluguel", amountCents: 85000 }],
                    },
                })
            )
        );
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container);

        await waitFor(() =>
            expect(screen.getByText(/subtotal/i)).toBeInTheDocument(),
            { timeout: 2000 }
        );
        expect(screen.getByText(/desconto/i)).toBeInTheDocument();
    });

    it("does not quote when end time is before start time", async () => {
        const quoteMock = vi.fn(() =>
            HttpResponse.json({
                success: true,
                data: { totalCents: 85000, subtotalCents: 85000, discountCents: 0, discountApplied: false, items: [] },
            })
        );
        server.use(http.post(`${BASE}/reservations/quote`, quoteMock));

        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container, { start: "18:00", end: "10:00" });

        await new Promise((r) => setTimeout(r, 800));
        expect(quoteMock).not.toHaveBeenCalled();
    });

    it("opens Google Maps when 'Rotas' is clicked and location is set", async () => {
        const openMock = vi.spyOn(window, "open").mockImplementation(() => null);
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /rotas/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /rotas/i }));
        expect(openMock).toHaveBeenCalledWith(
            expect.stringContaining("google.com/maps"),
            "_blank"
        );
        openMock.mockRestore();
    });

    it("shows toast when 'Rotas' clicked and location is missing", async () => {
        server.use(
            http.get(`${BASE}/venues/:id`, () =>
                HttpResponse.json({
                    success: true,
                    data: { ...mockVenue, location: null },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /rotas/i })).toBeInTheDocument()
        );
        await user.click(screen.getByRole("button", { name: /rotas/i }));
        await waitFor(() =>
            expect(screen.getByText(/endereço do salão não disponível/i)).toBeInTheDocument()
        );
    });

    it("shows warning when confirming without a plan", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByLabelText(/li e estou de acordo/i)).toBeInTheDocument()
        );
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));
        await waitFor(() =>
            expect(screen.getByText("Selecione um plano.")).toBeInTheDocument()
        );
    });

    it("shows warning when confirming without date", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));
        await waitFor(() =>
            expect(screen.getByText("Selecione a data do evento.")).toBeInTheDocument()
        );
    });

    it("shows warning when confirming without start time", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container, { date: "2027-06-20", start: "", end: "" });
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));
        await waitFor(() =>
            expect(screen.getByText("Selecione o horário de início.")).toBeInTheDocument()
        );
    });

    it("shows warning when confirming without end time", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container, { date: "2027-06-20", start: "10:00", end: "" });
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));
        await waitFor(() =>
            expect(screen.getByText("Selecione o horário de término.")).toBeInTheDocument()
        );
    });

    it("shows warning when end time is before start time on confirm", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container, { date: "2027-06-20", start: "18:00", end: "10:00" });
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));
        await waitFor(() =>
            expect(screen.getByText(/horário de término deve ser posterior/i)).toBeInTheDocument()
        );
    });

    it("confirm button is disabled when contract is not accepted", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container);
        expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    });

    it("creates reservation and navigates to checkout on success", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container);
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));

        await waitFor(() =>
            expect(screen.getByText("Checkout Page")).toBeInTheDocument()
        );
    });

    it("shows error toast when reservation creation fails", async () => {
        server.use(
            http.post(`${BASE}/reservations`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao confirmar a reserva." },
                    { status: 422 }
                )
            )
        );
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        fillDateTime(container);
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar/i }));

        await waitFor(() =>
            expect(screen.getByText(/erro ao confirmar a reserva/i)).toBeInTheDocument()
        );
    });

    it("renders kids area card when hasKidsArea is true", async () => {
        server.use(
            http.get(`${BASE}/venues/:id`, () =>
                HttpResponse.json({
                    success: true,
                    data: { ...mockVenue, hasKidsArea: true },
                })
            )
        );
        renderPage();
        await waitFor(() =>
            expect(screen.getByText(/área kids com monitor/i)).toBeInTheDocument()
        );
    });

    it("shows kidsMonitorExtraHours in summary when > 0", async () => {
        server.use(
            http.get(`${BASE}/venues/:id`, () =>
                HttpResponse.json({
                    success: true,
                    data: { ...mockVenue, hasKidsArea: true },
                })
            )
        );
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("spinbutton")).toBeInTheDocument()
        );
        const kidsInput = screen.getByRole("spinbutton");
        await user.clear(kidsInput);
        await user.type(kidsInput, "2");
        await waitFor(() =>
            expect(screen.getByText("2h")).toBeInTheDocument()
        );
    });

    it("renders contract link", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));
        await waitFor(() =>
            expect(screen.getByRole("link", { name: /baixar contrato em pdf/i })).toBeInTheDocument()
        );
    });

    it("confirm button is disabled when page loads (contract not yet accepted)", async () => {
        renderPage();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    });

    it("confirm button becomes enabled after accepting contract", async () => {
        const user = userEvent.setup();
        renderPage();
        await waitFor(() =>
            expect(screen.getByLabelText(/li e estou de acordo/i)).toBeInTheDocument()
        );
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        expect(screen.getByRole("button", { name: /confirmar/i })).not.toBeDisabled();
    });

    it("shows toast when clicking a blocked plan", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Promocional")).toBeInTheDocument()
        );
        // 2027-06-20 = domingo → Promocional bloqueado
        fillDateTime(container, { date: "2027-06-20", start: "", end: "" });
        await user.click(screen.getByText("Promocional"));
        await waitFor(() =>
            expect(screen.getByText(/plano promocional é disponível apenas de segunda a quinta/i)).toBeInTheDocument()
        );
    });

    it("resets plan when date changes to incompatible day", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();
        await waitFor(() =>
            expect(screen.getByText("Promocional")).toBeInTheDocument()
        );
        // Seleciona Promocional sem data
        await user.click(screen.getByText("Promocional"));
        // Muda para domingo → Promocional deve ser resetado
        fillDateTime(container, { date: "2027-06-20", start: "", end: "" });
        await waitFor(() =>
            expect(screen.getByText(/data alterada não é compatível/i)).toBeInTheDocument()
        );
    });

    it("allows typing in the notes field", async () => {
        const { container } = renderPage();
        const user = userEvent.setup();

        await waitFor(() =>
            expect(screen.getAllByText("Salão Principal").length).toBeGreaterThan(0)
        );

        fillDateTime(container);
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));

        const notes = screen.getByPlaceholderText(/festa infantil/i);
        await user.type(notes, "Aniversário de 5 anos");
        expect(notes).toHaveValue("Aniversário de 5 anos");
    });

    it("uses stored.name as locatario when stored.user is absent", async () => {
        localStorage.setItem(
            "recanto:userData",
            JSON.stringify({ name: "Convidado Teste", token: "tk" })
        );
        const { container } = renderPage();
        const user = userEvent.setup();

        await waitFor(() =>
            expect(screen.getAllByText("Salão Principal").length).toBeGreaterThan(0)
        );

        fillDateTime(container);
        await waitFor(() =>
            expect(screen.getByText("Essencial")).toBeInTheDocument()
        );
        await user.click(screen.getByText("Essencial"));

        expect(screen.getByText(/intenção de reserva/i)).toBeInTheDocument();
        localStorage.removeItem("recanto:userData");
    });
});
