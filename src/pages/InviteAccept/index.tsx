import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout, Button, Input } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { acceptInvite, getInvite } from "../../services/platform";
import { getApiErrorCode, getHttpStatus, isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import { PASSWORD_RULES, validatePassword } from "../../utils/validatePassword";
import { PANEL_PATH } from "../../utils/roles";
import type { InviteInfo, InviteStatus } from "../../types";
import * as S from "./styles";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

type ViewState = "loading" | "error" | "not-found" | InviteStatus;

const CODE_TO_STATE: Record<string, ViewState> = {
    INVITE_EXPIRED: "expired",
    INVITE_REVOKED: "revoked",
    INVITE_ALREADY_ACCEPTED: "accepted",
    INVITE_NOT_FOUND: "not-found",
};

const TITLES: Record<ViewState, { title: string; subtitle: string }> = {
    loading: { title: "Convite", subtitle: "Abrindo o seu convite..." },
    error: { title: "Convite", subtitle: "Não foi possível abrir o convite agora." },
    "not-found": { title: "Convite não encontrado", subtitle: "Este link não corresponde a nenhum convite." },
    valid: { title: "Criar conta de dono", subtitle: "Defina seu nome e uma senha para acessar o painel do espaço." },
    expired: { title: "Convite vencido", subtitle: "O prazo para aceitar este convite acabou." },
    accepted: { title: "Convite já aceito", subtitle: "A conta deste convite já foi criada." },
    revoked: { title: "Convite cancelado", subtitle: "Este convite foi cancelado pela equipe da plataforma." },
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function CheckIcon({ ok }: { ok: boolean }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="8" />}
        </svg>
    );
}

/**
 * Aceite do convite do dono (`/convite/:token`, pública).
 *
 * Mostra a situação do convite (válido, vencido, aceito, revogado ou inexistente) e,
 * quando válido, cria a conta OWNER com nome e senha. A resposta traz a sessão e o
 * espaço: o slug passa a ir no `X-Tenant-Slug` e a pessoa cai no painel do espaço.
 *
 * @see GET /owner-invites/:token
 * @see POST /owner-invites/:token/accept
 * @component
 */
export default function InviteAccept() {
    const { token = "" } = useParams();
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const tokenIsValid = TOKEN_PATTERN.test(token);

    const [view, setView] = useState<ViewState>(tokenIsValid ? "loading" : "not-found");
    const [invite, setInvite] = useState<InviteInfo | null>(null);
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [form, setForm] = useState({ name: "", password: "" });
    const [errors, setErrors] = useState<{ name?: string; password?: string }>({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!tokenIsValid) return;
        const controller = new AbortController();
        (async () => {
            try {
                setView("loading");
                const info = await getInvite(token, controller.signal);
                if (controller.signal.aborted) return;
                setInvite(info);
                setView(info.status);
            } catch (error) {
                if (isAbortError(error)) return;
                const status = getHttpStatus(error);
                if (status === 404 || status === 400) {
                    setView("not-found");
                } else {
                    setLoadError(getLoadErrorMessage(error, "Erro ao abrir o convite."));
                    setView("error");
                }
            }
        })();
        return () => controller.abort();
    }, [token, tokenIsValid, reloadKey]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSubmitError("");
        if (name === "password") {
            setErrors((prev) => ({ ...prev, password: value ? validatePassword(value) ?? undefined : undefined }));
        } else if (errors.name) {
            setErrors((prev) => ({ ...prev, name: undefined }));
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const next: { name?: string; password?: string } = {};
        const name = form.name.trim();
        if (name.length < 3) next.name = "Informe seu nome completo (pelo menos 3 caracteres).";
        if (!form.password) next.password = "Crie uma senha.";
        else {
            const pwError = validatePassword(form.password);
            if (pwError) next.password = pwError;
        }
        if (next.name || next.password) {
            setErrors(next);
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await acceptInvite(token, { name, password: form.password });
            login(result, { slug: result.tenant.slug, name: result.tenant.name });
            toast.success(`Conta criada. Boas-vindas ao painel de ${result.tenant.name}!`);
            navigate(PANEL_PATH, { replace: true });
        } catch (error) {
            const code = getApiErrorCode(error);
            const nextView = code ? CODE_TO_STATE[code] : undefined;
            if (nextView) {
                setView(nextView);
            } else if (code === "EMAIL_ALREADY_IN_USE") {
                setSubmitError("Este e-mail já tem uma conta. Entre com ela ou peça à equipe da plataforma um convite para outro e-mail.");
            } else {
                setSubmitError(getErrorMessage(error, "Não foi possível criar a conta. Tente novamente."));
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const { title, subtitle } = TITLES[view];

    return (
        <AuthLayout title={title} subtitle={subtitle}>
            {view === "loading" && <S.Spinner role="status" aria-label="Carregando convite" />}

            {view === "error" && (
                <S.StateBox>
                    <S.Notice $tone="error" role="alert">{loadError}</S.Notice>
                    <Button type="button" onClick={() => setReloadKey((k) => k + 1)}>Tentar de novo</Button>
                </S.StateBox>
            )}

            {view === "not-found" && (
                <S.StateBox>
                    <p>
                        Confira se o link foi copiado inteiro, sem espaços no fim. Se o problema continuar, peça um novo convite
                        à equipe da plataforma.
                    </p>
                    <S.LinkButton as={Link} to="/login">Ir para o login</S.LinkButton>
                </S.StateBox>
            )}

            {view === "expired" && (
                <S.StateBox>
                    <p>
                        {invite ? <>O convite de <strong>{invite.tenantName}</strong> para <strong>{invite.email}</strong> venceu em {formatDateTime(invite.expiresAt)}.</> : "Este convite venceu."}{" "}
                        Peça à equipe da plataforma que envie um novo convite para o mesmo e-mail.
                    </p>
                    <S.LinkButton as={Link} to="/login">Ir para o login</S.LinkButton>
                </S.StateBox>
            )}

            {view === "revoked" && (
                <S.StateBox>
                    <p>
                        {invite ? <>O convite de <strong>{invite.tenantName}</strong> para <strong>{invite.email}</strong> não vale mais.</> : "Este convite não vale mais."}{" "}
                        Se ainda precisa de acesso, peça um novo convite à equipe da plataforma.
                    </p>
                    <S.LinkButton as={Link} to="/login">Ir para o login</S.LinkButton>
                </S.StateBox>
            )}

            {view === "accepted" && (
                <S.StateBox>
                    <p>
                        {invite ? <>A conta de <strong>{invite.email}</strong> em <strong>{invite.tenantName}</strong> já existe.</> : "A conta deste convite já existe."}{" "}
                        Entre pelo link de acesso do seu espaço com o e-mail e a senha que você criou. Se esqueceu a senha, use “Esqueci minha senha” no login.
                    </p>
                    <S.LinkButton as={Link} to="/login">Entrar</S.LinkButton>
                </S.StateBox>
            )}

            {view === "valid" && invite && (
                <S.Form onSubmit={handleSubmit} noValidate>
                    <S.InviteSummary>
                        <div><dt>Espaço</dt><dd>{invite.tenantName}</dd></div>
                        <div><dt>E-mail da conta</dt><dd>{invite.email}</dd></div>
                        <div><dt>Vale até</dt><dd>{formatDateTime(invite.expiresAt)}</dd></div>
                    </S.InviteSummary>

                    {isAuthenticated && user && (
                        <S.Notice $tone="warning">
                            Você está conectado como <strong>{user.email}</strong>. Ao criar a conta de dono, essa sessão é encerrada neste navegador.
                        </S.Notice>
                    )}

                    <Input
                        label="Nome completo"
                        name="name"
                        placeholder="Como você quer ser chamado no painel"
                        value={form.name}
                        onChange={handleChange}
                        error={errors.name}
                        maxLength={120}
                        autoComplete="name"
                    />

                    <Input
                        label="Senha"
                        name="password"
                        type="password"
                        placeholder="Mín. 8 caracteres, maiúscula, número e especial"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        maxLength={128}
                        autoComplete="new-password"
                        showPasswordToggle
                    />

                    <S.Rules aria-label="Requisitos da senha">
                        {PASSWORD_RULES.map((rule) => {
                            const ok = rule.test(form.password);
                            return (
                                <S.Rule key={rule.label} $ok={ok}>
                                    <CheckIcon ok={ok} />
                                    <span>{rule.label}<S.VisuallyHidden>{ok ? " — atendido" : " — pendente"}</S.VisuallyHidden></span>
                                </S.Rule>
                            );
                        })}
                    </S.Rules>

                    {submitError && <S.Notice $tone="error" role="alert">{submitError}</S.Notice>}

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Criando conta..." : "Criar conta e abrir o painel"}
                    </Button>

                    <S.FooterText>
                        Já tem conta neste espaço? <Link to="/login">Entrar</Link>
                    </S.FooterText>
                </S.Form>
            )}
        </AuthLayout>
    );
}
