import React, { useId, useState } from "react";
import { toast } from "react-toastify";
import { createTenant, updateTenant } from "../../services/platform";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getApiErrorCode } from "../../utils/errors";
import { ModalHeader } from "../Admin/ModalHeader";
import * as A from "../Admin/styles";
import { copyText, PLAN_OPTIONS, slugify, validateSlug } from "./constants";
import type { Tenant, TenantPlan } from "../../types";
import * as S from "./styles";

// ─── Novo estabelecimento ──────────────────────────────────────────────────────────────

interface CreateTenantModalProps {
    onClose: () => void;
    onCreated: (tenant: Tenant) => void;
}

/**
 * Cadastro de estabelecimento. O endereço (slug) é sugerido a partir do nome
 * enquanto a pessoa não o editar; depois disso, fica como ela escreveu.
 */
export function CreateTenantModal({ onClose, onCreated }: CreateTenantModalProps) {
    const ids = { name: useId(), slug: useId(), plan: useId(), slugHelp: useId(), slugError: useId() };
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [plan, setPlan] = useState<TenantPlan>("FREE");
    const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    function handleNameChange(value: string) {
        setName(value);
        if (!slugEdited) setSlug(slugify(value));
        if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
    }

    function handleSlugChange(value: string) {
        setSlugEdited(true);
        setSlug(value.toLowerCase().replace(/\s+/g, "-"));
        if (errors.slug) setErrors((e) => ({ ...e, slug: undefined }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const next: { name?: string; slug?: string } = {};
        if (name.trim().length < 2) next.name = "Informe o nome do estabelecimento (pelo menos 2 caracteres).";
        const slugError = validateSlug(slug);
        if (slugError) next.slug = slugError;
        if (next.name || next.slug) {
            setErrors(next);
            return;
        }

        try {
            setIsSaving(true);
            const tenant = await createTenant({ name: name.trim(), slug, plan });
            toast.success(`“${tenant.name}” cadastrado. Agora convide o dono.`);
            onCreated(tenant);
        } catch (error) {
            if (getApiErrorCode(error) === "TENANT_SLUG_IN_USE") {
                setErrors({ slug: "Já existe um estabelecimento com esse endereço. Escolha outro." });
            } else {
                toast.error(getErrorMessage(error, "Erro ao cadastrar o estabelecimento."));
            }
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <A.ModalOverlay onClick={() => !isSaving && onClose()}>
            <A.ModalBox role="dialog" aria-modal="true" aria-labelledby={`${ids.name}-title`} onClick={(e) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={isSaving}>
                    <span id={`${ids.name}-title`}>Novo estabelecimento</span>
                </ModalHeader>
                <A.Form onSubmit={handleSubmit} noValidate>
                    <A.FormGroup>
                        <label htmlFor={ids.name}>Nome do estabelecimento</label>
                        <A.TextInput
                            id={ids.name}
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Ex.: Salão Jardim das Flores"
                            maxLength={120}
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                        {errors.name && <S.FieldError role="alert">{errors.name}</S.FieldError>}
                    </A.FormGroup>

                    <A.FormGroup>
                        <label htmlFor={ids.slug}>Endereço (slug)</label>
                        <A.TextInput
                            id={ids.slug}
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="salao-jardim-das-flores"
                            maxLength={63}
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-invalid={!!errors.slug}
                            aria-describedby={errors.slug ? `${ids.slugError} ${ids.slugHelp}` : ids.slugHelp}
                        />
                        {errors.slug && <S.FieldError id={ids.slugError} role="alert">{errors.slug}</S.FieldError>}
                        <S.FieldHelp id={ids.slugHelp}>
                            Letras minúsculas, números e hífens. O dono entra por /login?espaco={slug || "endereco"}. Não dá para mudar depois.
                        </S.FieldHelp>
                    </A.FormGroup>

                    <A.FormGroup>
                        <label htmlFor={ids.plan}>Plano</label>
                        <A.Select id={ids.plan} value={plan} onChange={(e) => setPlan(e.target.value as TenantPlan)}>
                            {PLAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </A.Select>
                    </A.FormGroup>

                    <A.ModalActions>
                        <A.SecondaryButton type="button" onClick={onClose} disabled={isSaving}>Cancelar</A.SecondaryButton>
                        <A.PrimaryButton type="submit" disabled={isSaving}>{isSaving ? "Cadastrando..." : "Cadastrar estabelecimento"}</A.PrimaryButton>
                    </A.ModalActions>
                </A.Form>
            </A.ModalBox>
        </A.ModalOverlay>
    );
}

// ─── Ativar / desativar ───────────────────────────────────────────────────────

interface ToggleActiveModalProps {
    tenant: Tenant;
    onClose: () => void;
    onDone: (tenant: Tenant) => void;
}

/** Confirmação antes de ativar/desativar — desativar tira o espaço do ar para donos e clientes. */
export function ToggleActiveModal({ tenant, onClose, onDone }: ToggleActiveModalProps) {
    const titleId = useId();
    const [isSaving, setIsSaving] = useState(false);
    const deactivating = tenant.isActive;

    async function handleConfirm() {
        try {
            setIsSaving(true);
            const updated = await updateTenant(tenant.id, { isActive: !tenant.isActive });
            toast.success(deactivating ? `“${tenant.name}” foi desativado.` : `“${tenant.name}” foi reativado.`);
            onDone({ ...tenant, ...updated, stats: updated.stats ?? tenant.stats });
        } catch (error) {
            toast.error(getErrorMessage(error, deactivating ? "Erro ao desativar o estabelecimento." : "Erro ao reativar o estabelecimento."));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <A.ModalOverlay onClick={() => !isSaving && onClose()}>
            <A.ModalBox role="alertdialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
                <ModalHeader onClose={onClose} disabled={isSaving}>
                    <span id={titleId}>{deactivating ? "Desativar estabelecimento?" : "Reativar estabelecimento?"}</span>
                </ModalHeader>
                <A.ModalText>
                    {deactivating ? (
                        <>
                            <strong>{tenant.name}</strong> sai do ar: o dono não acessa o painel e os clientes não conseguem reservar
                            até você reativar. Os dados continuam guardados.
                        </>
                    ) : (
                        <>
                            <strong>{tenant.name}</strong> volta ao ar: o dono acessa o painel e os clientes voltam a reservar.
                        </>
                    )}
                </A.ModalText>
                <A.ModalActions>
                    <A.SecondaryButton type="button" onClick={onClose} disabled={isSaving}>Cancelar</A.SecondaryButton>
                    {deactivating ? (
                        <A.DangerButton type="button" onClick={handleConfirm} disabled={isSaving}>
                            {isSaving ? "Desativando..." : "Desativar estabelecimento"}
                        </A.DangerButton>
                    ) : (
                        <A.PrimaryButton type="button" onClick={handleConfirm} disabled={isSaving}>
                            {isSaving ? "Reativando..." : "Reativar estabelecimento"}
                        </A.PrimaryButton>
                    )}
                </A.ModalActions>
            </A.ModalBox>
        </A.ModalOverlay>
    );
}

// ─── Link copiável ────────────────────────────────────────────────────────────

interface CopyLinkProps {
    description: React.ReactNode;
    url: string;
    copyLabel?: string;
    children?: React.ReactNode;
}

export function CopyLink({ description, url, copyLabel = "Copiar link", children }: CopyLinkProps) {
    async function handleCopy() {
        if (await copyText(url)) toast.success("Link copiado.");
        else toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }

    return (
        <S.LinkBox>
            <p>{description}</p>
            <code>{url}</code>
            <S.LinkActions>
                <A.SecondaryButton type="button" $size="sm" onClick={handleCopy}>{copyLabel}</A.SecondaryButton>
                {children}
            </S.LinkActions>
        </S.LinkBox>
    );
}
