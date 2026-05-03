import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { AdminRoute } from "../../routes/AdminRoute";

function renderWithRoute(userData) {
    if (userData) {
        localStorage.setItem("recanto:userData", JSON.stringify(userData));
    } else {
        localStorage.removeItem("recanto:userData");
    }

    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/admin"]}>
                <Routes>
                    <Route path="/home" element={<div>Home Page</div>} />
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<div>Admin Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("AdminRoute", () => {
    afterEach(() => localStorage.clear());

    it("renders the admin page when user has ADMIN role", () => {
        renderWithRoute({ token: "fake-token", user: { role: "ADMIN" } });
        expect(screen.getByText("Admin Page")).toBeInTheDocument();
    });

    it("redirects to /home when user has USER role", () => {
        renderWithRoute({ token: "fake-token", user: { role: "USER" } });
        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Admin Page")).not.toBeInTheDocument();
    });

    it("redirects to /home when there is no userData", () => {
        renderWithRoute(null);
        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Admin Page")).not.toBeInTheDocument();
    });
});
