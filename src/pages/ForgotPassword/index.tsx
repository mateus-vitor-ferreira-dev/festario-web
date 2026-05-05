/**
 * Página de solicitação de recuperação de senha.
 *
 * O usuário informa o e-mail cadastrado e recebe um link de redefinição válido
 * por 1 hora. A resposta é sempre a mesma independente de o e-mail existir ou não
 * (evita enumeração de contas).
 *
 * @see POST /auth/forgot-password
 * @component
 * @param {object} props
 * @param {boolean} [props.introFinished=true] - Repassado para `AuthLayout`
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout, Button, Input } from "../../components";
import { forgotPassword } from "../../services/auth";
import * as S from "./styles";

export default function ForgotPassword({ introFinished = true }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!email) {
            return toast.error("Informe seu e-mail.");
        }

        try {
            setLoading(true);
            await forgotPassword(email);
            setSent(true);
        } catch {
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Esqueci minha senha"
            subtitle="Informe seu e-mail para receber o link de redefinição."
            introFinished={introFinished}
        >
            {sent ? (
                <S.Form>
                    <S.SuccessBox>
                        Se existe uma conta com o e-mail <strong>{email}</strong>, você
                        receberá um link de redefinição em breve. Verifique sua caixa de
                        entrada (e spam).
                    </S.SuccessBox>
                    <S.FooterText>
                        <Link to="/login">Voltar para o login</Link>
                    </S.FooterText>
                </S.Form>
            ) : (
                <S.Form onSubmit={handleSubmit}>
                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        placeholder="Digite seu e-mail cadastrado"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar link de redefinição"}
                    </Button>

                    <S.FooterText>
                        <Link to="/login">Voltar para o login</Link>
                    </S.FooterText>
                </S.Form>
            )}
        </AuthLayout>
    );
}
