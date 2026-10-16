import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import Admin from "../../pages/Admin";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function LocationProbe() {
    const l = useLocation();
    return <div data-testid="location">{l.pathname}{l.search}</div>;
}

function renderPanel(path = "/painel") {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "d@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes><Route path="/painel" element={<Admin />} /></Routes>
                <LocationProbe />
            </MemoryRouter>
        </AuthProvider>,
    );
}

const plans = (list: { isActive: boolean }[]) => server.use(http.get(`${BASE}/admin/plans`, () => HttpResponse.json({ data: list.map((p, i) => ({ id: `p${i}`, name: `Pacote ${i}`, ...p })) })));

beforeEach(() => localStorage.clear());

describe("Painel: salão sem pacote ativo", () => {
    it("avisa que o salão não aparece na vitrine e leva para criar pacote", async () => {
        plans([{ isActive: false }]);
        const user = userEvent.setup();
        renderPanel();
        expect(await screen.findByRole("heading", { name: "Seu salão ainda não aparece na vitrine" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Criar pacote" }));
        expect(screen.getByTestId("location")).toHaveTextContent("/painel?tab=rules");
        // na seção de pacotes o passo a passo já orienta: o aviso sai
        expect(screen.queryByRole("heading", { name: "Seu salão ainda não aparece na vitrine" })).not.toBeInTheDocument();
    });

    it("com um pacote ativo, não avisa", async () => {
        plans([{ isActive: false }, { isActive: true }]);
        renderPanel("/painel?tab=reservations");
        expect(await screen.findByRole("heading", { name: "Painel do espaço" })).toBeInTheDocument();
        await new Promise((r) => setTimeout(r, 50));
        expect(screen.queryByRole("heading", { name: "Seu salão ainda não aparece na vitrine" })).not.toBeInTheDocument();
    });
});
