import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout, Button, GoogleButton, Input } from "../../components";

import { useAuth } from "../../contexts/AuthContext";
import { isValidTenantSlug, tenantHeaderFor } from "../../config/tenantStorage";
import { getPublicTenant } from "../../services/venue";
import { getApiErrorCode, isAbortError } from "../../utils/errors";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { homePathFor, isManagerRole } from "../../utils/roles";
import { RETURN_PARAM, safeReturnPath, withReturn } from "../../utils/returnPath";
import api from "../../services/api";
import { env } from "../../config/env";
import * as S from "./styles";

/**
 * Página de login com e-mail/senha e autenticação via Google OAuth.
 *
 * Espaço: `/login?espaco=<slug>` guarda o espaço e passa a enviar `X-Tenant-Slug`
 * (é assim que o dono de um espaço que não é o padrão entra). Antes de guardar, o slug é
 * conferido na API e o aviso mostra o nome real do salão; slug que não existe não é guardado.
 * Com a sessão já aberta o parâmetro é ignorado: um link não pode trocar em silêncio o salão
 * de quem já entrou (nem o do dono ou da equipe). Sem o parâmetro, vale o espaço já guardado
 * no navegador ou o padrão. Depois de entrar, cada papel vai para a sua área (`homePathFor`).
 *
 * @see POST /auth/login
 * @component
 * @param {object} props
 * @param {boolean} [props.introFinished=true] - Repassado para `AuthLayout` para controlar visibilidade do logo
 */
export default function Login({ introFinished = true }) {
    const navigate = useNavigate();
    const { login, tenant, setTenant, isAuthenticated, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const espacoParam = searchParams.get("espaco")?.trim().toLowerCase() ?? "";

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            toast.success("E-mail verificado com sucesso! Faça login.");
        }
    }, [searchParams]);

    // Quem já entrou (cliente, dono ou equipe) continua no salão em que está.
    const ignoreEspaco = isAuthenticated || isManagerRole(user?.role);

    useEffect(() => {
        if (!espacoParam || ignoreEspaco) return;
        if (!isValidTenantSlug(espacoParam)) {
            toast.error("O endereço do espaço no link é inválido. Confira o link ou entre no espaço padrão.", { toastId: "invalid-espaco" });
            return;
        }
        const controller = new AbortController();
        getPublicTenant(controller.signal, tenantHeaderFor(espacoParam))
            .then((found) => {
                // a API responde pelo salão do cabeçalho; outro slug na resposta é tratado como "não existe"
                if (found?.slug !== espacoParam) throw new Error("tenant mismatch");
                setTenant({ slug: found.slug, name: found.name });
            })
            .catch((error) => {
                if (isAbortError(error) || controller.signal.aborted) return;
                // salão desativado: o interceptor do axios já avisou
                if (getApiErrorCode(error) === "TENANT_INACTIVE") return;
                toast.error("Não encontramos o espaço deste link. Confira o link ou entre no espaço padrão.", { toastId: "unknown-espaco" });
            });
        return () => controller.abort();
    // só quando o parâmetro muda (setTenant/tenant mudam a cada render do provider;
    // reagir a eles reativaria o espaço logo depois de "Entrar no espaço padrão")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [espacoParam, ignoreEspaco]);

    function switchToDefaultTenant() {
        setTenant(null);
        if (espacoParam) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("espaco");
                return next;
            }, { replace: true });
        }
    }

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
            navigate(safeReturnPath(searchParams.get(RETURN_PARAM)) ?? homePathFor(data.data?.user?.role ?? data.data?.role));
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao fazer login."));
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
                {tenant && (
                    <S.TenantNotice role="status">
                        <span>
                            Entrando no espaço <strong>{tenant.name || tenant.slug}</strong>
                        </span>
                        <button type="button" onClick={switchToDefaultTenant}>
                            Entrar no espaço padrão
                        </button>
                    </S.TenantNotice>
                )}

                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={254}
                    autoComplete="email"
                />

                <Input
                    label="Senha"
                    name="password"
                    placeholder="Digite sua senha"
                    value={form.password}
                    onChange={handleChange}
                    maxLength={128}
                    autoComplete="current-password"
                    showPasswordToggle
                />

                <S.ForgotLink to="/esqueci-senha">Esqueci minha senha</S.ForgotLink>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                {env.googleLoginEnabled && (
                    <>
                        <S.Divider>
                            <span>ou continue com</span>
                        </S.Divider>

                        <GoogleButton navigate={navigate} />
                    </>
                )}

                <S.FooterText>
                    Ainda não tem conta? <Link to={withReturn("/cadastro", searchParams.get(RETURN_PARAM))}>Criar conta</Link>
                </S.FooterText>
            </S.Form>
        </AuthLayout>
    );
}
