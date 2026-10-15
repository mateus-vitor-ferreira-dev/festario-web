import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

/**
 * @module pages/ContactUs
 * @description Página de contato com formulário e informações de acesso direto.
 *
 * Mostra os canais do salão carregados de `GET /contact`: só os que o dono
 * cadastrou. O formulário (nome, e-mail, telefone, assunto, mensagem) envia a
 * mensagem ao e-mail do salão via `POST /contact/message`, com `replyTo` do remetente.
 *
 * @see GET /contact
 * @see POST /contact/message
 */
import { getSalonContact, submitContact } from "../../services/contact";
import type { SalonContact } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
        </svg>
    );
}

function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
    );
}

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactUs() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSending, setIsSending] = useState(false);
    const [contact, setContact] = useState<SalonContact | null>(null);
    const [contactError, setContactError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        getSalonContact(controller.signal)
            .then(setContact)
            .catch((error) => { if (!isAbortError(error)) setContactError(true); });
        return () => controller.abort();
    }, []);

    const hasChannels = !!contact && Boolean(contact.whatsapp || contact.phone || contact.email || contact.instagram || contact.address);

    useGSAP(() => {
        if (!containerRef.current) return;
        animateFadeInUp(containerRef.current.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [] });

    function field(key: keyof typeof form) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
        };
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSending(true);
            await submitContact(form);
            toast.success("Mensagem enviada. O salão responde no seu e-mail.");
            setForm(EMPTY_FORM);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao enviar mensagem. Tente novamente."));
        } finally {
            setIsSending(false);
        }
    }

    return (
        <S.Container ref={containerRef}>
            <S.Header className="anim-header">
                <S.Title>{contact ? `Fale com ${contact.name}` : "Contato"}</S.Title>
                <S.Description>
                    Fale direto com o salão pelos canais abaixo, mande uma mensagem pelo formulário ou abra uma negociação na plataforma.
                </S.Description>
            </S.Header>

            <S.Card aria-busy={!contact && !contactError}>
                <S.CardTitle>Canais do salão</S.CardTitle>

                {/* Carregando, sem canais ou erro: anunciado ao leitor de tela sem roubar o foco. */}
                <div role="status">
                    {!contact && !contactError && <S.Description>Carregando os contatos do salão...</S.Description>}
                    {contactError && <S.Description>Não foi possível carregar os contatos agora. O formulário abaixo continua funcionando.</S.Description>}
                    {contact && !hasChannels && (
                        <S.Description>Este salão ainda não cadastrou WhatsApp, telefone ou e-mail. Use o formulário abaixo ou abra uma negociação.</S.Description>
                    )}
                </div>

                {contact?.whatsapp && (
                    <S.ContactItem as="a" href={`https://wa.me/${contact.whatsapp.number}`} target="_blank" rel="noopener noreferrer">
                        <S.ContactIcon><WhatsAppIcon /></S.ContactIcon>
                        <S.ContactInfo>
                            <S.ContactLabel>WhatsApp</S.ContactLabel>
                            <S.ContactValue>{contact.whatsapp.display}</S.ContactValue>
                        </S.ContactInfo>
                    </S.ContactItem>
                )}

                {contact?.phone && (
                    <S.ContactItem as="a" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                        <S.ContactIcon><PhoneIcon /></S.ContactIcon>
                        <S.ContactInfo>
                            <S.ContactLabel>Telefone</S.ContactLabel>
                            <S.ContactValue>{contact.phone}</S.ContactValue>
                        </S.ContactInfo>
                    </S.ContactItem>
                )}

                {contact?.email && (
                    <S.ContactItem as="a" href={`mailto:${contact.email}`}>
                        <S.ContactIcon><EmailIcon /></S.ContactIcon>
                        <S.ContactInfo>
                            <S.ContactLabel>E-mail</S.ContactLabel>
                            <S.ContactValue>{contact.email}</S.ContactValue>
                        </S.ContactInfo>
                    </S.ContactItem>
                )}

                {contact?.instagram && (
                    <S.ContactItem as="a" href={contact.instagram.url} target="_blank" rel="noopener noreferrer">
                        <S.ContactIcon><InstagramIcon /></S.ContactIcon>
                        <S.ContactInfo>
                            <S.ContactLabel>Instagram</S.ContactLabel>
                            <S.ContactValue>{contact.instagram.display}</S.ContactValue>
                        </S.ContactInfo>
                    </S.ContactItem>
                )}

                {contact?.address && (
                    <S.ContactItem as="a" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer">
                        <S.ContactIcon><PinIcon /></S.ContactIcon>
                        <S.ContactInfo>
                            <S.ContactLabel>Endereço</S.ContactLabel>
                            <S.ContactValue>{contact.address}</S.ContactValue>
                        </S.ContactInfo>
                    </S.ContactItem>
                )}

                <S.ContactItem as="button" onClick={() => navigate("/negociacoes")}>
                    <S.ContactIcon>
                        <ChatIcon />
                    </S.ContactIcon>
                    <S.ContactInfo>
                        <S.ContactLabel>Negociação pela plataforma</S.ContactLabel>
                        <S.ContactValue>Negocie condições especiais no chat</S.ContactValue>
                    </S.ContactInfo>
                </S.ContactItem>
            </S.Card>

            <S.Card as="form" onSubmit={handleSubmit}>
                <S.CardTitle>Enviar mensagem</S.CardTitle>

                <S.FormField>
                    <S.FormLabel>Nome</S.FormLabel>
                    <S.FormInput required placeholder="Seu nome completo" {...field("name")} />
                </S.FormField>

                <S.FormField>
                    <S.FormLabel>E-mail</S.FormLabel>
                    <S.FormInput required type="email" placeholder="seu@email.com" {...field("email")} />
                </S.FormField>

                <S.FormField>
                    <S.FormLabel>Telefone (opcional)</S.FormLabel>
                    <S.FormInput type="tel" placeholder="(00) 00000-0000" {...field("phone")} />
                </S.FormField>

                <S.FormField>
                    <S.FormLabel>Assunto</S.FormLabel>
                    <S.FormInput required placeholder="Ex: Dúvida sobre reserva" {...field("subject")} />
                </S.FormField>

                <S.FormField>
                    <S.FormLabel>Mensagem</S.FormLabel>
                    <S.FormTextarea required rows={5} placeholder="Escreva sua mensagem aqui..." {...field("message")} />
                </S.FormField>

                <S.SubmitButton type="submit" disabled={isSending}>
                    {isSending ? "Enviando..." : "Enviar mensagem"}
                </S.SubmitButton>
            </S.Card>
        </S.Container>
    );
}
