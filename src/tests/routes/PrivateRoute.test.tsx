import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import { PrivateRoute } from "../../routes/PrivateRoute";

function renderWithRoute(userData) {
    if (userData) {
        localStorage.setItem("festario:userData", JSON.stringify(userData));
    } else {
        localStorage.removeItem("festario:userData");
    }

    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/home"]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/home" element={<div>Home Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("PrivateRoute", () => {
    afterEach(() => localStorage.clear());

    it("renders the protected page when user is logged in", () => {
        renderWithRoute({ token: "fake-token", user: { role: "USER" } });
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("redirects to /login when there is no userData in localStorage", () => {
        renderWithRoute(null);
        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Home Page")).not.toBeInTheDocument();
    });
});
