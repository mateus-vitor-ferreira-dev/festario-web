import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import { SALON_ORIGIN_KEY } from "../../hooks/useSalonOrigin";
import Salons from "../../pages/Salons";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const CARD = {
    slug: "salao-jardim-das-flores",
    name: "Salão Jardim das Flores",
    logoUrl: null,
    logoVariants: null,
    primaryColor: "#1f6b4f",
    primaryColorDark: "#7fd1ae",
    cover: null,
    neighborhood: "Centro",
    city: "Lavras",
    state: "MG",
    capacity: { min: 60, max: 150 },
    startingPrice: 1200,
    amenities: { hasPool: true, hasKidsArea: false },
    venueCount: 2,
    distanceKm: 3.24,
    nearestVenueId: "v1",
};

function listResponse(data: unknown[], origin: unknown = null) {
    return HttpResponse.json({ data, pagination: { page: 1, limit: 12, total: data.length, totalPages: 1 }, origin, sort: "distance" });
}

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderPage(user: Record<string, unknown> = { id: "u1", name: "Ana", role: "USER" }, path = "/saloes") {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/saloes" element={<Salons />} />
                    <Route path="/s/:slug" element={<div>Salon Page</div>} />
                </Routes>
                <LocationProbe />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

/** Guarda os parâmetros de cada chamada à vitrine. */
function captureSalons(handler: (url: URL) => Response = () => listResponse([CARD])) {
    const calls: URLSearchParams[] = [];
    server.use(http.get(`${BASE}/salons`, ({ request }) => {
        const url = new URL(request.url);
        calls.push(url.searchParams);
        return handler(url);
    }));
    return calls;
}

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("Vitrine de salões", () => {
    it("mostra o card com distância, local, preço, convidados e comodidades, e leva à página do salão", async () => {
        captureSalons(() => listResponse([CARD], { source: "profile", label: "Centro, Lavras - MG" }));
        const user = userEvent.setup();
        renderPage({ id: "u1", name: "Ana", role: "USER", hasLocation: true, neighborhood: "Centro", city: "Lavras", state: "MG" });

        const link = await screen.findByRole("link", { name: /salão jardim das flores/i });
        const card = within(link);
        expect(card.getByText("a 3,2 km")).toBeInTheDocument();
        expect(card.getByText("Centro, Lavras - MG")).toBeInTheDocument();
        expect(card.getByText(/R\$\s?1\.200/)).toBeInTheDocument();
        expect(card.getByText("de 60 a 150 convidados")).toBeInTheDocument();
        expect(card.getByText("Piscina")).toBeInTheDocument();
        expect(card.getByText("2 espaços")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "1 salão" })).toBeInTheDocument();

        await user.click(link);
        expect(screen.getByTestId("location")).toHaveTextContent("/s/salao-jardim-das-flores");
    });

    it("o card mostra até três comodidades e o resto como +N", async () => {
        captureSalons(() => listResponse([{ ...CARD, amenityList: ["POOL", "PARKING", "BUFFET", "LIVE_MUSIC", "DJ"] }]));
        renderPage();
        const link = await screen.findByRole("link", { name: /salão jardim das flores/i });
        const tags = within(within(link).getByRole("list", { name: "Comodidades" })).getAllByRole("listitem").map((li) => li.textContent);
        // a ordem é a do catálogo (estrutura antes de serviços), não a da resposta
        expect(tags).toEqual(["Piscina", "Estacionamento", "Buffet", "+2", "2 espaços"]);
    });

    it("com endereço no perfil, mede a partir dele sem pedir nada", async () => {
        const calls = captureSalons();
        renderPage({ id: "u1", name: "Ana", role: "USER", hasLocation: true, neighborhood: "Centro", city: "Lavras", state: "MG" });

        expect(await screen.findByRole("heading", { name: "Perto de Centro, Lavras - MG" })).toBeInTheDocument();
        await waitFor(() => expect(calls.at(-1)?.get("origin")).toBe("profile"));
    });

    it("sem localização, convida a informar e lista todos os salões sem origem", async () => {
        const calls = captureSalons();
        renderPage();

        expect(await screen.findByRole("heading", { name: /veja primeiro os salões perto de você/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Usar minha localização" })).toBeInTheDocument();
        await screen.findByRole("link", { name: /salão jardim das flores/i });
        const last = calls.at(-1)!;
        expect(last.has("origin") || last.has("lat") || last.has("cep")).toBe(false);
        // sem origem, "mais perto" não é opção de ordem
        expect(screen.queryByRole("option", { name: "Mais perto" })).not.toBeInTheDocument();
    });

    it("usa o CEP digitado depois de conferir na API e guarda na sessão", async () => {
        const calls = captureSalons((url) => listResponse([CARD], url.searchParams.get("cep") ? { source: "cep", label: "Jardim Vila Rica, Lavras - MG" } : null));
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByLabelText("CEP"), "37203775");
        await user.click(screen.getByRole("button", { name: "Usar CEP" }));

        expect(await screen.findByRole("heading", { name: "Perto de Jardim Vila Rica, Lavras - MG" })).toBeInTheDocument();
        await waitFor(() => expect(calls.at(-1)?.get("cep")).toBe("37203-775"));
        expect(JSON.parse(sessionStorage.getItem(SALON_ORIGIN_KEY)!)).toMatchObject({ kind: "cep", cep: "37203-775" });
    });

    it("um CEP que a API não acha mostra o erro e não troca a origem", async () => {
        captureSalons((url) => url.searchParams.get("cep")
            ? HttpResponse.json({ success: false, message: "CEP não encontrado. Confira os números ou informe outro.", code: "CEP_NOT_FOUND" }, { status: 422 })
            : listResponse([CARD]));
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByLabelText("CEP"), "99999999");
        await user.click(screen.getByRole("button", { name: "Usar CEP" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(/cep não encontrado/i);
        expect(screen.getByRole("heading", { name: /veja primeiro os salões perto de você/i })).toBeInTheDocument();
    });

    it("usa a localização do navegador, arredondada, e explica quando ela é bloqueada", async () => {
        const calls = captureSalons();
        let allow = true;
        vi.stubGlobal("navigator", {
            ...navigator,
            geolocation: {
                getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) => {
                    if (allow) ok({ coords: { latitude: -21.245678, longitude: -44.999912 } } as GeolocationPosition);
                    else fail({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError);
                },
            },
        });
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole("button", { name: "Usar minha localização" }));
        expect(await screen.findByRole("heading", { name: "Perto da sua localização atual" })).toBeInTheDocument();
        await waitFor(() => expect(calls.at(-1)?.get("lat")).toBe("-21.246"));
        expect(calls.at(-1)?.get("lng")).toBe("-45");

        allow = false;
        await user.click(screen.getByRole("button", { name: "Trocar" }));
        await user.click(screen.getByRole("button", { name: "Usar minha localização" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/bloqueada/i);
    });

    it("leva os filtros da URL para a API e mostra cada um como chip, uma comodidade por chip", async () => {
        const calls = captureSalons(() => listResponse([]));
        const user = userEvent.setup();
        renderPage(undefined, "/saloes?city=Lavras&minCapacity=80&amenities=BUFFET,POOL&sort=price");

        expect(await screen.findByText("Nenhum salão com esses filtros")).toBeInTheDocument();
        const last = calls.at(-1)!;
        expect(last.get("city")).toBe("Lavras");
        expect(last.get("minCapacity")).toBe("80");
        expect(last.get("amenities")).toBe("BUFFET,POOL");
        expect(last.get("sort")).toBe("price");
        expect(screen.getByRole("button", { name: /remover filtro cidade: lavras/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remover filtro Piscina" })).toBeInTheDocument();

        // tirar uma comodidade mantém as outras
        await user.click(screen.getByRole("button", { name: "Remover filtro Buffet" }));
        expect(screen.getByTestId("location")).toHaveTextContent("amenities=POOL");
        expect(screen.getByTestId("location")).not.toHaveTextContent("BUFFET");
    });

    it("escolhe várias comodidades no seletor, na ordem do catálogo, e fecha com Esc", async () => {
        captureSalons();
        const user = userEvent.setup();
        renderPage();

        const trigger = await screen.findByRole("button", { name: /comodidades/i });
        expect(trigger).toHaveTextContent("Qualquer uma");
        await user.click(trigger);
        const panel = screen.getByRole("group", { name: "Comodidades" });
        expect(within(panel).getByRole("group", { name: "Estrutura" })).toBeInTheDocument();
        expect(within(panel).getByRole("group", { name: "Serviços" })).toBeInTheDocument();

        await user.click(within(panel).getByRole("checkbox", { name: "Banda / música ao vivo" }));
        await user.click(within(panel).getByRole("checkbox", { name: "Área kids" }));
        await user.click(within(panel).getByRole("checkbox", { name: "Garçons" }));
        expect(screen.getByTestId("location")).toHaveTextContent("amenities=KIDS_AREA%2CWAITERS%2CLIVE_MUSIC");
        expect(trigger).toHaveTextContent("Área kids, Garçons +1");

        await user.keyboard("{Escape}");
        expect(screen.queryByRole("group", { name: "Comodidades" })).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it("sem nenhum salão na plataforma, diz isso em vez de sugerir limpar filtros", async () => {
        captureSalons(() => listResponse([]));
        renderPage();
        expect(await screen.findByText("Ainda não há salões abertos para reserva.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
    });
});
