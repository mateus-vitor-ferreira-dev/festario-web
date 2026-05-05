import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { describe, expect, it } from "vitest";
import Home from "../../pages/Home";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

function renderPage() {
    return render(
        <MemoryRouter>
            <Home />
            <ToastContainer />
        </MemoryRouter>
    );
}

describe("Home extra coverage", () => {
    it("falls back gracefully when user name is missing", async () => {
        localStorage.setItem(
            "recanto:userData",
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
            "recanto:userData",
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
            "recanto:userData",
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
                            startDate: "2026-05-10T10:00:00.000Z",
                            endDate: "2026-05-10T14:00:00.000Z",
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
            "recanto:userData",
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