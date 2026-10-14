import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { RoleRoute } from "../../routes/RoleRoute";

function renderAt(path: string, role?: string) {
    if (role) {
        localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: { id: "u", name: "X", email: "x@x.com", role } }));
    }
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                    <Route element={<RoleRoute roles={["OWNER", "ADMIN"]} />}>
                        <Route path="/painel" element={<div>Painel Page</div>} />
                    </Route>
                    <Route element={<RoleRoute roles={["ADMIN"]} />}>
                        <Route path="/plataforma" element={<div>Plataforma Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

describe("RoleRoute", () => {
    afterEach(() => localStorage.clear());

    it("blocks USER from /painel (goes to /home)", () => {
        renderAt("/painel", "USER");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Painel Page")).not.toBeInTheDocument();
    });

    it("blocks USER from /plataforma (goes to /home)", () => {
        renderAt("/plataforma", "USER");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Plataforma Page")).not.toBeInTheDocument();
    });

    it("lets OWNER into /painel", () => {
        renderAt("/painel", "OWNER");
        expect(screen.getByText("Painel Page")).toBeInTheDocument();
    });

    it("blocks OWNER from /plataforma (goes to /painel)", () => {
        renderAt("/plataforma", "OWNER");
        expect(screen.getByText("Painel Page")).toBeInTheDocument();
        expect(screen.queryByText("Plataforma Page")).not.toBeInTheDocument();
    });

    it("lets ADMIN into /plataforma and /painel", () => {
        const { unmount } = renderAt("/plataforma", "ADMIN");
        expect(screen.getByText("Plataforma Page")).toBeInTheDocument();
        unmount();
        renderAt("/painel", "ADMIN");
        expect(screen.getByText("Painel Page")).toBeInTheDocument();
    });

    it("sends visitors without session to /login", () => {
        renderAt("/painel");
        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("treats a session without role as USER", () => {
        localStorage.setItem("recanto:userData", JSON.stringify({ token: "t", user: { id: "u" } }));
        renderAt("/painel");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
});
