import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
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
        expect(screen.queryByText(/assistente de reservas/i)).not.toBeInTheDocument();
    });

    it("opens chat window when FAB is clicked", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByText(/assistente de reservas/i)).toBeInTheDocument();
        expect(screen.getByText(/olá! sou o assistente/i)).toBeInTheDocument();
    });

    it("shows the space (tenant) name in the title when the browser knows it", async () => {
        localStorage.setItem("festario:tenant", JSON.stringify({ slug: "salao-jardim-das-flores", name: "Salão Jardim das Flores" }));
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByRole("dialog", { name: "Chat — Assistente · Salão Jardim das Flores" })).toBeInTheDocument();
    });

    it("closes chat window when FAB is clicked again", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.click(screen.getByRole("button", { name: /fechar chat/i }));
        expect(screen.queryByText(/assistente de reservas/i)).not.toBeInTheDocument();
    });

    it("closes with the header close button and with Escape, returning focus to the FAB", async () => {
        const user = userEvent.setup();
        renderWidget();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        expect(screen.getByPlaceholderText(/digite sua dúvida/i)).toHaveFocus();
        await user.click(screen.getByRole("button", { name: /fechar assistente/i }));
        expect(screen.queryByText(/assistente de reservas/i)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /abrir chat/i })).toHaveFocus();

        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.keyboard("{Escape}");
        expect(screen.queryByText(/assistente de reservas/i)).not.toBeInTheDocument();
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
        localStorage.setItem("festario:userData", JSON.stringify({ token: "my-token", user: { role: "USER" } }));
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

    async function openAndSend(text: string) {
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /abrir chat/i }));
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), text);
        await user.click(screen.getByRole("button", { name: /enviar/i }));
        return user;
    }

    it("manda só a mensagem nova e continua a conversa com o id que o servidor devolveu", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch")
            .mockImplementationOnce(makeFetchMock(['data: {"conversationId":"c-123"}\n\ndata: {"text":"Oi!"}\n', "data: [DONE]\n"]))
            .mockImplementationOnce(makeFetchMock(['data: {"conversationId":"c-123"}\n', 'data: {"text":"Sábado tem."}\n', "data: [DONE]\n"]));
        renderWidget();
        const user = await openAndSend("Olá");
        await waitFor(() => expect(screen.getByText("Oi!")).toBeInTheDocument());
        expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({ message: "Olá" });

        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Tem sábado?");
        await user.click(screen.getByRole("button", { name: /enviar/i }));
        await waitFor(() => expect(screen.getByText("Sábado tem.")).toBeInTheDocument());
        expect(JSON.parse(fetchMock.mock.calls[1][1]!.body as string)).toEqual({ message: "Tem sábado?", conversationId: "c-123" });
    });

    it("junta um evento que chegou partido em duas leituras", async () => {
        vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(['data: {"te', 'xt":"Inteiro"}\n', "data: [DONE]\n"]));
        renderWidget();
        await openAndSend("Oi");
        await waitFor(() => expect(screen.getByText("Inteiro")).toBeInTheDocument());
    });

    it.each([
        [403, { error: { code: "EMAIL_NOT_VERIFIED" } }, /confirme seu e-mail/i],
        [429, { error: { code: "CHAT_BUDGET_EXCEEDED" } }, /limite de mensagens do assistente por hoje/i],
        [429, { error: { code: "RATE_LIMIT" } }, /muitas mensagens em pouco tempo/i],
        [401, {}, /entre na sua conta/i],
        [500, { error: { code: "INTERNAL_ERROR" } }, /não consegui responder agora/i],
    ])("resposta %i: mostra a mensagem certa em português", async (status, body, text) => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status }));
        renderWidget();
        await openAndSend("Oi");
        await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());
    });

    it("erro sem corpo JSON cai na mensagem genérica", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Bad Gateway", { status: 502 }));
        renderWidget();
        await openAndSend("Oi");
        await waitFor(() => expect(screen.getByText(/não consegui responder agora/i)).toBeInTheDocument());
    });

    it("ao sair da tela no meio da resposta, cancela o pedido", async () => {
        let signal: AbortSignal | undefined;
        vi.spyOn(globalThis, "fetch").mockImplementation((_url, options) => {
            signal = (options as RequestInit).signal!;
            return new Promise(() => undefined);
        });
        const { unmount } = renderWidget();
        await openAndSend("Oi");
        await waitFor(() => expect(signal).toBeDefined());
        expect(signal!.aborted).toBe(false);
        unmount();
        expect(signal!.aborted).toBe(true);
    });

    it("trocou de salão: limpa a conversa da tela, cancela a resposta e começa outra conversa", async () => {
        function SwitchTenant() {
            const { setTenant } = useAuth();
            return <button onClick={() => setTenant({ slug: "outro-salao", name: "Outro Salão" })}>trocar salão</button>;
        }
        let signal: AbortSignal | undefined;
        const fetchMock = vi.spyOn(globalThis, "fetch")
            .mockImplementationOnce(makeFetchMock(['data: {"conversationId":"c-1"}\n', 'data: {"text":"Resposta do primeiro"}\n', "data: [DONE]\n"]))
            .mockImplementationOnce((_url, options) => {
                signal = (options as RequestInit).signal!;
                return new Promise(() => undefined);
            })
            .mockImplementationOnce(makeFetchMock(['data: {"text":"Novo"}\n', "data: [DONE]\n"]));
        render(
            <AuthProvider>
                <SwitchTenant />
                <ChatWidget />
            </AuthProvider>
        );
        const user = await openAndSend("Primeira");
        await waitFor(() => expect(screen.getByText("Resposta do primeiro")).toBeInTheDocument());
        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Pendurada");
        await user.click(screen.getByRole("button", { name: /enviar/i }));
        await waitFor(() => expect(signal).toBeDefined());

        await user.click(screen.getByRole("button", { name: "trocar salão" }));
        expect(signal!.aborted).toBe(true);
        expect(screen.queryByText("Resposta do primeiro")).not.toBeInTheDocument();
        expect(screen.queryByText("Pendurada")).not.toBeInTheDocument();

        await user.type(screen.getByPlaceholderText(/digite sua dúvida/i), "Oi de novo");
        await user.click(screen.getByRole("button", { name: /enviar/i }));
        await waitFor(() => expect(screen.getByText("Novo")).toBeInTheDocument());
        expect(JSON.parse(fetchMock.mock.calls[2][1]!.body as string)).toEqual({ message: "Oi de novo" });
    });
});
