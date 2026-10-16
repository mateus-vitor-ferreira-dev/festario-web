import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderRules() {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "d@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/painel?tab=rules"]}>
                <Routes><Route path="/painel" element={<Admin />} /></Routes>
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => localStorage.clear());

describe("Pacotes: começar de um modelo", () => {
    it("o salão sem pacote escolhe um modelo, que vem preenchido e sem preço", async () => {
        let body: Record<string, unknown> | null = null;
        server.use(
            http.get(`${BASE}/admin/plans`, () => HttpResponse.json({ data: [] })),
            http.post(`${BASE}/admin/plans`, async ({ request }) => {
                body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ data: { id: "p1", ...body } }, { status: 201 });
            }),
        );
        const user = userEvent.setup();
        renderRules();

        const templates = await screen.findByRole("group", { name: "Começar de um modelo" });
        // nenhum modelo usa os nomes de pacotes de outro salão
        expect(templates.textContent).not.toMatch(/promocional|essencial|completa/i);
        await user.click(within(templates).getByRole("button", { name: /festa infantil de fim de semana/i }));

        expect(screen.getByText(/começando do modelo/i)).toHaveTextContent("Festa infantil de fim de semana");
        expect(screen.getByLabelText("Nome")).toHaveValue("Festa infantil");

        // o preço é sempre do salão: o modelo não traz, e não dá para salvar sem
        await user.click(screen.getByRole("button", { name: /salvar|criar pacote/i }));
        expect(await screen.findByRole("alert")).toHaveTextContent("Informe o preço do pacote.");

        await user.type(screen.getByLabelText(/preço/i), "900");
        await user.click(screen.getByRole("button", { name: /salvar|criar pacote/i }));
        await waitFor(() => expect(body).toMatchObject({
            name: "Festa infantil", basePriceAmount: 900, validWeekdays: [6, 0], validOnHolidays: true,
            earliestStartMinute: 780, latestEndMinute: 1200, minDurationMinutes: 240, maxDurationMinutes: 240,
        }));
    });
});
