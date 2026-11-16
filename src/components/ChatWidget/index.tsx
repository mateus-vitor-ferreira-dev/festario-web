import { useEffect, useRef, useState } from "react";
import { env } from "../../config/env";
import { tenantHeaders } from "../../config/tenantStorage";
import { useAuth } from "../../contexts/AuthContext";
import * as S from "./styles";

const INITIAL_MESSAGE = {
    role: "assistant",
    content: "Olá! Sou o assistente deste espaço: tiro dúvidas sobre datas, pacotes e reservas. Como posso te ajudar?",
};

function ChatIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

const GENERIC_ERROR = "Não consegui responder agora. Tente novamente em instantes.";

/** Mensagens claras para as recusas do servidor, pelo código do erro (ou pelo status). */
const ERROR_MESSAGES: Record<string, string> = {
    EMAIL_NOT_VERIFIED:
        "Para conversar com o assistente, confirme seu e-mail. Use o link que enviamos ou toque em “Reenviar e-mail” no aviso do topo da página.",
    CHAT_BUDGET_EXCEEDED:
        "Você chegou ao limite de mensagens do assistente por hoje. Volte amanhã ou fale com o salão pelos contatos da página.",
};

async function errorMessageFor(response: Response): Promise<string> {
    let code: string | undefined;
    try {
        const body = await response.json();
        code = body?.error?.code;
    } catch {
        // corpo sem JSON: fica a mensagem pelo status
    }
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    if (response.status === 401) return "Entre na sua conta para conversar com o assistente.";
    if (response.status === 429) return "Muitas mensagens em pouco tempo. Espere um minuto e tente de novo.";
    return GENERIC_ERROR;
}

class ChatError extends Error {}

/**
 * Widget de chat flutuante com o assistente de IA do espaço (tenant) em uso.
 * O título leva o nome do espaço quando o navegador já o conhece.
 *
 * Abre um painel de chat no canto da tela e se comunica com `POST /chat` via
 * Server-Sent Events (SSE), fazendo streaming de tokens em tempo real. O
 * histórico fica no servidor: o widget manda só a mensagem nova e o
 * `conversationId` que o servidor devolveu no primeiro evento do stream.
 * O token JWT do usuário é incluído no header `Authorization` quando disponível.
 *
 * @component
 */
export default function ChatWidget() {
    const { token, tenant, user } = useAuth();
    const assistantTitle = tenant?.name ? `Assistente · ${tenant.name}` : "Assistente de reservas";
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fabRef = useRef<HTMLButtonElement | null>(null);
    const conversationIdRef = useRef<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // Saiu da tela no meio de uma resposta: cancela o pedido, e o servidor para de gerá-la.
    useEffect(() => () => abortRef.current?.abort(), []);

    // A conversa guardada no servidor é do usuário e do salão: trocou um dos dois, começa outra, sem
    // deixar na tela as falas da conta (ou do salão) anterior nem uma resposta ainda chegando.
    // Pela conta (não pelo token, que muda a cada renovação da sessão) e pelo salão.
    const sessionKey = `${user?.id ?? ""}|${tenant?.slug ?? ""}`;
    const [shownSession, setShownSession] = useState(sessionKey);
    if (shownSession !== sessionKey) {
        setShownSession(sessionKey);
        setMessages([INITIAL_MESSAGE]);
        setLoading(false);
    }
    useEffect(() => {
        conversationIdRef.current = null;
        abortRef.current?.abort();
    }, [sessionKey]);

    // Esc fecha o painel e devolve o foco ao botão flutuante.
    useEffect(() => {
        if (!open) return;
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setOpen(false);
                fabRef.current?.focus();
            }
        }
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open]);

    function closeWindow() {
        setOpen(false);
        fabRef.current?.focus();
    }

    function appendToReply(text: string) {
        setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + text,
            };
            return updated;
        });
    }

    async function sendMessage() {
        const message = input.trim();
        if (!message || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: "" }]);
        setInput("");
        setLoading(true);
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(`${env.apiUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...tenantHeaders(),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    message,
                    ...(conversationIdRef.current && { conversationId: conversationIdRef.current }),
                }),
                signal: controller.signal,
            });

            if (!response.ok) throw new ChatError(await errorMessageFor(response));
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            // Um evento SSE pode chegar partido entre duas leituras: guarda o resto até a próxima.
            let buffer = "";
            let finished = false;

            while (!finished) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const raw = line.slice(6);
                    if (raw === "[DONE]") {
                        finished = true;
                        break;
                    }
                    let parsed: { text?: string; error?: string; conversationId?: string };
                    try {
                        parsed = JSON.parse(raw);
                    } catch {
                        continue;
                    }
                    if (parsed.error) throw new Error(parsed.error);
                    if (parsed.conversationId) conversationIdRef.current = parsed.conversationId;
                    if (parsed.text) appendToReply(parsed.text);
                }
            }
        } catch (err) {
            if (controller.signal.aborted) return;
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: err instanceof ChatError ? err.message : GENERIC_ERROR,
                };
                return updated;
            });
        } finally {
            if (abortRef.current === controller) abortRef.current = null;
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            <S.Fab
                ref={fabRef}
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Fechar chat" : "Abrir chat"}
                aria-expanded={open}
                aria-controls="chat-widget-window"
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </S.Fab>

            {open && (
                <S.Window
                    id="chat-widget-window"
                    role="dialog"
                    aria-modal="false"
                    aria-label={`Chat — ${assistantTitle}`}
                >
                    <S.Header>
                        <S.HeaderTitle>{assistantTitle}</S.HeaderTitle>
                        <S.CloseBtn type="button" onClick={closeWindow} aria-label="Fechar assistente">
                            <CloseIcon />
                        </S.CloseBtn>
                    </S.Header>

                    <S.Messages aria-live="polite" aria-atomic="false">
                        {messages.map((msg, i) => (
                            <S.Bubble key={i} $role={msg.role}>
                                {msg.content ||
                                    (loading && i === messages.length - 1 ? "..." : "")}
                            </S.Bubble>
                        ))}
                        <div ref={bottomRef} />
                    </S.Messages>

                    <S.InputRow>
                        <S.Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua dúvida..."
                            disabled={loading}
                            maxLength={2000}
                            aria-label="Mensagem para o assistente"
                        />
                        <S.SendBtn
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            aria-label="Enviar mensagem"
                        >
                            Enviar
                        </S.SendBtn>
                    </S.InputRow>
                </S.Window>
            )}
        </>
    );
}
