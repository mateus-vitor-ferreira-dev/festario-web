import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Header from "../../components/Header";
import SalonMark from "../../components/SalonMark";
import VenueCover from "../../components/VenueCover";
import VenueGallery from "../../components/VenueGallery";
import { AuthProvider } from "../../contexts/AuthContext";
import { SalonBrandProvider } from "../../contexts/SalonBrandContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import type { VenuePhoto } from "../../types";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

const photo = (id: string, alt: string, isCover = false): VenuePhoto => ({
    id, alt, isCover, sortOrder: 0, width: 1600, height: 1000,
    variants: [480, 960, 1600].map((w) => ({ width: w, height: Math.round(w / 1.6), url: `https://img.test/${id}-${w}.webp` })),
});

beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty("--salon-color");
});

describe("SalonMark", () => {
    it("mostra a logo no tamanho certo, ou as iniciais sem imagem quebrada", () => {
        const { rerender } = render(<SalonMark name="Recanto Vila Rica" logoVariants={photo("logo", "").variants} size="md" />);
        const img = screen.getByRole("img", { name: "Logo de Recanto Vila Rica" });
        expect(img).toHaveAttribute("src", "https://img.test/logo-480.webp");
        expect(img.getAttribute("srcset")).toContain("logo-480.webp 480w");

        rerender(<SalonMark name="Salão das Flores" size="md" />);
        expect(screen.getByRole("img", { name: "Salão das Flores" })).toHaveTextContent("SF");

        rerender(<SalonMark name="Salão das Flores" size="md" decorative />);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});

describe("VenueCover", () => {
    it("reserva o espaço e carrega tarde fora da primeira dobra", () => {
        render(<VenueCover venueName="Recanto" photo={photo("p1", "Salão com mesas")} sizes="400px" />);
        const img = screen.getByRole("img", { name: "Salão com mesas" });
        expect(img).toHaveAttribute("loading", "lazy");
        expect(img).toHaveAttribute("width", "1600");
        expect(img).toHaveAttribute("height", "1000");
        expect(img).toHaveAttribute("sizes", "400px");
    });

    it("sem foto: ilustração com as iniciais, descrita para leitor de tela", () => {
        render(<VenueCover venueName="Quiosque Gourmet" photo={null} sizes="400px" />);
        expect(screen.getByRole("img", { name: "Quiosque Gourmet: ainda sem fotos" })).toHaveTextContent("QG");
    });
});

describe("VenueGallery", () => {
    it("abre a foto, navega pelas setas, fecha com Esc e devolve o foco", async () => {
        const photos = [photo("a", "Salão", true), photo("b", "Piscina"), photo("c", "Área kids")];
        const user = userEvent.setup();
        render(<VenueGallery venueName="Recanto" photos={photos} />);
        const cover = screen.getByRole("button", { name: "Ampliar: Salão" });
        expect(within(cover).getByRole("img", { name: "Salão" })).toHaveAttribute("loading", "eager");

        await user.click(cover);
        const dialog = screen.getByRole("dialog", { name: "Fotos de Recanto" });
        expect(within(dialog).getByText("1 de 3")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(within(dialog).getByRole("img", { name: "Piscina" })).toBeInTheDocument();
        await user.keyboard("{ArrowLeft}{ArrowLeft}");
        expect(within(dialog).getByText("3 de 3")).toBeInTheDocument();

        await user.tab();
        expect(dialog.contains(document.activeElement)).toBe(true);

        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(cover).toHaveFocus();
    });

    it("com muitas fotos, a última miniatura diz quantas faltam", () => {
        const photos = Array.from({ length: 8 }, (_, i) => photo(`p${i}`, `Foto ${i}`, i === 0));
        render(<VenueGallery venueName="Recanto" photos={photos} />);
        expect(screen.getByRole("button", { name: "Ver as outras 4 fotos" })).toHaveTextContent("+4");
    });

    it("sem fotos: a ilustração no lugar", () => {
        render(<VenueGallery venueName="Quiosque" photos={[]} />);
        expect(screen.getByRole("img", { name: /ainda sem fotos/ })).toBeInTheDocument();
    });
});

describe("Header com o salão", () => {
    function renderHeader(path = "/home") {
        localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: { id: "u", name: "Ana Souza", role: "USER" } }));
        return render(
            <ThemeProvider>
                <AuthProvider>
                    <SalonBrandProvider>
                        <MemoryRouter initialEntries={[path]}>
                            <Routes><Route path="*" element={<Header />} /></Routes>
                        </MemoryRouter>
                    </SalonBrandProvider>
                </AuthProvider>
            </ThemeProvider>,
        );
    }

    it("mostra o nome e a logo do salão e aplica a cor como acento", async () => {
        server.use(http.get(`${BASE}/tenant`, () => HttpResponse.json({ data: { slug: "jardim", name: "Salão das Flores", primaryColor: "#1f6b4f", primaryColorDark: "#7fd1ae", logoVariants: null } })));
        renderHeader();
        const link = await screen.findByRole("link", { name: /salão das flores/i });
        expect(link).toHaveAttribute("href", "/venues");
        await waitFor(() => expect(document.documentElement.style.getPropertyValue("--salon-color")).toBe("#1f6b4f"));
        expect(document.documentElement.style.getPropertyValue("--salon-color-dark")).toBe("#7fd1ae");
    });

    it("na área da plataforma não mostra salão", async () => {
        renderHeader("/plataforma");
        await screen.findByRole("navigation", { name: "Principal" });
        await new Promise((r) => setTimeout(r, 50));
        expect(screen.queryByRole("link", { name: /espaços de/i })).not.toBeInTheDocument();
    });
});
