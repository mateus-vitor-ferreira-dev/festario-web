import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext";
import ChatWidget from "../../components/ChatWidget";

function renderWidget() {
    return render(
        <AuthProvider>
            <ChatWidget />
        </AuthProvider>
    );
}

function makeFetchMock(chunks = ['data: {"text":"Olá!"}\n', "data: [DONE]\n"]) {
    const encoder = new TextEncoder();
    let index = 0;
    const reader = {
        read: vi.fn(async () => {
            if (index < chunks.length) {
                return { done: false, value: encoder.encode(chunks[index++]) };
            }
            return { done: true, value: undefined };
        }),
    };
    return vi.fn().mockResolvedValue({
        ok: true,
        body: { getReader: () => reader },
    });
}

describe("ChatWidget", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it("renders FAB button initially, chat window is closed", () => {
        renderWidget();
        expect(screen.getByRole("button", { name: /abrir chat/i })).toBeInTheDocument();
        expect(screen.queryByText(/assistente recanto vila rica/i)).not.toBeInTheDocument();
    });

    it("opens chat window when FAB is clicked", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByText(/assistente recanto vila rica/i)).toBeInTheDocument();
        expect(screen.getByText(/olá! sou o assistente/i)).toBeInTheDocument();
    });

    it("closes chat window when FAB is clicked again", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.click(screen.getByRole("button", { name: /fechar chat/i }));
        expect(screen.queryByText(/assistente recanto vila rica/i)).not.toBeInTheDocument();
    });

    it("closes with the header close button and with Escape, returning focus to the FAB", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByPlaceholderText(/digite sua dúvida/i)).toHaveFocus();
        await user.click(screen.getByRole("button", { name: /fechar assistente/i }));
        expect(screen.queryByText(/assistente recanto vila rica/i)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /abrir chat/i })).toHaveFocus();

        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.keyboard("{Escape}");
        expect(screen.queryByText(/assistente recanto vila rica/i)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /abrir chat/i })).toHaveFocus();
    });

    it("disables send button when input is empty", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByRole("button", { name: /enviar/i })).toBeDisabled();
    });

    it("enables send button when input has text", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Olá");
        expect(screen.getByRole("button", { name: /enviar/i })).not.toBeDisabled();
    });

    it("sends message and displays streamed response", async () => {
        vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock());
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Oi");
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText("Olá!")).toBeInTheDocument()
        );
        expect(screen.getByText("Oi")).toBeInTheDocument();
    });

    it("sends message on Enter key without Shift", async () => {
        vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock());
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Olá{Enter}");

        await waitFor(() =>
            expect(screen.getByText("Olá!")).toBeInTheDocument()
        );
    });

    it("does not send on Shift+Enter", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock());
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        const input = screen.getByPlaceholderText(/digite sua dúvida/i);
        await user.type(input, "Linha");
        await user.keyboard("{Shift>}{Enter}{/Shift}");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("shows error message when fetch fails", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Falha");
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText(/não consegui responder agora/i)).toBeInTheDocument()
        );
    });

    it("shows error message when server responds with !ok", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Erro servidor");
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText(/não consegui responder agora/i)).toBeInTheDocument()
        );
    });

    it("includes Authorization header when token is in localStorage", async () => {
        // AuthProvider inicializa do localStorage — setar antes de render garante que o token
        // esteja disponível via useAuth() quando o ChatWidget fizer a requisição.
        localStorage.setItem("recanto:userData", JSON.stringify({ token: "my-token", user: { role: "USER" } }));
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock());
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Com token");
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const [, options] = fetchMock.mock.calls[0];
        expect(options.headers.Authorization).toBe("Bearer my-token");
    });

    it("handles parsed SSE error chunk gracefully", async () => {
        const chunks = ['data: {"error":"algo deu errado"}\n', "data: [DONE]\n"];
        vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(chunks));
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Erro SSE");
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText(/não consegui responder agora/i)).toBeInTheDocument()
        );
    });
});
