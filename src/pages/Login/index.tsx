import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout, Button, GoogleButton, Input } from "../../components";

import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import * as S from "./styles";

/**
 * Página de login com e-mail/senha e autenticação via Google OAuth.
 *
 * @see POST /auth/login
 * @component
 * @param {object} props
 * @param {boolean} [props.introFinished=true] - Repassado para `AuthLayout` para controlar visibilidade do logo
 */
export default function Login({ introFinished = true }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            toast.success("E-mail verificado com sucesso! Faça login.");
        }
    }, [searchParams]);

    const [form, setForm] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.email || !form.password) {
            return toast.error("Informe e-mail e senha.");
        }

        try {
            setIsLoading(true);
            const { data } = await api.post("/auth/login", form);

            login(data.data);

            toast.success(data.message || "Login realizado com sucesso.");
            navigate("/home");
        } catch (error) {
            const e = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
            const message =
                e.response?.data?.message ||
                e.response?.data?.error?.message ||
                "Erro ao fazer login.";

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Entrar"
            subtitle="Acesse sua conta para continuar."
            introFinished={introFinished}
        >
            <S.Form onSubmit={handleSubmit}>
                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                />

                <Input
                    label="Senha"
                    name="password"
                    placeholder="Digite sua senha"
                    value={form.password}
                    onChange={handleChange}
                    showPasswordToggle
                />

                <S.ForgotLink to="/esqueci-senha">Esqueci minha senha</S.ForgotLink>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <S.Divider>
                    <span>ou continue com</span>
                </S.Divider>

                <GoogleButton navigate={navigate} />

                <S.FooterText>
                    Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                </S.FooterText>
            </S.Form>
        </AuthLayout>
    );
}
