import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import GoogleButton from "../../components/GoogleButton";
import { oauthState } from "../mocks/react-oauth-google";

const envState = vi.hoisted(() => ({ googleLoginEnabled: false }));
vi.mock("../../config/env", async (orig) => {
    const actual = await orig<typeof import("../../config/env")>();
    return { env: new Proxy(actual.env, { get: (t, k) => (k === "googleLoginEnabled" ? envState.googleLoginEnabled : t[k as keyof typeof t]) }) };
});

const { default: Login } = await import("../../pages/Login");
const { default: SignUp } = await import("../../pages/SignUp");

function renderPage(page: "login" | "signup") {
    return render(
        <AuthProvider>
            <MemoryRouter>{page === "login" ? <Login introFinished /> : <SignUp introFinished />}</MemoryRouter>
        </AuthProvider>,
    );
}

afterEach(() => {
    oauthState.clientId = "test-client-id";
    envState.googleLoginEnabled = false;
});

describe("login com Google sem configuração", () => {
    it("o botão não renderiza nada sem o ID do cliente", () => {
        oauthState.clientId = "";
        const { container } = render(<AuthProvider><MemoryRouter><GoogleButton navigate={vi.fn()} /></MemoryRouter></AuthProvider>);
        expect(container).toBeEmptyDOMElement();
    });

    it.each(["login", "signup"] as const)("%s sem VITE_GOOGLE_CLIENT_ID: sem 'ou continue com' e sem botão", (page) => {
        renderPage(page);
        expect(screen.queryByText("ou continue com")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /google/i })).not.toBeInTheDocument();
    });

    it.each(["login", "signup"] as const)("%s com o ID configurado mostra o Google", (page) => {
        envState.googleLoginEnabled = true;
        renderPage(page);
        expect(screen.getByText("ou continue com")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    });
});
