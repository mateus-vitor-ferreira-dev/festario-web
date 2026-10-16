import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderAt(url: string) {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "dono@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/painel" element={<Admin />} />
                </Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const location = () => screen.getByTestId("location").textContent ?? "";

const MONITOR = {
    id: "it-1", key: "kids_monitor", name: "Monitor kids", description: null, chargeType: "PER_HOUR",
    unitPrice: "50.00", minQuantity: null, maxQuantity: null, isActive: true, sortOrder: 0,
};

const PACKAGE = {
    id: "pkg-1", venueId: null, venue: null, code: null, name: "Sábado à tarde", description: null, sortOrder: 1, isActive: true,
    basePriceAmount: "1200.00", validWeekdays: [6], validOnHolidays: false, earliestStartMinute: 600, latestEndMinute: 1080,
    minDurationMinutes: null, maxDurationMinutes: 300, minGuests: null, maxGuests: 120, keyDeliveryOffsetHours: 0,
    activeFrom: null, activeTo: null,
    items: [{ mode: "INCLUDED", includedQuantity: 4, item: { id: "it-1", key: "kids_monitor", name: "Monitor kids", chargeType: "PER_HOUR", unitPrice: "50.00", isActive: true } }],
};

const SETTINGS = {
    slug: "salao", name: "Salão", timezone: "America/Sao_Paulo", city: null, state: null,
    paymentHoldMinutes: null, effectivePaymentHoldMinutes: 1440, minLeadHours: null, maxAdvanceDays: null,
    cancellationPolicy: { tiers: [{ minDays: 30, percentage: 100 }, { minDays: 0, percentage: 0 }], notes: null, isDefault: true, summary: [] },
    address: null, contactPhone: null, contactWhatsapp: null, contactEmail: null, instagram: null,
    legalName: null, documentNumber: null, chatbotFaq: null,
};

beforeEach(() => localStorage.clear());

describe("Regras do salão", () => {
    it("opens the rules tab from the old plans address", async () => {
        renderAt("/painel?tab=plans");
        expect(await screen.findByRole("navigation", { name: "Regras do salão" })).toBeInTheDocument();
    });

    it("shows the first-time steps when the salon has no package", async () => {
        renderAt("/painel?tab=rules");
        const steps = await screen.findByRole("list", { name: /primeiros passos/i });
        expect(within(steps).getByRole("button", { name: /criar pacote/i })).toBeInTheDocument();
    });

    it("switches sections through the URL", async () => {
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        await user.click(await screen.findByRole("button", { name: /itens e adicionais/i }));
        await waitFor(() => expect(location()).toBe("/painel?tab=rules&section=items"));
        expect(await screen.findByText(/nenhum item próprio ainda/i)).toBeInTheDocument();
    });

    it("lists packages with what is included", async () => {
        server.use(http.get(`${BASE}/admin/plans`, () => HttpResponse.json({ data: [PACKAGE] })));
        renderAt("/painel?tab=rules");
        expect(await screen.findByRole("heading", { name: "Sábado à tarde" })).toBeInTheDocument();
        expect(screen.getByText(/incluso: monitor kids/i)).toBeInTheDocument();
        expect(screen.getByText(/até 120 convidados/i)).toBeInTheDocument();
    });

    it("validates and creates a package with an included item", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/admin/items`, () => HttpResponse.json({ data: [MONITOR] })),
            http.post(`${BASE}/admin/plans`, async ({ request }) => {
                body = await request.json() as Record<string, unknown>;
                return HttpResponse.json({ data: { ...PACKAGE, id: "pkg-2" } }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules");
        await user.click(await screen.findByRole("button", { name: /^criar pacote$/i }));

        await user.click(screen.getByRole("button", { name: /^criar pacote$/i }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/dê um nome ao pacote/i);

        await user.type(screen.getByLabelText("Nome"), "Domingo");
        await user.type(screen.getByLabelText("Preço (R$)"), "900");
        await user.click(within(screen.getByRole("radiogroup", { name: /monitor kids neste pacote/i })).getByRole("radio", { name: "Incluso" }));
        await user.click(screen.getByRole("button", { name: /^criar pacote$/i }));

        await waitFor(() => expect(body).not.toBeNull());
        expect(body).toMatchObject({ name: "Domingo", basePriceAmount: 900, validWeekdays: null, items: [{ itemId: "it-1", mode: "INCLUDED" }] });
    });

    it("saves the cancellation policy", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/tenant/settings`, () => HttpResponse.json({ data: SETTINGS })),
            http.put(`${BASE}/tenant/settings`, async ({ request }) => {
                body = await request.json() as Record<string, unknown>;
                return HttpResponse.json({ data: SETTINGS });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=booking");
        expect(await screen.findByText(/usando a política padrão/i)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /salvar regras/i }));
        await waitFor(() => expect(body).not.toBeNull());
        expect(body).toMatchObject({ cancellationPolicy: { tiers: [{ minDays: 30, percentage: 100 }, { minDays: 0, percentage: 0 }] } });
    });

    it("pauses an item after confirming", async () => {
        const patch = vi.fn();
        server.use(
            http.get(`${BASE}/admin/items`, () => HttpResponse.json({ data: [{ ...MONITOR, key: null }] })),
            http.patch(`${BASE}/admin/items/it-1`, async ({ request }) => {
                patch(await request.json());
                return HttpResponse.json({ data: { ...MONITOR, isActive: false } });
            }),
        );
        const user = userEvent.setup();
        renderAt("/painel?tab=rules&section=items");
        await user.click(await screen.findByRole("button", { name: /pausar monitor kids/i }));
        await waitFor(() => expect(patch).toHaveBeenCalledWith({ isActive: false }));
    });
});
