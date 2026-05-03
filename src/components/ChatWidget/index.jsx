import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as S from "./styles";

const INITIAL_MESSAGE = {
    role: "assistant",
    content: "Olá! Sou o assistente do Recanto Vila Rica. Como posso te ajudar? 😊",
};

/**
 * Widget de chat flutuante com o assistente de IA do Recanto Vila Rica.
 *
 * Abre um painel de chat no canto da tela e se comunica com `POST /chat` via
 * Server-Sent Events (SSE), fazendo streaming de tokens em tempo real. Mantém
 * apenas as últimas 20 mensagens enviadas para evitar payload excessivo.
 * O token JWT do usuário é incluído no header `Authorization` quando disponível.
 *
 * @component
 */
export default function ChatWidget() {
    const { token } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    async function sendMessage() {
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");
        setLoading(true);
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const response = await fetch(`${baseUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ messages: updatedMessages.slice(-20) }),
            });

            if (!response.ok) {
                throw new Error("Erro na resposta do servidor");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder
                    .decode(value)
                    .split("\n")
                    .filter((l) => l.startsWith("data: "));

                for (const line of lines) {
                    const raw = line.replace("data: ", "");
                    if (raw === "[DONE]") break;

                    let parsed;
                    try {
                        parsed = JSON.parse(raw);
                    } catch {
                        // chunk incompleto (JSON inválido), ignorar
                        continue;
                    }

                    if (parsed.error) throw new Error(parsed.error);

                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: updated[updated.length - 1].content + parsed.text,
                        };
                        return updated;
                    });
                }
            }
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Desculpe, ocorreu um erro. Tente novamente em instantes.",
                };
                return updated;
            });
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            <S.Fab
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Fechar chat" : "Abrir chat"}
                aria-expanded={open}
                aria-controls="chat-widget-window"
            >
                {open ? "✕" : "💬"}
            </S.Fab>

            {open && (
                <S.Window
                    id="chat-widget-window"
                    role="dialog"
                    aria-modal="false"
                    aria-label="Chat — Assistente Recanto Vila Rica"
                >
                    <S.Header>Assistente Recanto Vila Rica</S.Header>

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
