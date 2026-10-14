import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGSAP } from "@gsap/react";

import { DatePickerInput, Input } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { resendVerification, verifyCurrentPassword } from "../../services/auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isAbortError, getHttpStatus } from "../../utils/errors";
import { formatPhone } from "../../utils/formatPhone";
import { validatePassword } from "../../utils/validatePassword";
import { animateFadeInUp } from "../../utils/animations";
import type { User } from "../../types";
import * as S from "./styles";

interface ProfileUser extends User {
    emailVerifiedAt?: string | null;
}

function getInitials(name: string | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase();
}

/**
 * Página de perfil do usuário autenticado.
 *
 * Permite editar nome, e-mail, telefone e data de nascimento.
 * Também oferece seção de alteração de senha (campos separados com confirmação).
 *
 * @see GET /users/me
 * @see PATCH /users/me
 * @component
 */
export default function Profile() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [user, setUser] = useState<ProfileUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
    const [passwordStep, setPasswordStep] = useState("verify");
    const [isSendingVerification, setIsSendingVerification] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    function handlePasswordReset() {
        setPasswordStep("verify");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function loadUser() {
            try {
                setIsLoading(true);
                const { data } = await api.get("/users/me", { signal });

                if (signal.aborted) return;

                const u = data.data;
                setUser(u);
                setForm({
                    name: u.name || "",
                    email: u.email || "",
                    phone: formatPhone(u.phone || ""),
                    birthDate: u.birthDate ? u.birthDate.split("T")[0] : "",
                });
            } catch (error) {
                if (isAbortError(error)) return;
                const status = getHttpStatus(error);
                if (status === 401 || status === 403) return navigate("/home");
                if (status === 429) {
                    toast.error("Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.");
                    return;
                }
                toast.error(getErrorMessage(error, "Erro ao carregar os dados do perfil."));
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }

        loadUser();

        return () => controller.abort();
    }, [navigate]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.name === "phone"
            ? formatPhone(e.target.value)
            : e.target.value;
        setForm((prev) => ({ ...prev, [e.target.name]: value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.name.trim()) {
            return toast.error("O nome é obrigatório.");
        }

        if (!form.email.trim()) {
            return toast.error("O e-mail é obrigatório.");
        }

        if (!user) return;

        try {
            setIsSaving(true);

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, "") || undefined,
                birthDate: form.birthDate || undefined,
            };

            const { data } = await api.patch(`/users/${user.id}`, payload);

            const updated = data.data;

            updateUser({ name: updated.name, email: updated.email });

            setUser(updated);
            toast.success("Perfil atualizado com sucesso.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao atualizar o perfil."));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleVerifyPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!passwordForm.currentPassword) {
            return toast.error("Informe a senha atual.");
        }

        try {
            setIsVerifyingPassword(true);
            await verifyCurrentPassword(passwordForm.currentPassword);
            setPasswordStep("change");
        } catch (error) {
            toast.error(getErrorMessage(error, "Senha atual incorreta."));
        } finally {
            setIsVerifyingPassword(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const passwordError = validatePassword(passwordForm.newPassword);
        if (passwordError) {
            return toast.error(passwordError);
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("As senhas não coincidem.");
        }

        if (!user) return;

        try {
            setIsChangingPassword(true);
            await api.patch(`/users/${user.id}`, {
                currentPassword: passwordForm.currentPassword,
                password: passwordForm.newPassword,
            });
            toast.success("Senha alterada com sucesso.");
            handlePasswordReset();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao alterar a senha."));
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleResendVerification() {
        try {
            setIsSendingVerification(true);
            await resendVerification();
            toast.success("E-mail de verificação enviado. Verifique sua caixa de entrada.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao reenviar o e-mail de verificação."));
        } finally {
            setIsSendingVerification(false);
        }
    }

    useGSAP(() => {
        if (isLoading || !containerRef.current) return;
        const el = containerRef.current;
        animateFadeInUp(el.querySelector(".anim-header"));
    }, { scope: containerRef, dependencies: [isLoading] });

    if (isLoading) {
        return (
            <S.Container>
                <S.LoadingState>
                    <S.Spinner />
                    <p>Carregando perfil...</p>
                </S.LoadingState>
            </S.Container>
        );
    }

    return (
        <S.Container ref={containerRef}>
            <S.PageHeader className="anim-header">
                <S.HeaderLeft>
                    <S.PageTitle>Meu perfil</S.PageTitle>
                    <S.PageSubtitle>Gerencie suas informações pessoais e de acesso.</S.PageSubtitle>
                </S.HeaderLeft>
            </S.PageHeader>

            {!user?.emailVerifiedAt && (
                <S.VerificationBanner>
                    <S.VerificationText>
                        <strong>E-mail não verificado.</strong> Verifique sua caixa de entrada ou solicite um novo link.
                    </S.VerificationText>
                    <S.ResendButton
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isSendingVerification}
                    >
                        {isSendingVerification ? "Enviando..." : "Reenviar e-mail"}
                    </S.ResendButton>
                </S.VerificationBanner>
            )}

            <S.Layout>
                <S.IdentityCard>
                    <S.AvatarLarge>{getInitials(user?.name)}</S.AvatarLarge>
                    <S.IdentityName>{user?.name}</S.IdentityName>
                    <S.IdentityEmail>{user?.email}</S.IdentityEmail>
                    <S.RoleBadge>{user?.role === "ADMIN" ? "Administrador" : "Usuário"}</S.RoleBadge>
                </S.IdentityCard>

                <S.FormStack>
                    <S.FormCard onSubmit={handleSubmit}>
                        <S.SectionTitle>Informações pessoais</S.SectionTitle>

                        <S.FieldGrid>
                            <Input
                                label="Nome completo"
                                name="name"
                                placeholder="Seu nome"
                                value={form.name}
                                onChange={handleChange}
                            />

                            <Input
                                label="E-mail"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={handleChange}
                            />

                            <Input
                                label="Telefone"
                                name="phone"
                                placeholder="(11) 99999-9999"
                                inputMode="tel"
                                value={form.phone}
                                onChange={handleChange}
                                prefix="🇧🇷"
                            />

                            <DatePickerInput
                                label="Data de nascimento"
                                name="birthDate"
                                value={form.birthDate}
                                onChange={handleChange}
                                maxDate={new Date().toISOString().split("T")[0]}
                            />
                        </S.FieldGrid>

                        <S.FormFooter>
                            <S.CancelButton type="button" onClick={() => navigate("/home")}>
                                Cancelar
                            </S.CancelButton>
                            <S.SaveButton type="submit" disabled={isSaving}>
                                {isSaving ? "Salvando..." : "Salvar alterações"}
                            </S.SaveButton>
                        </S.FormFooter>
                    </S.FormCard>

                    {passwordStep === "verify" ? (
                        <S.FormCard as="form" onSubmit={handleVerifyPassword}>
                            <S.SectionTitle>Alterar senha</S.SectionTitle>

                            <S.FieldGrid>
                                <Input
                                    label="Senha atual"
                                    name="currentPassword"
                                    placeholder="Digite sua senha atual"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                                    showPasswordToggle
                                />
                            </S.FieldGrid>

                            <S.FormFooter>
                                <S.SaveButton type="submit" disabled={isVerifyingPassword}>
                                    {isVerifyingPassword ? "Verificando..." : "Continuar"}
                                </S.SaveButton>
                            </S.FormFooter>
                        </S.FormCard>
                    ) : (
                        <S.FormCard as="form" onSubmit={handlePasswordSubmit}>
                            <S.SectionTitle>Nova senha</S.SectionTitle>

                            <S.FieldGrid>
                                <Input
                                    label="Nova senha"
                                    name="newPassword"
                                    placeholder="Mín. 8 caracteres"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                                    showPasswordToggle
                                />

                                <Input
                                    label="Confirmar nova senha"
                                    name="confirmPassword"
                                    placeholder="Repita a nova senha"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    showPasswordToggle
                                />
                            </S.FieldGrid>

                            <S.FormFooter>
                                <S.CancelButton type="button" onClick={handlePasswordReset}>
                                    Voltar
                                </S.CancelButton>
                                <S.SaveButton type="submit" disabled={isChangingPassword}>
                                    {isChangingPassword ? "Alterando..." : "Alterar senha"}
                                </S.SaveButton>
                            </S.FormFooter>
                        </S.FormCard>
                    )}
                </S.FormStack>
            </S.Layout>
        </S.Container>
    );
}
