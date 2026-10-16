import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Home from "../../pages/Home";
import { server } from "../mocks/server";
import { AuthProvider } from "../../contexts/AuthContext";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Home />
                <ToastContainer />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("Home extra coverage", () => {
    it("falls back gracefully when user name is missing", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({
                user: {},
                token: "fake-token",
            })
        );

        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        id: "user-1",
                        name: null,
                        email: "teste@email.com",
                        role: "USER",
                    },
                })
            ),
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [] })
            )
        );

        renderPage();

        expect(await screen.findByText(/bo[ma] (tarde|noite|dia)/i)).toBeInTheDocument();
        expect(screen.getByText(/usuário/i)).toBeInTheDocument();
    });

    it("shows empty upcoming reservations state when list is empty", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({
                user: { name: "Alex" },
                token: "fake-token",
            })
        );

        server.use(
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: true, data: [] })
            )
        );

        renderPage();

        expect(
            await screen.findByText(/nenhuma reserva futura encontrada/i)
        ).toBeInTheDocument();
    });

    it("shows venues fallback when venues request fails but reservations succeed", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({
                user: { name: "Alex" },
                token: "fake-token",
            })
        );

        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        id: "user-1",
                        name: "Alex",
                        email: "alex@email.com",
                        role: "USER",
                    },
                })
            ),
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "res-1",
                            status: "PENDING",
                            // data relativa: uma data fixa vira passado e muda as contagens
                            startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                            endDate: new Date(Date.now() + 30 * 86400000 + 4 * 3600000).toISOString(),
                            venue: { name: "Salão Principal" },
                        },
                    ],
                })
            ),
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            )
        );

        renderPage();

        expect(await screen.findByText(/salão principal/i)).toBeInTheDocument();
        expect(screen.getByText(/^0$/)).toBeInTheDocument();
    });

    it("shows reservations fallback when reservations request fails but venues succeed", async () => {
        localStorage.setItem(
            "festario:userData",
            JSON.stringify({
                user: { name: "Alex" },
                token: "fake-token",
            })
        );

        server.use(
            http.get(`${BASE}/users/me`, () =>
                HttpResponse.json({
                    success: true,
                    data: {
                        id: "user-1",
                        name: "Alex",
                        email: "alex@email.com",
                        role: "USER",
                    },
                })
            ),
            http.get(`${BASE}/reservations`, () =>
                HttpResponse.json({ success: false }, { status: 500 })
            ),
            http.get(`${BASE}/venues`, () =>
                HttpResponse.json({
                    success: true,
                    data: [
                        {
                            id: "venue-1",
                            name: "Salão Principal",
                            location: "Lavras - MG",
                            basePricePerHour: 65000,
                        },
                    ],
                })
            )
        );

        renderPage();

        expect(await screen.findByText(/nenhuma reserva futura encontrada/i)).toBeInTheDocument();
        expect(screen.getByText(/salão principal/i)).toBeInTheDocument();
    });
});