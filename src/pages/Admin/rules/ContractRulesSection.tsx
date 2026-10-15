import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    createClause, deleteClause, getTenantSettings, listClauses, listClauseTemplates, updateClause, updateTenantSettings,
} from "../../../services/salonRules";
import type { ClauseTemplate, ContractClause, TenantSettings } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import * as S from "./styles";

type ProfileKey = "legalName" | "documentNumber" | "address" | "contactWhatsapp" | "contactPhone" | "contactEmail" | "instagram" | "chatbotFaq";
type Profile = Record<ProfileKey, string>;

const PROFILE_KEYS: ProfileKey[] = ["legalName", "documentNumber", "address", "contactWhatsapp", "contactPhone", "contactEmail", "instagram", "chatbotFaq"];

const toProfile = (s: TenantSettings): Profile => Object.fromEntries(PROFILE_KEYS.map((k) => [k, s[k] ?? ""])) as Profile;

interface ClauseDraft {
    title: string;
    body: string;
    fine: string;
    time: string;
}

const draftOf = (c: { title: string; body: string; fineAmount?: string | null; timeLimit?: string | null }): ClauseDraft => ({
    title: c.title, body: c.body, fine: c.fineAmount != null ? String(Number(c.fineAmount)) : "", time: c.timeLimit ?? "",
});

/** Texto final como sai no contrato (a API faz o mesmo ao montar o documento). */
function render(d: ClauseDraft): string {
    const fine = d.fine.trim() ? Number(d.fine.replace(",", ".")).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "valor a combinar";
    const time = d.time.trim() || "horário combinado";
    return d.body.replaceAll("{{multa}}", fine).replaceAll("{{horario}}", time);
}

/**
 * Contrato e contato do salão (#47): dados do locador (o documento só aparece no painel e no contrato),
 * contatos públicos, o FAQ do chatbot e as cláusulas do contrato.
 */
export function ContractRulesSection() {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [clauses, setClauses] = useState<ContractClause[]>([]);
    const [templates, setTemplates] = useState<ClauseTemplate[]>([]);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [draft, setDraft] = useState<ClauseDraft>({ title: "", body: "", fine: "", time: "" });
    const [clauseError, setClauseError] = useState<string | null>(null);
    const [savingClause, setSavingClause] = useState(false);

    const loadClauses = useCallback(async (signal?: AbortSignal) => {
        const [c, t] = await Promise.all([listClauses(signal), listClauseTemplates(signal)]);
        if (signal?.aborted) return;
        setClauses([...c].sort((a, b) => a.sortOrder - b.sortOrder));
        setTemplates(t);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([getTenantSettings(controller.signal), loadClauses(controller.signal)])
            .then(([s]) => { setSettings(s); setProfile(toProfile(s)); })
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar o contrato do salão.")); });
        return () => controller.abort();
    }, [loadClauses]);

    if (!profile || !settings) return <A.LoadingSpinner aria-label="Carregando contrato" />;

    const setField = (k: ProfileKey, v: string) => setProfile((p) => (p ? { ...p, [k]: v } : p));

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        try {
            setSavingProfile(true);
            setProfileError(null);
            const payload = Object.fromEntries(PROFILE_KEYS.map((k) => [k, profile![k].trim() || null]));
            const updated = await updateTenantSettings(payload);
            setSettings(updated);
            setProfile(toProfile(updated));
            toast.success("Dados do salão salvos.");
        } catch (err) {
            setProfileError(getErrorMessage(err, "Não foi possível salvar os dados do salão."));
        } finally {
            setSavingProfile(false);
        }
    }

    function openClause(id: string, initial: ClauseDraft) {
        setOpenId(id);
        setDraft(initial);
        setClauseError(null);
    }

    async function saveClause(action: () => Promise<unknown>, done: string) {
        if (draft.title.trim().length < 2 || draft.body.trim().length < 10) { setClauseError("Dê um título e escreva o texto da regra (pelo menos 10 letras)."); return; }
        if (draft.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time)) { setClauseError("Use o horário no formato 23:00."); return; }
        try {
            setSavingClause(true);
            await action();
            toast.success(done);
            setOpenId(null);
            await loadClauses();
        } catch (err) {
            setClauseError(getErrorMessage(err, "Não foi possível salvar a regra."));
        } finally {
            setSavingClause(false);
        }
    }

    const clausePayload = () => ({
        title: draft.title.trim(), body: draft.body.trim(),
        fineAmount: draft.fine.trim() ? Number(draft.fine.replace(",", ".")) : null,
        timeLimit: draft.time.trim() || null,
    });

    async function run(action: () => Promise<unknown>, done: string) {
        try {
            await action();
            toast.success(done);
            await loadClauses();
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
        }
    }

    function move(index: number, delta: -1 | 1) {
        const a = clauses[index];
        const b = clauses[index + delta];
        if (!a || !b) return;
        const [oa, ob] = a.sortOrder === b.sortOrder ? [index, index + delta] : [a.sortOrder, b.sortOrder];
        run(() => Promise.all([updateClause(a.id, { sortOrder: ob }), updateClause(b.id, { sortOrder: oa })]), "Ordem atualizada.");
    }

    const usesFine = draft.body.includes("{{multa}}");
    const usesTime = draft.body.includes("{{horario}}");
    const clauseEditor = (onSave: () => void, label: string) => (
        <A.Form onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate style={{ gridColumn: "1 / -1" }}>
            {clauseError && <S.Errors role="alert"><li>{clauseError}</li></S.Errors>}
            <A.FormGroup>
                <label htmlFor="clause-title">Título</label>
                <A.TextInput id="clause-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={80} />
            </A.FormGroup>
            <A.FormGroup>
                <label htmlFor="clause-body">Texto</label>
                <S.TextArea id="clause-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} maxLength={2000} />
            </A.FormGroup>
            <A.FieldHint>Use <strong>{"{{multa}}"}</strong> e <strong>{"{{horario}}"}</strong> no texto: eles são preenchidos pelos campos abaixo.</A.FieldHint>
            <S.InlineFields>
                {usesFine && (
                    <S.NumberField>
                        Multa (R$)
                        <A.TextInput inputMode="decimal" value={draft.fine} onChange={(e) => setDraft({ ...draft, fine: e.target.value })} placeholder="a combinar" />
                    </S.NumberField>
                )}
                {usesTime && (
                    <S.NumberField>
                        Horário
                        <A.TextInput type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
                    </S.NumberField>
                )}
            </S.InlineFields>
            <A.FieldHint>No contrato: {render(draft)}</A.FieldHint>
            <A.InlineGroup>
                <A.PrimaryButton type="submit" $size="sm" disabled={savingClause} aria-busy={savingClause}>{savingClause ? "Salvando..." : label}</A.PrimaryButton>
                <A.SecondaryButton type="button" $size="sm" onClick={() => setOpenId(null)}>Cancelar</A.SecondaryButton>
            </A.InlineGroup>
        </A.Form>
    );

    const available = templates.filter((t) => !t.clauseId);

    return (
        <A.Section>
            <A.Form onSubmit={saveProfile} noValidate>
                {profileError && <S.Errors role="alert"><li>{profileError}</li></S.Errors>}
                <A.FormSection>
                    <legend>Locador</legend>
                    <S.Intro>Aparece no contrato. O documento nunca é mostrado na vitrine do salão.</S.Intro>
                    <A.FormRow>
                        <A.FormGroup>
                            <label htmlFor="p-legal">Nome ou razão social</label>
                            <A.TextInput id="p-legal" value={profile.legalName} onChange={(e) => setField("legalName", e.target.value)} placeholder={settings.name} />
                        </A.FormGroup>
                        <A.FormGroup>
                            <label htmlFor="p-doc">CPF ou CNPJ</label>
                            <A.TextInput id="p-doc" inputMode="numeric" value={profile.documentNumber} onChange={(e) => setField("documentNumber", e.target.value)} placeholder="000.000.000-00" autoComplete="off" />
                        </A.FormGroup>
                    </A.FormRow>
                    <A.FormGroup>
                        <label htmlFor="p-address">Endereço do salão</label>
                        <A.TextInput id="p-address" value={profile.address} onChange={(e) => setField("address", e.target.value)} />
                    </A.FormGroup>
                </A.FormSection>

                <A.FormSection>
                    <legend>Contato</legend>
                    <S.Intro>Aparece na página de contato, no contrato e nas respostas do assistente virtual. Deixe em branco o que o salão não usa.</S.Intro>
                    <A.FormRow>
                        <A.FormGroup>
                            <label htmlFor="p-wa">WhatsApp</label>
                            <A.TextInput id="p-wa" type="tel" value={profile.contactWhatsapp} onChange={(e) => setField("contactWhatsapp", e.target.value)} placeholder="(00) 00000-0000" />
                        </A.FormGroup>
                        <A.FormGroup>
                            <label htmlFor="p-phone">Telefone</label>
                            <A.TextInput id="p-phone" type="tel" value={profile.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} />
                        </A.FormGroup>
                    </A.FormRow>
                    <A.FormRow>
                        <A.FormGroup>
                            <label htmlFor="p-email">E-mail (recebe as mensagens de contato)</label>
                            <A.TextInput id="p-email" type="email" value={profile.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} />
                        </A.FormGroup>
                        <A.FormGroup>
                            <label htmlFor="p-ig">Instagram</label>
                            <A.TextInput id="p-ig" value={profile.instagram} onChange={(e) => setField("instagram", e.target.value)} placeholder="@seusalao" />
                        </A.FormGroup>
                    </A.FormRow>
                </A.FormSection>

                <A.FormSection>
                    <legend>Assistente virtual</legend>
                    <S.Intro>O assistente já responde com seus pacotes, preços e regras. Escreva aqui o que mais os clientes perguntam.</S.Intro>
                    <A.FormGroup>
                        <label htmlFor="p-faq">Perguntas e respostas</label>
                        <S.TextArea id="p-faq" rows={6} value={profile.chatbotFaq} onChange={(e) => setField("chatbotFaq", e.target.value)} maxLength={4000} placeholder={"P: Tem estacionamento?\nR: Sim, para 20 carros."} />
                    </A.FormGroup>
                </A.FormSection>

                <A.InlineGroup>
                    <A.PrimaryButton type="submit" disabled={savingProfile} aria-busy={savingProfile}>{savingProfile ? "Salvando..." : "Salvar dados do salão"}</A.PrimaryButton>
                </A.InlineGroup>
            </A.Form>

            <A.SectionHeader>
                <A.SectionTitle>Regras do espaço no contrato</A.SectionTitle>
                {openId !== "new" && <A.SecondaryButton type="button" onClick={() => openClause("new", { title: "", body: "", fine: "", time: "" })}>Escrever regra própria</A.SecondaryButton>}
            </A.SectionHeader>
            <S.Intro>Entram no contrato nesta ordem, depois do pacote, dos valores e da política de cancelamento.</S.Intro>

            <div>
                {openId === "new" && <S.ItemRow>{clauseEditor(() => saveClause(() => createClause(clausePayload()), "Regra criada."), "Criar regra")}</S.ItemRow>}
                {clauses.length === 0 && openId !== "new" && <S.Meta>Nenhuma regra ainda. Comece pelos modelos abaixo.</S.Meta>}
                {clauses.map((c, i) => (
                    <S.ItemRow key={c.id}>
                        <S.ItemName>
                            <strong>{c.title}{c.isActive ? "" : " (fora do contrato)"}</strong>
                            <span>{c.rendered}</span>
                        </S.ItemName>
                        <A.InlineGroup>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => openClause(c.id, draftOf(c))} aria-label={`Editar ${c.title}`}>Editar</A.SecondaryButton>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => run(() => updateClause(c.id, { isActive: !c.isActive }), c.isActive ? "Regra tirada do contrato." : "Regra de volta ao contrato.")} aria-label={`${c.isActive ? "Tirar do contrato" : "Pôr no contrato"}: ${c.title}`}>
                                {c.isActive ? "Tirar do contrato" : "Pôr no contrato"}
                            </A.SecondaryButton>
                            <A.SecondaryButton type="button" $size="sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${c.title} na ordem`} title="Subir na ordem">↑</A.SecondaryButton>
                            <A.SecondaryButton type="button" $size="sm" disabled={i === clauses.length - 1} onClick={() => move(i, 1)} aria-label={`Descer ${c.title} na ordem`} title="Descer na ordem">↓</A.SecondaryButton>
                            <A.DangerButton type="button" $size="sm" onClick={() => { if (window.confirm(`Excluir a regra "${c.title}"? Contratos já aceitos não mudam.`)) run(() => deleteClause(c.id), "Regra excluída."); }} aria-label={`Excluir ${c.title}`}>Excluir</A.DangerButton>
                        </A.InlineGroup>
                        {openId === c.id && clauseEditor(() => saveClause(() => updateClause(c.id, clausePayload()), "Regra salva."), "Salvar regra")}
                    </S.ItemRow>
                ))}
            </div>

            {available.length > 0 && (
                <>
                    <A.SectionTitle as="h3">Modelos de regra</A.SectionTitle>
                    <div>
                        {available.map((t) => (
                            <S.ItemRow key={t.key}>
                                <S.ItemName>
                                    <strong>{t.title}</strong>
                                    <span>{render({ title: t.title, body: t.body, fine: "", time: "" })}</span>
                                </S.ItemName>
                                <A.SecondaryButton type="button" $size="sm" onClick={() => openClause(t.key, draftOf(t))} aria-label={`Usar o modelo ${t.title}`}>Usar este modelo</A.SecondaryButton>
                                {openId === t.key && clauseEditor(() => saveClause(() => createClause({ key: t.key, ...clausePayload() }), "Regra adicionada ao contrato."), "Adicionar ao contrato")}
                            </S.ItemRow>
                        ))}
                    </div>
                </>
            )}
        </A.Section>
    );
}
