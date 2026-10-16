import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Admin from "../../pages/Admin";
import Reservations from "../../pages/Reservations";
import Negotiations from "../../pages/Negotiations";
import Venues from "../../pages/Venues";
import { server } from "../mocks/server";
import { AuthProvider } from "../../contexts/AuthContext";

const BASE = "http://localhost:3000";

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderAt(url: string) {
    // o painel é do OWNER/ADMIN; ADMIN vê também as ações de feriados
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "admin-1", name: "Admin", email: "admin@x.com", role: "ADMIN" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[url]}>
                <Routes>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/negociacoes" element={<Negotiations />} />
                    <Route path="/venues" element={<Venues />} />
                </Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
            </AuthProvider>,
        );
    }

    const location = () => screen.getByTestId("location").textContent ?? "";

    function reservation(i: number, overrides: Record<string, unknown> = {}) {
        return {
            id: `res-${i}`,
            status: "PAID",
            planCode: "COMPLETA",
            totalPrice: "1060",
            startDate: "2026-11-01T12:00:00.000Z",
            endDate: "2026-11-01T23:00:00.000Z",
            user: { id: "u", name: `Cliente ${i}`, email: `c${i}@x.com` },
            venue: { id: "venue-1", name: "Recanto" },
            ...overrides,
        };
    }

    /** Responde como a API real: aplica page/limit e devolve `pagination`. */
    function paginatedReservations(total: number, capture: string[] = []) {
        return http.get(`${BASE}/admin/reservations`, ({ request }) => {
            capture.push(request.url);
            const url = new URL(request.url);
            const page = Number(url.searchParams.get("page") ?? 1);
            const limit = Number(url.searchParams.get("limit") ?? 20);
            const all = Array.from({ length: total }, (_, i) => reservation(i + 1));
            return HttpResponse.json({
                success: true,
                data: all.slice((page - 1) * limit, page * limit),
                pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
            });
        });
    }

    describe("Admin › Reservas — filtros e paginação", () => {
        it("restores filters and page from the URL and sends them as query params", async () => {
            const urls: string[] = [];
            server.use(
                paginatedReservations(48, urls),
                http.get(`${BASE}/admin/plans`, () => HttpResponse.json({ data: [{ id: "pkg-1", name: "Sábado à tarde" }] })),
            );
            renderAt("/admin?tab=reservations&status=PAID&packageId=pkg-1&minPrice=500&startDate=2026-01-01&page=2");

            await waitFor(() => expect(screen.getByText("Mostrando 16–30 de 48")).toBeInTheDocument());
            const sent = new URL(urls.at(-1)!);
            expect(Object.fromEntries(sent.searchParams)).toMatchObject({
                status: "PAID",
                packageId: "pkg-1",
                minPrice: "500",
                startDate: "2026-01-01",
                sort: "startDate:desc",
                page: "2",
                limit: "15",
            });

            // controles refletem a URL e há um chip por filtro ativo
            expect(screen.getByLabelText("Status")).toHaveValue("PAID");
            await waitFor(() => expect(screen.getByLabelText("Pacote")).toHaveValue("pkg-1"));
            expect(screen.getByRole("button", { name: /remover filtro pacote: sábado à tarde/i })).toBeInTheDocument();
            const chips = screen.getByRole("list", { name: "Filtros ativos" });
            expect(within(chips).getAllByRole("button")).toHaveLength(4);
            expect(screen.getByRole("button", { name: /remover filtro valor mínimo: r\$\s?500,00/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /remover filtro a partir de 01\/01\/2026/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page");
        });

        it("changing a filter updates the URL and goes back to page 1", async () => {
            const urls: string[] = [];
            server.use(paginatedReservations(48, urls));
            const user = userEvent.setup();
            renderAt("/admin?tab=reservations&page=3");
            await waitFor(() => expect(screen.getByText("Mostrando 31–45 de 48")).toBeInTheDocument());

            await user.selectOptions(screen.getByLabelText("Status"), "PENDING");
            await waitFor(() => expect(location()).toBe("/admin?tab=reservations&status=PENDING"));
            await waitFor(() => expect(new URL(urls.at(-1)!).searchParams.get("page")).toBe("1"));

            await user.type(screen.getByLabelText("Cliente"), "lucas{Enter}");
            await waitFor(() => expect(location()).toContain("q=lucas"));
            await waitFor(() => expect(new URL(urls.at(-1)!).searchParams.get("q")).toBe("lucas"));

            fireEvent.change(screen.getByLabelText(/valor máximo em reais/i), { target: { value: "1.200" } });
            fireEvent.blur(screen.getByLabelText(/valor máximo em reais/i));
            await waitFor(() => expect(location()).toContain("maxPrice=1200"));

            await user.selectOptions(screen.getByLabelText("Ordenar por"), "totalPrice:desc");
            await waitFor(() => expect(location()).toContain("sort=totalPrice%3Adesc"));
        });

        it("navigates pages and keeps the filters", async () => {
            server.use(paginatedReservations(48));
            const user = userEvent.setup();
            renderAt("/admin?tab=reservations&status=PAID");
            await waitFor(() => expect(screen.getByText("Mostrando 1–15 de 48")).toBeInTheDocument());

            await user.click(screen.getByRole("button", { name: "Página 4" }));
            await waitFor(() => expect(screen.getByText("Mostrando 46–48 de 48")).toBeInTheDocument());
            expect(location()).toBe("/admin?tab=reservations&status=PAID&page=4");
            expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
        });

        it("shows the no-results state and clears the filters", async () => {
            server.use(
                http.get(`${BASE}/admin/reservations`, ({ request }) => {
                    const filtered = new URL(request.url).searchParams.has("q");
                    const data = filtered ? [] : [reservation(1)];
                    return HttpResponse.json({ success: true, data, pagination: { page: 1, limit: 15, total: data.length, totalPages: 1 } });
                }),
            );
            const user = userEvent.setup();
            renderAt("/admin?tab=reservations&q=ninguem");

            await waitFor(() => expect(screen.getByText("Nenhuma reserva com esses filtros")).toBeInTheDocument());
            // o estado "sem resultados" tem a própria saída "Limpar filtros" (além da dos chips)
            const empty = screen.getByText("Nenhuma reserva com esses filtros").closest("[role=status]") as HTMLElement;
            await user.click(within(empty).getByRole("button", { name: "Limpar filtros" }));

            await waitFor(() => expect(screen.getByText("Cliente 1")).toBeInTheDocument());
            expect(location()).toBe("/admin?tab=reservations");
            expect(screen.getByLabelText("Cliente")).toHaveValue("");
        });

        it("goes to the last page when the URL points past the end", async () => {
            server.use(paginatedReservations(20));
            renderAt("/admin?tab=reservations&page=9");
            await waitFor(() => expect(location()).toBe("/admin?tab=reservations&page=2"));
            await waitFor(() => expect(screen.getByText("Mostrando 16–20 de 20")).toBeInTheDocument());
        });

        it("switching tabs clears the previous tab's filters", async () => {
            server.use(paginatedReservations(3));
            const user = userEvent.setup();
            renderAt("/admin?tab=reservations&status=PAID");
            await waitFor(() => expect(screen.getByText("Cliente 1")).toBeInTheDocument());
            await user.click(screen.getByRole("button", { name: /^usuários$/i }));
            expect(location()).toBe("/admin?tab=users");
        });
    });

    describe("Admin › Negociações e Datas bloqueadas", () => {
        it("sends status and search to /negotiations", async () => {
            const urls: string[] = [];
            server.use(
                http.get(`${BASE}/negotiations`, ({ request }) => {
                    urls.push(request.url);
                    return HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
                }),
            );
            renderAt("/admin?tab=negotiations&status=OPEN&q=casamento");
            await waitFor(() => expect(screen.getByText("Nenhuma negociação com esses filtros")).toBeInTheDocument());
            const sent = new URL(urls.at(-1)!).searchParams;
            expect(sent.get("status")).toBe("OPEN");
            expect(sent.get("q")).toBe("casamento");
        });

        it("filters the old /negotiations shape on the client", async () => {
            server.use(
                http.get(`${BASE}/negotiations`, () =>
                    HttpResponse.json({
                        success: true,
                        data: [
                            { id: "n1", subject: "Casamento", status: "OPEN", user: { name: "Ana" }, createdAt: "2026-01-01" },
                            { id: "n2", subject: "Aniversário", status: "CLOSED", user: { name: "João" }, createdAt: "2026-01-01" },
                        ],
                    }),
                ),
            );
            renderAt("/admin?tab=negotiations&q=joao");
            await waitFor(() => expect(screen.getByText("Aniversário")).toBeInTheDocument());
            expect(screen.queryByText("Casamento")).not.toBeInTheDocument();
        });

        it("filters blocked dates by venue", async () => {
            const urls: string[] = [];
            server.use(
                http.get(`${BASE}/venues`, () =>
                    HttpResponse.json({ success: true, data: [{ id: "v1", name: "Salão" }, { id: "v2", name: "Quiosque" }] }),
                ),
                http.get(`${BASE}/blocked-dates`, ({ request }) => {
                    urls.push(request.url);
                    return HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
                }),
            );
            const user = userEvent.setup();
            renderAt("/admin?tab=blockedDates");
            await waitFor(() => expect(screen.getByLabelText("Espaço")).toBeInTheDocument());
            await user.selectOptions(screen.getByLabelText("Espaço"), "v2");
            await waitFor(() => expect(new URL(urls.at(-1)!).searchParams.get("venueId")).toBe("v2"));
            await waitFor(() => expect(screen.getByText("Nenhuma data bloqueada para esse espaço")).toBeInTheDocument());
        });

        it("keeps the holidays year in the URL", async () => {
            const urls: string[] = [];
            server.use(
                http.get(`${BASE}/admin/holidays`, ({ request }) => {
                    urls.push(request.url);
                    return HttpResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
                }),
            );
            const user = userEvent.setup();
            const next = String(new Date().getFullYear() + 1);
            renderAt("/admin?tab=holidays");
            await waitFor(() => expect(screen.getByLabelText("Ano")).toBeInTheDocument());
            await user.selectOptions(screen.getByLabelText("Ano"), next);
            await waitFor(() => expect(location()).toBe(`/admin?tab=holidays&year=${next}`));
            expect(new URL(urls.at(-1)!).searchParams.get("year")).toBe(next);
        });
    });

    describe("Páginas do cliente", () => {
        it("Minhas reservas: filters by status and shows the no-results state", async () => {
            const urls: string[] = [];
            server.use(
                http.get(`${BASE}/reservations`, ({ request }) => {
                    urls.push(request.url);
                    const status = new URL(request.url).searchParams.get("status");
                    const data = status === "EXPIRED" ? [] : [reservation(1)];
                    return HttpResponse.json({ success: true, data, pagination: { page: 1, limit: 10, total: data.length, totalPages: 1 } });
                }),
            );
            const user = userEvent.setup();
            renderAt("/reservations");
            await waitFor(() => expect(screen.getByLabelText("Mostrar reservas")).toBeInTheDocument());
            await user.selectOptions(screen.getByLabelText("Mostrar reservas"), "EXPIRED");
            await waitFor(() => expect(screen.getByText("Nenhuma reserva com esse status")).toBeInTheDocument());
            expect(location()).toBe("/reservations?status=EXPIRED");
            await user.click(screen.getByRole("button", { name: "Ver todas as reservas" }));
            await waitFor(() => expect(location()).toBe("/reservations"));
        });

        it("Minhas reservas: paginates with the API total", async () => {
            server.use(
                http.get(`${BASE}/reservations`, ({ request }) => {
                    const page = Number(new URL(request.url).searchParams.get("page"));
                    return HttpResponse.json({
                        success: true,
                        data: Array.from({ length: Math.min(10, 48 - (page - 1) * 10) }, (_, i) => reservation(page * 100 + i)),
                        pagination: { page, limit: 10, total: 48, totalPages: 5 },
                    });
                }),
            );
            const user = userEvent.setup();
            renderAt("/reservations?page=5");
            await waitFor(() => expect(screen.getByText("Mostrando 41–48 de 48")).toBeInTheDocument());
            await user.click(screen.getByRole("button", { name: "Anterior" }));
            await waitFor(() => expect(location()).toBe("/reservations?page=4"));
        });

        it("Negociações: paginates", async () => {
            server.use(
                http.get(`${BASE}/negotiations`, ({ request }) => {
                    const page = Number(new URL(request.url).searchParams.get("page"));
                    return HttpResponse.json({
                        success: true,
                        data: [{ id: `n${page}`, subject: `Assunto ${page}`, status: "OPEN", user: { name: "Ana" }, createdAt: "2026-01-01", messages: [] }],
                        pagination: { page, limit: 10, total: 11, totalPages: 2 },
                    });
                }),
            );
            const user = userEvent.setup();
            renderAt("/negociacoes");
            await waitFor(() => expect(screen.getByText("Assunto 1")).toBeInTheDocument());
            await user.click(screen.getByRole("button", { name: "Página 2" }));
            await waitFor(() => expect(screen.getByText("Assunto 2")).toBeInTheDocument());
            expect(location()).toBe("/negociacoes?page=2");
        });

        it("Espaços: shows the starting price and sends capacity/price filters", async () => {
            const urls: string[] = [];
            server.use(
                http.get(`${BASE}/venues`, ({ request }) => {
                    urls.push(request.url);
                    const filtered = new URL(request.url).searchParams.has("minCapacity");
                    const data = filtered ? [] : [
                        { id: "v1", name: "Salão", capacity: 150, startingPrice: "650", hasPool: true, hasKidsArea: true },
                        { id: "v2", name: "Quiosque", capacity: 40, startingPrice: null, hasPool: false, hasKidsArea: false },
                    ];
                    return HttpResponse.json({ success: true, data, pagination: { page: 1, limit: 12, total: data.length, totalPages: 1 } });
                }),
            );
            const user = userEvent.setup();
            renderAt("/venues");
            await waitFor(() => expect(screen.getByText("Salão")).toBeInTheDocument());
            expect(screen.getAllByText("A partir de")).toHaveLength(1);
            expect(screen.getByText(/R\$\s?650/)).toBeInTheDocument();

            await user.type(screen.getByLabelText("Número de convidados"), "200{Enter}");
            await waitFor(() => expect(location()).toBe("/venues?minCapacity=200"));
            await waitFor(() => expect(screen.getByText("Nenhum espaço com esses filtros")).toBeInTheDocument());
            expect(screen.getByRole("button", { name: "Remover filtro Para 200+ pessoas" })).toBeInTheDocument();

            await user.type(screen.getByLabelText("Preço máximo (R$)"), "1.500{Enter}");
            await waitFor(() => expect(location()).toContain("maxPrice=1500"));
            expect(new URL(urls.at(-1)!).searchParams.get("maxPrice")).toBe("1500");
        });
    });
