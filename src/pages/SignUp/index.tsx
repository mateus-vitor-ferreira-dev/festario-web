import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout, Button, DatePickerInput, GoogleButton, Input, PhoneInput } from "../../components";

import api from "../../services/api";
import { validatePassword } from "../../utils/validatePassword";
import * as S from "./styles";

/**
 * Página de cadastro de novo usuário.
 *
 * Formata o telefone em tempo real com `formatPhone`. Após o cadastro bem-sucedido,
 * persiste os dados no `localStorage` e redireciona para `/home`.
 *
 * @see POST /users
 * @component
 * @param {object} props
 * @param {boolean} [props.introFinished=true] - Repassado para `AuthLayout` para controlar visibilidade do logo
 */
export default function SignUp({ introFinished = true }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        birthDate: "",
    });
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [dialCode, setDialCode] = useState("+55");
    const [isLoading, setIsLoading] = useState(false);

    function clearError(name: string) {
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        clearError(name);

        if (name === "password" && value) {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
        }
    }

    function validate() {
        const next: Record<string, string> = {};
        if (!form.firstName.trim()) next.firstName = "Informe seu nome.";
        if (!form.lastName.trim())  next.lastName  = "Informe seu sobrenome.";
        if (!form.email)            next.email      = "Informe seu e-mail.";
        if (!form.phone)            next.phone      = "Informe seu telefone.";
        if (!form.birthDate)        next.birthDate  = "Informe sua data de nascimento.";

        if (!form.password) {
            next.password = "Informe sua senha.";
        } else {
            const pwErr = validatePassword(form.password);
            if (pwErr) next.password = pwErr;
        }

        return next;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/users", {
                name: `${form.firstName.trim()} ${form.lastName.trim()}`,
                email: form.email,
                phone: dialCode.replace("+", "") + form.phone.replace(/\D/g, ""),
                password: form.password,
                birthDate: form.birthDate,
            });

            toast.success("Cadastro realizado com sucesso.");
            navigate("/login");
        } catch (error) {
            const e = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
            const message =
                e.response?.data?.message ||
                e.response?.data?.error?.message ||
                "Erro ao cadastrar usuário.";

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Criar conta"
            subtitle="Preencha os dados para acessar a plataforma."
            introFinished={introFinished}
        >
            <S.Form onSubmit={handleSubmit}>
                <S.NameRow>
                    <Input
                        label="Nome"
                        name="firstName"
                        placeholder="Seu nome"
                        value={form.firstName}
                        onChange={handleChange}
                        error={errors.firstName ?? undefined}
                    />
                    <Input
                        label="Sobrenome"
                        name="lastName"
                        placeholder="Seu sobrenome"
                        value={form.lastName}
                        onChange={handleChange}
                        error={errors.lastName ?? undefined}
                    />
                </S.NameRow>

                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email ?? undefined}
                />

                <PhoneInput
                    label="Telefone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onDialCodeChange={setDialCode}
                    error={errors.phone ?? undefined}
                />

                <Input
                    label="Senha"
                    name="password"
                    type="password"
                    placeholder="Mín. 8 caracteres, maiúscula, número e especial"
                    value={form.password}
                    onChange={handleChange}
                    showPasswordToggle
                    error={errors.password ?? undefined}
                />

                <DatePickerInput
                    label="Data de nascimento"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    maxDate={new Date().toISOString().split("T")[0]}
                    error={errors.birthDate ?? undefined}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>

                <S.Divider>
                    <span>ou continue com</span>
                </S.Divider>

                <GoogleButton navigate={navigate} />

                <S.FooterText>
                    Já tem conta? <Link to="/login">Entrar</Link>
                </S.FooterText>
            </S.Form>
        </AuthLayout>
    );
}
