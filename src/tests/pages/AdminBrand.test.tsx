import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { SalonBrandProvider } from "../../contexts/SalonBrandContext";
import Admin from "../../pages/Admin";
import type { VenuePhoto } from "../../types";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";
const VENUE = "recanto-vila-rica-main-venue";

const photo = (id: string, alt: string, sortOrder: number, isCover = false): VenuePhoto => ({
    id, alt, isCover, sortOrder, width: 1280, height: 960,
    variants: [{ width: 480, height: 360, url: `https://img.test/${id}-480.webp` }],
});

const BRAND = { name: "Recanto Vila Rica", logoUrl: null, logoVariants: null, primaryColor: null, primaryColorDark: null };

function renderTab() {
    localStorage.setItem("festario:userData", JSON.stringify({ token: "t", user: { id: "o1", name: "Dona", email: "d@x.com", role: "OWNER" } }));
    return render(
        <AuthProvider>
            <SalonBrandProvider>
                <MemoryRouter initialEntries={["/painel?tab=brand"]}>
                    <Routes><Route path="/painel" element={<Admin />} /></Routes>
                    <ToastContainer />
                </MemoryRouter>
            </SalonBrandProvider>
        </AuthProvider>,
    );
}

function mockApi(photos: VenuePhoto[]) {
    const calls: { method: string; url: string; body: unknown }[] = [];
    let current = photos;
    server.use(
        http.get(`${BASE}/tenant/branding`, () => HttpResponse.json({ data: BRAND })),
        http.get(`${BASE}/venues`, () => HttpResponse.json({ data: [{ id: VENUE, name: "Recanto Vila Rica" }, { id: "quiosque", name: "Quiosque" }] })),
        http.get(`${BASE}/venues/:id/photos`, ({ params }) => HttpResponse.json({ data: params.id === VENUE ? current : [] })),
        http.put(`${BASE}/venues/${VENUE}/photos/order`, async ({ request }) => {
            const body = (await request.json()) as { ids: string[] };
            calls.push({ method: "PUT", url: "order", body });
            current = body.ids.map((id, i) => ({ ...current.find((p) => p.id === id)!, sortOrder: i }));
            return HttpResponse.json({ data: current });
        }),
        http.patch(`${BASE}/venues/${VENUE}/photos/:pid`, async ({ params, request }) => {
            const body = (await request.json()) as { isCover?: boolean; alt?: string };
            calls.push({ method: "PATCH", url: String(params.pid), body });
            current = current.map((p) => (p.id === params.pid ? { ...p, ...body } : body.isCover ? { ...p, isCover: false } : p));
            return HttpResponse.json({ data: current });
        }),
        http.delete(`${BASE}/venues/${VENUE}/photos/:pid`, ({ params }) => {
            calls.push({ method: "DELETE", url: String(params.pid), body: null });
            current = current.filter((p) => p.id !== params.pid);
            return HttpResponse.json({ data: current });
        }),
    );
    return calls;
}

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

describe("Painel → Marca e fotos", () => {
    it("logo: mostra nos dois temas e envia o arquivo em multipart", async () => {
        mockApi([]);
        let field: FormDataEntryValue | null = null;
        server.use(http.post(`${BASE}/tenant/branding/logo`, async ({ request }) => {
            field = (await request.formData()).get("logo");
            return HttpResponse.json({ data: { ...BRAND, logoUrl: "https://img.test/logo-256.webp", logoVariants: [{ width: 256, height: 256, url: "https://img.test/logo-256.webp" }] } });
        }));
        const user = userEvent.setup();
        renderTab();
        expect(await screen.findByText("Tema claro")).toBeInTheDocument();
        expect(screen.getByText("Tema escuro")).toBeInTheDocument();

        await user.upload(screen.getByLabelText("Enviar logo"), new File(["png"], "logo.png", { type: "image/png" }));
        expect(await screen.findByText("Logo atualizada.")).toBeInTheDocument();
        expect(field).not.toBeNull();
        expect(screen.getByRole("button", { name: "Remover logo" })).toBeInTheDocument();
    });

    it("cor: avisa o contraste antes de salvar e só salva a cor que passa", async () => {
        mockApi([]);
        let saved: unknown = null;
        server.use(http.put(`${BASE}/tenant/branding`, async ({ request }) => {
            saved = await request.json();
            return HttpResponse.json({ data: { ...BRAND, primaryColor: "#1f6b4f", primaryColorDark: "#7fd1ae" } });
        }));
        const user = userEvent.setup();
        renderTab();
        const code = await screen.findByLabelText("Código da cor");
        await user.clear(code);
        await user.type(code, "#f4b41a");
        expect(screen.getByText(/abaixo de 4,5:1/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Salvar cor" })).toBeDisabled();

        await user.clear(code);
        await user.type(code, "#1F6B4F");
        expect(screen.getByText(/pode usar/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Salvar cor" }));
        await waitFor(() => expect(saved).toEqual({ primaryColor: "#1f6b4f" }));
        expect(await screen.findByRole("button", { name: "Usar a cor da plataforma" })).toBeInTheDocument();
    });

    it("fotos: reordena pelos botões, define a capa, edita a descrição e exclui", async () => {
        const calls = mockApi([photo("a", "Salão", 0, true), photo("b", "Piscina", 1)]);
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const user = userEvent.setup();
        renderTab();
        const sheet = await screen.findByRole("list", { name: /fotos de recanto vila rica/i });
        expect(within(sheet).getByText("Capa")).toBeInTheDocument();
        expect(within(sheet).getByRole("button", { name: 'Mover "Salão" para antes' })).toBeDisabled();

        await user.click(within(sheet).getByRole("button", { name: 'Mover "Salão" para depois' }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PUT", url: "order", body: { ids: ["b", "a"] } }));

        await user.click(within(sheet).getByRole("button", { name: 'Usar "Piscina" como capa' }));
        await waitFor(() => expect(calls).toContainEqual({ method: "PATCH", url: "b", body: { isCover: true } }));

        const altInput = within(sheet).getAllByLabelText("Descrição da foto")[0];
        await user.clear(altInput);
        await user.type(altInput, "Piscina aquecida{Enter}");
        await waitFor(() => expect(calls.some((c) => c.method === "PATCH" && (c.body as { alt?: string }).alt === "Piscina aquecida")).toBe(true));

        await user.click(await within(sheet).findByRole("button", { name: 'Excluir "Salão"' }));
        await waitFor(() => expect(calls).toContainEqual({ method: "DELETE", url: "a", body: null }));
    });

    it("envio: exige a descrição e mostra o erro da API", async () => {
        mockApi([]);
        let alt: FormDataEntryValue | null = null;
        server.use(http.post(`${BASE}/venues/${VENUE}/photos`, async ({ request }) => {
            alt = (await request.formData()).get("alt");
            return HttpResponse.json({ error: { message: "A imagem é pequena demais (300×200)." } }, { status: 422 });
        }));
        const user = userEvent.setup();
        renderTab();
        expect(await screen.findByText(/ainda não tem fotos/i)).toBeInTheDocument();
        await user.upload(screen.getByLabelText("Escolher foto"), new File(["jpg"], "salao.jpg", { type: "image/jpeg" }));
        await user.click(screen.getByRole("button", { name: "Enviar foto" }));
        expect(await screen.findByText(/descreva a foto/i)).toBeInTheDocument();

        await user.type(screen.getByLabelText(/descrição da foto \(obrigatória\)/i), "Salão montado");
        await user.click(screen.getByRole("button", { name: "Enviar foto" }));
        await waitFor(() => expect(alt).toBe("Salão montado"));
        expect(await screen.findByRole("alert")).toBeInTheDocument();
    });

    it("troca de espaço carrega as fotos dele", async () => {
        mockApi([photo("a", "Salão", 0, true)]);
        const user = userEvent.setup();
        renderTab();
        await screen.findByRole("list", { name: /fotos de recanto vila rica/i });
        await user.selectOptions(screen.getByLabelText("Espaço"), "quiosque");
        expect(await screen.findByText(/quiosque ainda não tem fotos/i)).toBeInTheDocument();
    });
});
