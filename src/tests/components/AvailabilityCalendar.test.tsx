import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { ToastContainer } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = TODAY.getMonth();

function pad(n) {
    return String(n).padStart(2, "0");
}

function dateStr(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function renderCalendar(props = {}) {
    return render(
        <>
            <AvailabilityCalendar
                venueId="venue-1"
                selectedDate={null}
                onChange={vi.fn()}
                {...props}
            />
            <ToastContainer />
        </>
    );
}

describe("AvailabilityCalendar", () => {
    it("shows loading state while fetching availability", () => {
        renderCalendar();
        expect(screen.getByText(/carregando disponibilidade/i)).toBeInTheDocument();
    });

    it("renders current month after loading", async () => {
        renderCalendar();
        const monthLabel = new Date(CURRENT_YEAR, CURRENT_MONTH, 1).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
        });
        await waitFor(() =>
            expect(screen.getByText(monthLabel)).toBeInTheDocument()
        );
    });

    it("renders weekday headers", async () => {
        renderCalendar();
        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        expect(screen.getByText("Dom")).toBeInTheDocument();
        expect(screen.getByText("Seg")).toBeInTheDocument();
        expect(screen.getByText("Sáb")).toBeInTheDocument();
    });

    it("calls onChange when clicking an available future date", async () => {
        const onChange = vi.fn();
        const nextMonth = CURRENT_MONTH === 11 ? 0 : CURRENT_MONTH + 1;
        const nextYear = CURRENT_MONTH === 11 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
        const targetDate = dateStr(nextYear, nextMonth, 15);

        renderCalendar({ onChange });

        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /próximo mês/i }));

        await user.click(screen.getByRole("button", { name: "15" }));
        expect(onChange).toHaveBeenCalledWith(targetDate);
    });

    it("does not call onChange when clicking a blocked date", async () => {
        const nextMonth = CURRENT_MONTH === 11 ? 0 : CURRENT_MONTH + 1;
        const nextYear = CURRENT_MONTH === 11 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
        const blockedStart = `${nextYear}-${pad(nextMonth + 1)}-14T00:00:00.000Z`;
        const blockedEnd = `${nextYear}-${pad(nextMonth + 1)}-16T23:59:59.000Z`;

        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ startDate: blockedStart, endDate: blockedEnd, reason: "Bloqueado" }],
                })
            )
        );

        const onChange = vi.fn();
        renderCalendar({ onChange });

        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /próximo mês/i }));

        await user.click(screen.getByRole("button", { name: "15" }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("does not call onChange when clicking an occupied date", async () => {
        const nextMonth = CURRENT_MONTH === 11 ? 0 : CURRENT_MONTH + 1;
        const nextYear = CURRENT_MONTH === 11 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
        const occupiedStart = `${nextYear}-${pad(nextMonth + 1)}-20T10:00:00.000Z`;
        const occupiedEnd = `${nextYear}-${pad(nextMonth + 1)}-20T23:00:00.000Z`;

        server.use(
            http.get(`${BASE}/reservations/occupied-dates`, () =>
                HttpResponse.json({
                    success: true,
                    data: [{ startDate: occupiedStart, endDate: occupiedEnd }],
                })
            )
        );

        const onChange = vi.fn();
        renderCalendar({ onChange });

        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /próximo mês/i }));

        await user.click(screen.getByRole("button", { name: "20" }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("navigates to next month", async () => {
        renderCalendar();
        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        const nextMonth = CURRENT_MONTH === 11 ? 0 : CURRENT_MONTH + 1;
        const nextYear = CURRENT_MONTH === 11 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
        const expectedLabel = new Date(nextYear, nextMonth, 1).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
        });

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /próximo mês/i }));

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    });

    it("prev month button is disabled on current month", async () => {
        renderCalendar();
        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        expect(screen.getByRole("button", { name: /mês anterior/i })).toBeDisabled();
    });

    it("shows legend items", async () => {
        renderCalendar();
        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        expect(screen.getByText(/disponível/i)).toBeInTheDocument();
        expect(screen.getByText(/selecionado/i)).toBeInTheDocument();
        expect(screen.getByText(/reservado/i)).toBeInTheDocument();
        expect(screen.getByText(/bloqueado/i)).toBeInTheDocument();
    });

    it("shows error toast when API fails", async () => {
        server.use(
            http.get(`${BASE}/blocked-dates`, () =>
                HttpResponse.json(
                    { success: false, message: "Erro ao carregar disponibilidade." },
                    { status: 500 }
                )
            )
        );

        renderCalendar();
        await waitFor(() =>
            expect(screen.getByText(/erro ao carregar disponibilidade/i)).toBeInTheDocument()
        );
    });

    it("initializes to month of selectedDate when provided", async () => {
        renderCalendar({ selectedDate: "2027-08-15" });

        await waitFor(() => expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument());

        const label = new Date(2027, 7, 1).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
        });
        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
