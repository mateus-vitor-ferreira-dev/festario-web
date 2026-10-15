import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import Profile from "../../pages/Profile";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const ME = { id: "u1", name: "Ana Souza", email: "ana@x.com", role: "USER", emailVerifiedAt: "2026-01-01" };

function renderPage() {
    localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: ME }));
    return render(
        <AuthProvider>
            <MemoryRouter><Profile /><ToastContainer /></MemoryRouter>
        </AuthProvider>,
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

describe("Perfil → Endereço", () => {
    it("explica a finalidade, salva pelo CEP e mostra a região encontrada", async () => {
        let body: unknown = null;
        server.use(
            http.get(`${BASE}/users/me`, () => HttpResponse.json({ data: { ...ME, postalCode: null, hasLocation: false } })),
            http.put(`${BASE}/users/me/address`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ data: { ...ME, postalCode: "37203-775", street: "Rua X", neighborhood: "Jardim Vila Rica", city: "Lavras", state: "MG", hasLocation: true } });
            }),
        );
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText(/mostrar primeiro os salões mais perto/i)).toBeInTheDocument();
        await user.type(screen.getByLabelText("CEP"), "372037");
        await user.click(screen.getByRole("button", { name: "Salvar CEP" }));
        expect(await screen.findByText(/8 números do CEP/i)).toBeInTheDocument();
        await user.type(screen.getByLabelText("CEP"), "75");
        expect(screen.getByLabelText("CEP")).toHaveValue("37203-775");
        await user.click(screen.getByRole("button", { name: "Salvar CEP" }));
        await waitFor(() => expect(body).toEqual({ postalCode: "37203-775" }));
        expect(await screen.findByText("Rua X, Jardim Vila Rica, Lavras - MG")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remover endereço" })).toBeInTheDocument();
    });

    it("remove o endereço com confirmação; erro de CEP aparece no campo", async () => {
        let removed = false;
        server.use(
            http.get(`${BASE}/users/me`, () => HttpResponse.json({ data: { ...ME, postalCode: "37203-775", city: "Lavras", state: "MG", hasLocation: true } })),
            http.delete(`${BASE}/users/me/address`, () => { removed = true; return HttpResponse.json({ data: { ...ME, postalCode: null, city: null, state: null, hasLocation: false } }); }),
            http.put(`${BASE}/users/me/address`, () => HttpResponse.json({ error: { message: "CEP não encontrado. Confira os números." } }, { status: 422 })),
        );
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderPage();
        const cep = await screen.findByLabelText("CEP");
        await waitFor(() => expect(cep).toHaveValue("37203-775"));
        await user.clear(cep);
        await user.type(cep, "99999999");
        await user.click(screen.getByRole("button", { name: "Trocar CEP" }));
        expect(await screen.findByText(/CEP não encontrado/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Remover endereço" }));
        await waitFor(() => expect(removed).toBe(true));
        expect(await screen.findByRole("button", { name: "Salvar CEP" })).toBeInTheDocument();
    });
});
