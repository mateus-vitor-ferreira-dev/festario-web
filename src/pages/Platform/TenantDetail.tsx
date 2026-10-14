import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { NoResults, Pagination, SelectField } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useListParams } from "../../hooks/useListParams";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { createInvite, findTenantBySlug, listInvitesPage, revokeInvite } from "../../services/platform";
import { getApiErrorCode, isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import { PANEL_PATH } from "../../utils/roles";
import { formatCurrency, formatDate, formatDateTime } from "../Admin/tabs/constants";
import { ModalHeader } from "../Admin/ModalHeader";
import * as A from "../Admin/styles";
import { CopyLink, ToggleActiveModal } from "./components";
import { INVITE_STATUS_LABELS, INVITE_STATUS_OPTIONS, INVITES_PAGE_SIZE, PLAN_LABELS, tenantLoginUrl } from "./constants";
import type { CreateInviteResult, ListParams, OwnerInvite, Tenant } from "../../types";
import * as S from "./styles";

const INVITE_KEYS = ["status"] as const;

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

type LoadState = "loading" | "ready" | "not-found" | "error";

/**
 * Detalhe do estabelecimento (`/plataforma/espacos/:slug`, só ADMIN): contagens,
 * ativar/desativar, abrir o painel do espaço e os convites do dono (convidar,
 * acompanhar a situação e revogar).
 */
export default function TenantDetail() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const { setTenant } = useAuth();
    const [tenant, setTenantData] = useState<Tenant | null>(null);
    const [state, setState] = useState<LoadState>("loading");
    const [errorText, setErrorText] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setState((s) => (s === "ready" ? s : "loading"));
                const found = await findTenantBySlug(slug, controller.signal);
                if (controller.signal.aborted) return;
                setTenantData(found);
                setState(found ? "ready" : "not-found");
            } catch (error) {
                if (isAbortError(error)) return;
                setErrorText(getLoadErrorMessage(error, "Erro ao carregar o estabelecimento."));
                setState("error");
            }
        })();
        return () => controller.abort();
    }, [slug, reloadKey]);

    const reloadTenant = useCallback(() => setReloadKey((k) => k + 1), []);

    function openPanel() {
        if (!tenant) return;
        setTenant({ slug: tenant.slug, name: tenant.name });
        navigate(PANEL_PATH);
    }

    if (state === "loading") {
        return (
            <A.Container>
                <S.BackLink to="/plataforma"><BackIcon />Voltar para a plataforma</S.BackLink>
                <A.LoadingSpinner role="status" aria-label="Carregando estabelecimento" />
            </A.Container>
        );
    }

    if (state === "not-found" || state === "error" || !tenant) {
        return (
            <A.Container>
                <S.BackLink to="/plataforma"><BackIcon />Voltar para a plataforma</S.BackLink>
                {state === "error" ? (
                    <S.ErrorState role="alert">
                        <h3>Não foi possível carregar o estabelecimento</h3>
                        <p>{errorText}</p>
                        <A.SecondaryButton type="button" onClick={reloadTenant}>Tentar de novo</A.SecondaryButton>
                    </S.ErrorState>
                ) : (
                    <A.EmptyState>
                        <h3>Estabelecimento não encontrado</h3>
                        <p>Nenhum estabelecimento usa o endereço “{slug}”. Volte para a plataforma e escolha um da lista.</p>
                    </A.EmptyState>
                )}
            </A.Container>
        );
    }

    const stats = tenant.stats;

    return (
        <A.Container>
            <S.BackLink to="/plataforma"><BackIcon />Voltar para a plataforma</S.BackLink>

            <S.HeaderRow>
                <A.PageHeader>
                    <A.Title>{tenant.name}</A.Title>
                    <S.MetaList>
                        <div><dt>Endereço</dt><dd>{tenant.slug}</dd></div>
                        <div><dt>Plano</dt><dd>{PLAN_LABELS[tenant.plan] ?? tenant.plan}</dd></div>
                        <div>
                            <dt>Situação</dt>
                            <dd><A.ActiveBadge $active={tenant.isActive}>{tenant.isActive ? "Ativo" : "Desativado"}</A.ActiveBadge></dd>
                        </div>
                        {tenant.createdAt && <div><dt>Criado em</dt><dd>{formatDate(tenant.createdAt)}</dd></div>}
                    </S.MetaList>
                </A.PageHeader>
                <A.InlineGroup>
                    <A.PrimaryButton
                        type="button"
                        onClick={openPanel}
                        disabled={!tenant.isActive}
                        title={tenant.isActive ? undefined : "Reative o estabelecimento para abrir o painel"}
                    >
                        Abrir painel do espaço
                    </A.PrimaryButton>
                    {tenant.isActive ? (
                        <A.DangerButton type="button" onClick={() => setToggling(true)}>Desativar</A.DangerButton>
                    ) : (
                        <A.SecondaryButton type="button" onClick={() => setToggling(true)}>Reativar</A.SecondaryButton>
                    )}
                </A.InlineGroup>
            </S.HeaderRow>

            {!tenant.isActive && (
                <A.ContextBar role="note">
                    <span>Este estabelecimento está desativado: o dono não acessa o painel e os clientes não reservam. Reative para voltar ao ar.</span>
                </A.ContextBar>
            )}

            <A.SummaryGrid aria-label="Números do estabelecimento">
                <A.SummaryCard>
                    <A.SummaryLabel>Receita paga</A.SummaryLabel>
                    <A.SummaryValue>{formatCurrency(stats?.paidRevenue ?? 0)}</A.SummaryValue>
                </A.SummaryCard>
                <A.SummaryCard>
                    <A.SummaryLabel>Reservas</A.SummaryLabel>
                    <A.SummaryValue>{(stats?.reservations ?? 0).toLocaleString("pt-BR")}</A.SummaryValue>
                </A.SummaryCard>
                <A.SummaryCard>
                    <A.SummaryLabel>Espaços</A.SummaryLabel>
                    <A.SummaryValue>{(stats?.venues ?? 0).toLocaleString("pt-BR")}</A.SummaryValue>
                </A.SummaryCard>
                <A.SummaryCard>
                    <A.SummaryLabel>Donos</A.SummaryLabel>
                    <A.SummaryValue>{(stats?.owners ?? 0).toLocaleString("pt-BR")}</A.SummaryValue>
                </A.SummaryCard>
                <A.SummaryCard>
                    <A.SummaryLabel>Convites pendentes</A.SummaryLabel>
                    <A.SummaryValue>{(stats?.pendingInvites ?? 0).toLocaleString("pt-BR")}</A.SummaryValue>
                </A.SummaryCard>
            </A.SummaryGrid>

            <S.Panel aria-labelledby="login-link-title">
                <S.PanelTitle id="login-link-title">Acesso do dono</S.PanelTitle>
                <CopyLink
                    description="Depois de aceitar o convite, o dono entra por este link (ele já abre o login deste estabelecimento)."
                    url={tenantLoginUrl(tenant.slug)}
                />
            </S.Panel>

            <InvitesSection tenant={tenant} disabled={!tenant.isActive} onChanged={reloadTenant} />

            {toggling && (
                <ToggleActiveModal
                    tenant={tenant}
                    onClose={() => setToggling(false)}
                    onDone={(updated) => {
                        setToggling(false);
                        setTenantData(updated);
                        reloadTenant();
                    }}
                />
            )}
        </A.Container>
    );
}

// ─── Convites ────────────────────────────────────────────────────────────────

interface InvitesSectionProps {
    tenant: Tenant;
    disabled: boolean;
    /** Contagens do espaço mudaram (convite criado/revogado). */
    onChanged: () => void;
}

function InvitesSection({ tenant, disabled, onChanged }: InvitesSectionProps) {
    const emailId = useId();
    const emailErrorId = useId();
    const topRef = useRef<HTMLDivElement | null>(null);
    const { values, page, activeKeys, setFilter, setPage, clearFilters } = useListParams(INVITE_KEYS);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [lastInvite, setLastInvite] = useState<CreateInviteResult | null>(null);
    const [revoking, setRevoking] = useState<OwnerInvite | null>(null);

    const fetcher = useCallback(
        (params: ListParams, signal?: AbortSignal) => listInvitesPage(tenant.id, params, signal),
        [tenant.id],
    );
    const params = useMemo(() => ({ ...values, page, limit: INVITES_PAGE_SIZE }), [values, page]);
    const { data: invites, meta, isLoading, isFetching, refresh } = usePaginatedQuery(fetcher, params, {
        errorMessage: "Erro ao carregar os convites.",
        onPageOutOfRange: setPage,
    });

    async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const value = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError("Informe um e-mail válido, como dono@espaco.com.br.");
            return;
        }
        try {
            setIsSending(true);
            const result = await createInvite(tenant.id, value);
            setLastInvite(result);
            setEmail("");
            toast.success(result.emailSent ? `Convite enviado para ${value}.` : `Convite criado para ${value}.`);
            refresh();
            onChanged();
        } catch (error) {
            if (getApiErrorCode(error) === "EMAIL_ALREADY_IN_USE") {
                setEmailError("Este e-mail já tem uma conta. Use outro e-mail.");
            } else {
                toast.error(getErrorMessage(error, "Erro ao enviar o convite."));
            }
        } finally {
            setIsSending(false);
        }
    }

    return (
        <S.Panel aria-labelledby="invites-title">
            <A.ScrollAnchor ref={topRef} tabIndex={-1}>
                <A.SectionHeader>
                    <S.PanelTitle id="invites-title">Convites do dono</S.PanelTitle>
                    {meta?.total !== undefined && (
                        <A.ResultCount aria-live="polite">
                            {meta.total.toLocaleString("pt-BR")} convite{meta.total === 1 ? "" : "s"}
                        </A.ResultCount>
                    )}
                </A.SectionHeader>
            </A.ScrollAnchor>

            <S.PanelText>
                O convidado recebe um link para criar a conta de dono deste estabelecimento. O convite vale por alguns dias; enviar de novo
                para o mesmo e-mail cancela o anterior.
            </S.PanelText>

            <S.InlineForm onSubmit={handleInvite} noValidate>
                <A.FormGroup>
                    <label htmlFor={emailId}>E-mail do dono</label>
                    <A.TextInput
                        id={emailId}
                        type="email"
                        inputMode="email"
                        autoComplete="off"
                        placeholder="dono@espaco.com.br"
                        value={email}
                        maxLength={254}
                        disabled={disabled}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError(null);
                        }}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? emailErrorId : undefined}
                    />
                </A.FormGroup>
                <A.PrimaryButton type="submit" disabled={isSending || disabled}>
                    {isSending ? "Enviando..." : "Convidar dono"}
                </A.PrimaryButton>
            </S.InlineForm>
            {emailError && <S.FieldError id={emailErrorId} role="alert">{emailError}</S.FieldError>}
            {disabled && <S.FieldHelp>Reative o estabelecimento para convidar um dono.</S.FieldHelp>}

            {lastInvite?.inviteUrl && (
                <CopyLink
                    description={
                        lastInvite.emailSent ? (
                            <>Convite enviado para <strong>{lastInvite.invite.email}</strong>. Se precisar, envie também o link abaixo.</>
                        ) : (
                            <>
                                O e-mail não está configurado neste ambiente, então nada foi enviado para{" "}
                                <strong>{lastInvite.invite.email}</strong>. Copie o link e mande para o dono.
                            </>
                        )
                    }
                    url={lastInvite.inviteUrl}
                    copyLabel="Copiar link do convite"
                >
                    <A.SecondaryButton type="button" $size="sm" onClick={() => setLastInvite(null)}>Fechar</A.SecondaryButton>
                </CopyLink>
            )}

            <S.StatusFilter>
                <SelectField label="Situação" value={values.status} onChange={(v) => setFilter("status", v)} options={INVITE_STATUS_OPTIONS} />
            </S.StatusFilter>

            {isLoading ? (
                <A.LoadingSpinner role="status" aria-label="Carregando convites" />
            ) : invites.length === 0 ? (
                activeKeys.length > 0 ? (
                    <NoResults title="Nenhum convite nessa situação" description="Escolha outra situação ou veja todos os convites." onClear={clearFilters} clearLabel="Ver todos" />
                ) : (
                    <A.EmptyState>
                        <h3>Nenhum convite enviado</h3>
                        <p>Informe o e-mail do dono acima e use “Convidar dono”.</p>
                    </A.EmptyState>
                )
            ) : (
                <A.ListRegion $busy={isFetching} aria-busy={isFetching}>
                    <A.TableWrapper>
                        <A.Table>
                            <thead>
                                <tr>
                                    <A.Th>E-mail</A.Th>
                                    <A.Th>Situação</A.Th>
                                    <A.Th>Vence em</A.Th>
                                    <A.Th>Enviado</A.Th>
                                    <A.Th><A.VisuallyHidden>Ações</A.VisuallyHidden></A.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((inv) => (
                                    <A.Tr key={inv.id}>
                                        <A.Td><strong>{inv.email}</strong></A.Td>
                                        <A.Td>
                                            <S.InviteChip $status={inv.status}>{INVITE_STATUS_LABELS[inv.status] ?? inv.status}</S.InviteChip>
                                        </A.Td>
                                        <A.Td>
                                            {inv.status === "accepted" && inv.acceptedAt
                                                ? <S.Muted>Aceito em {formatDate(inv.acceptedAt)}</S.Muted>
                                                : inv.status === "revoked" && inv.revokedAt
                                                    ? <S.Muted>Revogado em {formatDate(inv.revokedAt)}</S.Muted>
                                                    : formatDateTime(inv.expiresAt)}
                                        </A.Td>
                                        <A.Td>
                                            {formatDate(inv.createdAt)}
                                            {inv.invitedBy?.name && <S.Muted> · por {inv.invitedBy.name}</S.Muted>}
                                        </A.Td>
                                        <A.Td>
                                            <S.RowActions>
                                                {inv.status === "valid" && (
                                                    <A.DangerButton type="button" $size="sm" onClick={() => setRevoking(inv)} aria-label={`Revogar convite de ${inv.email}`}>
                                                        Revogar
                                                    </A.DangerButton>
                                                )}
                                            </S.RowActions>
                                        </A.Td>
                                    </A.Tr>
                                ))}
                            </tbody>
                        </A.Table>
                    </A.TableWrapper>
                    {meta && (
                        <Pagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            total={meta.total}
                            limit={meta.limit}
                            count={invites.length}
                            hasNext={meta.hasNext}
                            onChange={setPage}
                            scrollTargetRef={topRef}
                            disabled={isFetching}
                            label="Paginação dos convites"
                        />
                    )}
                </A.ListRegion>
            )}

            {revoking && (
                <RevokeInviteModal
                    tenantId={tenant.id}
                    invite={revoking}
                    onClose={() => setRevoking(null)}
                    onDone={() => {
                        setRevoking(null);
                        refresh();
                        onChanged();
                    }}
                />
            )}
        </S.Panel>
    );
}

interface RevokeInviteModalProps {
    tenantId: string;
    invite: OwnerInvite;
    onClose: () => void;
    onDone: () => void;
}

function RevokeInviteModal({ tenantId, invite, onClose, onDone }: RevokeInviteModalProps) {
    const titleId = useId();
    const [isSaving, setIsSaving] = useState(false);

    async function handleConfirm() {
        try {
            setIsSaving(true);
            await revokeInvite(tenantId, invite.id);
            toast.success(`Convite de ${invite.email} revogado.`);
            onDone();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao revogar o convite."));
            if (getApiErrorCode(error) === "INVITE_ALREADY_ACCEPTED") onDone();
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <A.ModalOverlay onClick={() => !isSaving && onClose()}>
            <A.ModalBox role="alertdialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={isSaving}>
                    <span id={titleId}>Revogar convite?</span>
                </ModalHeader>
                <A.ModalText>
                    O link enviado para <strong>{invite.email}</strong> deixa de funcionar. Se mudar de ideia, envie um novo convite.
                </A.ModalText>
                <A.ModalActions>
                    <A.SecondaryButton type="button" onClick={onClose} disabled={isSaving}>Cancelar</A.SecondaryButton>
                    <A.DangerButton type="button" onClick={handleConfirm} disabled={isSaving}>
                        {isSaving ? "Revogando..." : "Revogar convite"}
                    </A.DangerButton>
                </A.ModalActions>
            </A.ModalBox>
        </A.ModalOverlay>
    );
}
