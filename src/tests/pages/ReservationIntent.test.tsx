import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import ReservationIntent from "../../pages/ReservationIntent";
import { bookingDateRange, choosableItems } from "../../pages/ReservationIntent/useReservationForm";
import type { PublicTenant, VenuePackage } from "../../types";
import { server } from "../mocks/server";

const calendarProps = vi.fn();
vi.mock("../../components/AvailabilityCalendar", () => ({
    default: (props: { onChange: (v: string) => void; selectedDate?: string; minDate?: string; maxDate?: string }) => {
        calendarProps(props);
        return (
            <input
                type="date"
                aria-label="Data do evento"
                value={props.selectedDate || ""}
                onChange={(e) => props.onChange(e.target.value)}
            />
        );
    },
}));

const BASE = "http://localhost:3000";

/** Um salão que não é o Recanto: pacotes, preços e itens próprios. */
const SATURDAY: VenuePackage = {
    id: "pkg-sab", code: null, name: "Sábado", description: "Salão e jardim.", basePriceAmount: "1200.00",
    validWeekdays: [6], validOnHolidays: true, earliestStartMinute: 600, latestEndMinute: 1500,
    minDurationMinutes: 120, maxDurationMinutes: 360, minGuests: 20, maxGuests: 120,
    items: [
        { itemId: "it-mon", key: "KIDS_MONITOR", name: "Monitor", description: null, chargeType: "PER_HOUR", unitPrice: "45.00", minQuantity: null, maxQuantity: 8, mode: "INCLUDED", includedQuantity: 3 },
        { itemId: "it-buf", key: "BUFFET", name: "Buffet", description: "Salgados e doces", chargeType: "PER_GUEST", unitPrice: "35.00", minQuantity: null, maxQuantity: null, mode: "OPTIONAL", includedQuantity: null },
        { itemId: "it-clean", key: "CLEANING", name: "Limpeza", description: null, chargeType: "FIXED", unitPrice: "0", minQuantity: null, maxQuantity: null, mode: "INCLUDED", includedQuantity: null },
        { itemId: "it-dj", key: "SOUND_DJ", name: "DJ", description: null, chargeType: "PER_HOUR", unitPrice: "100.00", minQuantity: null, maxQuantity: 2, mode: "OPTIONAL", includedQuantity: null },
    ],
};

const WEEKDAY: VenuePackage = {
    ...SATURDAY, id: "pkg-sem", name: "Dia de semana", description: null, basePriceAmount: "700.00", validWeekdays: [1, 2, 3, 4],
    validOnHolidays: false, items: [], maxGuests: null, minGuests: null,
};

function mockPackages() {
    const dates: (string | null)[] = [];
    server.use(
        http.get(`${BASE}/venues/:id/packages`, ({ request }) => {
            const date = new URL(request.url).searchParams.get("date");
            dates.push(date);
            const saturday = date ? new Date(`${date}T12:00:00`).getDay() === 6 : null;
            return HttpResponse.json({
                data: {
                    date, holiday: date ? false : null,
                    packages: [SATURDAY, WEEKDAY].map((p) => ({ ...p, ...(date && { availableOnDate: p.id === "pkg-sab" ? saturday : !saturday }) })),
                },
            });
        }),
    );
    return dates;
}

function mockQuote() {
    const bodies: Record<string, unknown>[] = [];
    server.use(
        http.post(`${BASE}/reservations/quote`, async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;
            bodies.push(body);
            const buffet = (body.items as { itemId: string }[]).some((i) => i.itemId === "it-buf");
            return HttpResponse.json({
                data: {
                    currency: "BRL", packageId: "pkg-sab", packageName: "Sábado", guestCount: body.guestCount,
                    items: [
                        { type: "PLAN_BASE", description: "Sábado", quantity: 1, unitAmountCents: 120000, totalAmountCents: 120000 },
                        { type: "INCLUDED_ITEM", description: "Monitor — 3h inclusas", quantity: 3, unitAmountCents: 0, totalAmountCents: 0 },
                        ...(buffet ? [{ type: "EXTRA_ITEM", description: "Buffet — 80 convidados", quantity: 80, unitAmountCents: 3500, totalAmountCents: 280000 }] : []),
                    ],
                    cancellationPolicy: { tiers: [{ minDays: 30, percentage: 100 }, { minDays: 0, percentage: 0 }], notes: "Remarcação grátis uma vez.", summary: ["Com 30 dias ou mais de antecedência: 100% de reembolso", "Com menos de 30 dias de antecedência: sem reembolso"] },
                    subtotalCents: buffet ? 400000 : 120000, discountCents: 0, totalCents: buffet ? 400000 : 120000, discountApplied: null,
                },
            });
        }),
    );
    return bodies;
}

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/reservation-intent/venue-1"]}>
                <Routes>
                    <Route path="/reservation-intent/:venueId" element={<ReservationIntent />} />
                    <Route path="/checkout/:reservationId" element={<div>Checkout Page</div>} />
                </Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

/** 2027-06-19 é um sábado. */
async function fillSaturday(user: ReturnType<typeof userEvent.setup>, container: HTMLElement, { guests = "80", start = "14:00", end = "19:00" } = {}) {
    await screen.findByRole("radiogroup", { name: /escolha o pacote/i });
    fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: "2027-06-19" } });
    const group = await screen.findByRole("radiogroup", { name: /escolha o pacote/i });
    await waitFor(() => expect(within(group).getByRole("radio", { name: /dia de semana/i })).toHaveAttribute("aria-disabled", "true"));
    await user.click(within(group).getByRole("radio", { name: /sábado/i }));
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: start } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: end } });
    if (guests) await user.type(screen.getByLabelText("Convidados"), guests);
}

beforeEach(() => calendarProps.mockClear());

describe("ReservationIntent", () => {
    it("shows the venue and its own packages with what is included", async () => {
        mockPackages();
        renderPage();
        expect(screen.getByText(/carregando dados do salão/i)).toBeInTheDocument();
        const group = await screen.findByRole("radiogroup", { name: /escolha o pacote/i });
        const saturday = within(group).getByRole("radio", { name: /sábado/i });
        expect(saturday).toHaveTextContent("R$ 1.200,00");
        expect(saturday).toHaveTextContent(/incluso: monitor \(3h\), limpeza/i);
        expect(saturday).toHaveTextContent(/até 120 convidados \(mínimo 20\)/i);
        expect(saturday).toHaveTextContent(/das 10:00 às 01:00 do dia seguinte/i);
        expect(within(group).getByRole("radio", { name: /dia de semana/i })).toHaveTextContent("R$ 700,00");
        expect(screen.getByText(/escolha a data para ver os que valem nela/i)).toBeInTheDocument();
    });

    it("tells when the venue has no package open", async () => {
        renderPage();
        expect(await screen.findByText(/ainda não tem pacotes abertos/i)).toBeInTheDocument();
    });

    it("shows 'Salão não encontrado' when the venue does not exist", async () => {
        server.use(http.get(`${BASE}/venues/:id`, () => HttpResponse.json({ data: null })));
        renderPage();
        expect(await screen.findByText(/salão não encontrado/i)).toBeInTheDocument();
    });

    it("asks the API which packages are valid on the date and blocks the others", async () => {
        const dates = mockPackages();
        const user = userEvent.setup();
        const { container } = renderPage();
        await screen.findByRole("radiogroup", { name: /escolha o pacote/i });
        await user.click(screen.getByRole("radio", { name: /dia de semana/i }));
        expect(screen.getByRole("radio", { name: /dia de semana/i })).toHaveAttribute("aria-checked", "true");

        fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: "2027-06-19" } });
        await waitFor(() => expect(dates).toContain("2027-06-19"));
        const weekday = await screen.findByRole("radio", { name: /dia de semana/i });
        await waitFor(() => expect(weekday).toHaveAttribute("aria-disabled", "true"));
        expect(weekday).toHaveTextContent(/não vale nesta data/i);
        expect(await screen.findByText(/não vale nesta data\. escolha outro/i)).toBeInTheDocument();
        expect(weekday).toHaveAttribute("aria-checked", "false");
        await user.click(weekday);
        expect(weekday).toHaveAttribute("aria-checked", "false");
    });

    it("quotes with the package, guests and add-ons, showing only the API numbers", async () => {
        mockPackages();
        const bodies = mockQuote();
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container);

        const summary = await screen.findByText("Resumo da reserva").then((h) => h.closest("div")!.parentElement!);
        await waitFor(() => expect(bodies).toHaveLength(1), { timeout: 2000 });
        expect(bodies[0]).toMatchObject({ venueId: "venue-1", packageId: "pkg-sab", guestCount: 80, items: [{ itemId: "it-mon", quantity: 3 }] });
        expect(new Date(bodies[0].endDate as string).getTime() - new Date(bodies[0].startDate as string).getTime()).toBe(5 * 3600 * 1000);
        expect(await within(summary).findByText("Incluso")).toBeInTheDocument();
        expect(within(summary).getByText(/com 30 dias ou mais/i)).toBeInTheDocument();
        expect(within(summary).getByText(/remarcação grátis/i)).toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: /buffet/i }));
        await user.click(screen.getByRole("button", { name: /mais uma hora de monitor/i }));
        await user.click(screen.getByRole("button", { name: /mais uma hora de dj/i }));
        await waitFor(() => expect(bodies.length).toBeGreaterThan(1), { timeout: 2000 });
        expect(bodies.at(-1)).toMatchObject({ items: [{ itemId: "it-mon", quantity: 4 }, { itemId: "it-buf" }, { itemId: "it-dj", quantity: 1 }] });
        expect(await within(summary).findByText(/buffet — 80 convidados/i)).toBeInTheDocument();
        expect(screen.getAllByText("R$ 4.000,00").length).toBeGreaterThan(0);
    });

    it("keeps hour add-ons within the included and maximum hours", async () => {
        mockPackages();
        mockQuote();
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container);
        expect(screen.getByRole("button", { name: /menos uma hora de monitor/i })).toBeDisabled();
        const more = screen.getByRole("button", { name: /mais uma hora de dj/i });
        await user.click(more);
        await user.click(more);
        expect(more).toBeDisabled();
        expect(within(screen.getByRole("group", { name: /horas de dj/i })).getByText("2h")).toBeInTheDocument();
    });

    it("treats an end before the start as the next day", async () => {
        mockPackages();
        const bodies = mockQuote();
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container, { start: "20:00", end: "01:00" });
        expect(screen.getByText(/o término é no dia seguinte/i)).toBeInTheDocument();
        await waitFor(() => expect(bodies).toHaveLength(1), { timeout: 2000 });
        expect(new Date(bodies[0].endDate as string).getTime() - new Date(bodies[0].startDate as string).getTime()).toBe(5 * 3600 * 1000);
        expect(screen.getByText(/20:00 às 01:00 \(dia seguinte\)/)).toBeInTheDocument();
    });

    it("shows the API reason when the quote is refused and keeps the confirm button off", async () => {
        mockPackages();
        server.use(http.post(`${BASE}/reservations/quote`, () => HttpResponse.json({ message: "O pacote Sábado é para até 120 convidados" }, { status: 422 })));
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container, { guests: "200" });
        expect(await screen.findByText(/é para até 120 convidados/i, {}, { timeout: 2000 })).toBeInTheDocument();
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        expect(screen.getByRole("button", { name: /confirmar e ir para pagamento/i })).toBeDisabled();
    });

    it("lists what is missing before quoting", async () => {
        mockPackages();
        renderPage();
        expect(await screen.findByText(/falta escolher a data, o pacote, o horário, o número de convidados/i)).toBeInTheDocument();
        expect(screen.getByText(/escolha a data, o pacote, o horário e os convidados para gerar o contrato/i)).toBeInTheDocument();
    });

    it("creates the reservation with the quoted body and goes to checkout", async () => {
        mockPackages();
        mockQuote();
        let created: Record<string, unknown> | null = null;
        server.use(http.post(`${BASE}/reservations`, async ({ request }) => {
            created = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { id: "res-9" } }, { status: 201 });
        }));
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container);
        await user.type(screen.getByPlaceholderText(/festa infantil/i), "Aniversário de 5 anos");
        await screen.findByText("Valor da reserva", {}, { timeout: 2000 });
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar e ir para pagamento/i }));
        expect(await screen.findByText("Checkout Page")).toBeInTheDocument();
        expect(created).toMatchObject({ packageId: "pkg-sab", guestCount: 80, termsAccepted: true, notes: "Aniversário de 5 anos", items: [{ itemId: "it-mon", quantity: 3 }] });
    });

    it("shows an error when creating the reservation fails", async () => {
        mockPackages();
        mockQuote();
        server.use(http.post(`${BASE}/reservations`, () => HttpResponse.json({ message: "Data já reservada" }, { status: 409 })));
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container);
        await screen.findByText("Valor da reserva", {}, { timeout: 2000 });
        await user.click(screen.getByLabelText(/li e estou de acordo/i));
        await user.click(screen.getByRole("button", { name: /confirmar e ir para pagamento/i }));
        expect(await screen.findByText(/data já reservada|erro ao confirmar/i)).toBeInTheDocument();
    });

    it("generates the contract with the same body as the quote", async () => {
        mockPackages();
        const quotes = mockQuote();
        let previewBody: Record<string, unknown> | null = null;
        server.use(http.post(`${BASE}/reservations/contract-preview`, async ({ request }) => {
            previewBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ data: { landlord: { tradeName: "Salão" } } });
        }));
        const download = vi.fn();
        vi.doMock("../../components/Contract/download", () => ({ downloadContract: download }));
        const user = userEvent.setup();
        const { container } = renderPage();
        await fillSaturday(user, container);
        await user.click(await screen.findByRole("button", { name: /baixar contrato em pdf/i }));
        await waitFor(() => expect(download).toHaveBeenCalled());
        await waitFor(() => expect(quotes.length).toBeGreaterThan(0), { timeout: 2000 });
        expect(previewBody).toEqual(quotes[0]);
        vi.doUnmock("../../components/Contract/download");
    });

    it("limits the calendar to the salon lead time and horizon", async () => {
        server.use(http.get(`${BASE}/tenant`, () => HttpResponse.json({ data: { slug: "s", name: "S", timezone: "America/Sao_Paulo", minLeadHours: 72, maxAdvanceDays: 180, cancellationPolicy: { tiers: [], summary: [] } } })));
        renderPage();
        expect(await screen.findByText(/pelo menos 3 dias de antecedência/i)).toBeInTheDocument();
        const last = calendarProps.mock.calls.at(-1)![0];
        expect(last.minDate).toBe(bookingDateRange({ minLeadHours: 72, maxAdvanceDays: 180 } as PublicTenant).min);
        expect(last.maxDate).toBeDefined();
    });
});

describe("regras da reserva sem a tela", () => {
    it("bookingDateRange: antecedência em dias inteiros e horizonte opcional", () => {
        const today = new Date();
        const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        expect(bookingDateRange(null)).toEqual({ min: iso(today), max: undefined });
        const in2 = new Date(today); in2.setDate(in2.getDate() + 2);
        expect(bookingDateRange({ minLeadHours: 30, maxAdvanceDays: null } as PublicTenant).min).toBe(iso(in2));
    });

    it("choosableItems: opcionais e horas além das inclusas; o incluso por inteiro não entra", () => {
        expect(choosableItems(SATURDAY).map((i) => i.itemId)).toEqual(["it-mon", "it-buf", "it-dj"]);
        expect(choosableItems(null)).toEqual([]);
    });
});
