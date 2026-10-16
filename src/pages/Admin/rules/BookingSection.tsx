import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getTenantSettings, updateTenantSettings } from "../../../services/salonRules";
import type { RefundTier, TenantSettings, TenantSettingsInput } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import { describeTiers, refundFor } from "../../../utils/packageFormat";
import * as S from "./styles";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const TIMEZONES = [
    { value: "America/Sao_Paulo", label: "Brasília (maior parte do país)" },
    { value: "America/Manaus", label: "Amazonas (−1h)" },
    { value: "America/Cuiaba", label: "Mato Grosso e Mato Grosso do Sul (−1h)" },
    { value: "America/Rio_Branco", label: "Acre (−2h)" },
    { value: "America/Noronha", label: "Fernando de Noronha (+1h)" },
];

type LeadUnit = "hours" | "days";

interface Form {
    holdMinutes: string;
    leadValue: string;
    leadUnit: LeadUnit;
    maxDays: string;
    timezone: string;
    city: string;
    state: string;
    tiers: { minDays: string; percentage: string }[];
    notes: string;
    depositPercent: string;
    balanceDueDays: string;
    paymentInstructions: string;
}

function toForm(s: TenantSettings): Form {
    const lead = s.minLeadHours;
    const inDays = lead != null && lead % 24 === 0;
    return {
        holdMinutes: s.paymentHoldMinutes != null ? String(s.paymentHoldMinutes) : "",
        leadValue: lead == null ? "" : String(inDays ? lead / 24 : lead),
        leadUnit: inDays || lead == null ? "days" : "hours",
        maxDays: s.maxAdvanceDays != null ? String(s.maxAdvanceDays) : "",
        timezone: s.timezone,
        city: s.city ?? "",
        state: s.state ?? "",
        tiers: s.cancellationPolicy.tiers.map((t) => ({ minDays: String(t.minDays), percentage: String(t.percentage) })),
        notes: s.cancellationPolicy.notes ?? "",
        depositPercent: s.depositPercent != null ? String(s.depositPercent) : "",
        balanceDueDays: s.balanceDueDays != null ? String(s.balanceDueDays) : "",
        paymentInstructions: s.paymentInstructions ?? "",
    };
}

const int = (v: string) => (v.trim() === "" ? null : Number(v));

function tiersOf(f: Form): RefundTier[] {
    return f.tiers.filter((t) => t.minDays !== "" && t.percentage !== "").map((t) => ({ minDays: Number(t.minDays), percentage: Number(t.percentage) }));
}

function validate(f: Form): string[] {
    const errors: string[] = [];
    const hold = int(f.holdMinutes);
    if (hold != null && (!Number.isInteger(hold) || hold < 5 || hold > 10080)) errors.push("O prazo para pagar vai de 5 minutos a 7 dias (10080 minutos).");
    const leadHours = int(f.leadValue) == null ? null : Number(f.leadValue) * (f.leadUnit === "days" ? 24 : 1);
    const maxDays = int(f.maxDays);
    if (leadHours != null && maxDays != null && leadHours >= maxDays * 24) errors.push("A antecedência mínima precisa ser menor que o horizonte de reservas.");
    const tiers = tiersOf(f);
    if (tiers.length === 0) errors.push("A política de cancelamento precisa de pelo menos uma faixa.");
    if (new Set(tiers.map((t) => t.minDays)).size !== tiers.length) errors.push("Duas faixas de cancelamento não podem começar no mesmo número de dias.");
    if (tiers.some((t) => t.percentage < 0 || t.percentage > 100 || !Number.isInteger(t.percentage))) errors.push("O reembolso vai de 0% a 100%.");
    const deposit = int(f.depositPercent);
    if (deposit != null && (!Number.isInteger(deposit) || deposit < 1 || deposit > 100)) errors.push("O sinal vai de 1% a 100% do valor da reserva.");
    const dueDays = int(f.balanceDueDays);
    if (dueDays != null && (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 365)) errors.push("O prazo do restante vai de 0 a 365 dias antes do evento.");
    return errors;
}

/**
 * Regras da reserva e política de cancelamento do salão. Campo vazio = padrão da plataforma.
 * A política vale para as reservas feitas depois de salvar; as anteriores guardam a delas.
 */
export function BookingSection() {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [form, setForm] = useState<Form | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [simDays, setSimDays] = useState("45");

    useEffect(() => {
        const controller = new AbortController();
        getTenantSettings(controller.signal)
            .then((s) => { setSettings(s); setForm(toForm(s)); })
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar as regras do salão.")); });
        return () => controller.abort();
    }, []);

    if (!form || !settings) return <A.LoadingSpinner aria-label="Carregando regras" />;

    const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
    const setTier = (i: number, patch: Partial<Form["tiers"][number]>) => set("tiers", form.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
    const tiers = tiersOf(form);

    async function save(payload: TenantSettingsInput, done: string) {
        try {
            setSaving(true);
            const updated = await updateTenantSettings(payload);
            setSettings(updated);
            setForm(toForm(updated));
            setErrors([]);
            toast.success(done);
        } catch (err) {
            setErrors([getErrorMessage(err, "Não foi possível salvar as regras.")]);
        } finally {
            setSaving(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const problems = validate(form!);
        setErrors(problems);
        if (problems.length) return;
        const f = form!;
        save({
            paymentHoldMinutes: int(f.holdMinutes),
            minLeadHours: int(f.leadValue) == null ? null : Math.round(Number(f.leadValue) * (f.leadUnit === "days" ? 24 : 1)),
            maxAdvanceDays: int(f.maxDays),
            timezone: f.timezone,
            city: f.city.trim() || null,
            state: f.state || null,
            cancellationPolicy: { tiers, notes: f.notes.trim() || null },
            depositPercent: int(f.depositPercent),
            balanceDueDays: int(f.depositPercent) == null ? null : int(f.balanceDueDays),
            paymentInstructions: f.paymentInstructions.trim() || null,
        }, "Regras salvas.");
    }

    return (
        <A.Form onSubmit={handleSubmit} noValidate>
            {errors.length > 0 && <S.Errors role="alert">{errors.map((e) => <li key={e}>{e}</li>)}</S.Errors>}

            <A.FormSection>
                <legend>Reserva</legend>
                <S.InlineFields>
                    <S.NumberField>
                        Prazo para pagar (min)
                        <A.TextInput inputMode="numeric" value={form.holdMinutes} onChange={(e) => set("holdMinutes", e.target.value)} placeholder={`padrão: ${settings.effectivePaymentHoldMinutes}`} />
                    </S.NumberField>
                    <S.NumberField>
                        Antecedência mínima
                        <A.TextInput inputMode="numeric" value={form.leadValue} onChange={(e) => set("leadValue", e.target.value)} placeholder="sem mínimo" />
                    </S.NumberField>
                    <S.NumberField>
                        Em
                        <A.Select value={form.leadUnit} onChange={(e) => set("leadUnit", e.target.value as LeadUnit)}>
                            <option value="days">dias</option>
                            <option value="hours">horas</option>
                        </A.Select>
                    </S.NumberField>
                    <S.NumberField>
                        Reservas até (dias à frente)
                        <A.TextInput inputMode="numeric" value={form.maxDays} onChange={(e) => set("maxDays", e.target.value)} placeholder="sem limite" />
                    </S.NumberField>
                </S.InlineFields>
                <A.FieldHint>
                    Se você não registrar o pagamento (ou o sinal) dentro do prazo, a reserva expira e a data volta a ficar livre. Hoje o prazo é de <strong>{settings.effectivePaymentHoldMinutes} minutos</strong>.
                </A.FieldHint>
            </A.FormSection>

            <A.FormSection>
                <legend>Pagamento</legend>
                <S.Intro>
                    O cliente paga direto ao salão (PIX, dinheiro, cartão na maquininha) e você registra o que recebeu em
                    <strong> Reservas → Pagamentos</strong>. A reserva é confirmada quando o valor abaixo é atingido.
                    Para o cliente pagar por Pix ou cartão, ligue o <strong>Pagamento online</strong>: o sinal e o restante seguem as mesmas regras.
                </S.Intro>
                <S.InlineFields>
                    <S.NumberField>
                        Sinal para confirmar (%)
                        <A.TextInput inputMode="numeric" value={form.depositPercent} onChange={(e) => set("depositPercent", e.target.value)} placeholder="valor total" />
                    </S.NumberField>
                    <S.NumberField>
                        Restante até (dias antes)
                        <A.TextInput inputMode="numeric" value={form.balanceDueDays} onChange={(e) => set("balanceDueDays", e.target.value)} placeholder="o dia do evento" disabled={!form.depositPercent} />
                    </S.NumberField>
                </S.InlineFields>
                <A.FieldHint aria-live="polite">
                    {int(form.depositPercent) != null && Number(form.depositPercent) < 100
                        ? <>Numa reserva de R$ 1.000,00, o cliente confirma com <strong>R$ {(10 * Number(form.depositPercent)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> e paga o restante {int(form.balanceDueDays) != null ? `até ${form.balanceDueDays} dia${form.balanceDueDays === "1" ? "" : "s"} antes do evento` : "até o dia do evento"}.</>
                        : "Sem sinal: a reserva só é confirmada com o valor total."}
                </A.FieldHint>
                <A.FormGroup>
                    <label htmlFor="rules-pay-instructions">Como pagar (aparece para o cliente depois de reservar)</label>
                    <S.TextArea
                        id="rules-pay-instructions"
                        value={form.paymentInstructions}
                        onChange={(e) => set("paymentInstructions", e.target.value)}
                        maxLength={1000}
                        placeholder={"Ex.: PIX (chave CNPJ): 00.000.000/0001-00, em nome de ...\nEnvie o comprovante pelo WhatsApp. Também aceitamos cartão no salão."}
                    />
                </A.FormGroup>
            </A.FormSection>

            <A.FormSection>
                <legend>Onde fica o salão</legend>
                <A.FormRow $cols="2fr 1fr 2fr">
                    <A.FormGroup>
                        <label htmlFor="rules-city">Cidade</label>
                        <A.TextInput id="rules-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex.: Belo Horizonte" />
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="rules-state">UF</label>
                        <A.Select id="rules-state" value={form.state} onChange={(e) => set("state", e.target.value)}>
                            <option value="">—</option>
                            {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                        </A.Select>
                    </A.FormGroup>
                    <A.FormGroup>
                        <label htmlFor="rules-tz">Fuso horário</label>
                        <A.Select id="rules-tz" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                            {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                        </A.Select>
                    </A.FormGroup>
                </A.FormRow>
                <A.FieldHint>Os feriados municipais do salão ficam na aba <strong>Feriados</strong>.</A.FieldHint>
            </A.FormSection>

            <A.FormSection>
                <legend>Cancelamento e reembolso</legend>
                <S.Intro>Quanto o cliente recebe de volta ao cancelar uma reserva paga, pela antecedência. Vale para as reservas feitas depois de salvar.</S.Intro>
                {form.tiers.map((t, i) => (
                    <S.InlineFields key={i}>
                        <S.NumberField>
                            A partir de (dias antes)
                            <A.TextInput inputMode="numeric" value={t.minDays} onChange={(e) => setTier(i, { minDays: e.target.value })} />
                        </S.NumberField>
                        <S.NumberField>
                            Reembolso (%)
                            <A.TextInput inputMode="numeric" value={t.percentage} onChange={(e) => setTier(i, { percentage: e.target.value })} />
                        </S.NumberField>
                        <A.DangerButton type="button" $size="sm" onClick={() => set("tiers", form.tiers.filter((_, j) => j !== i))} disabled={form.tiers.length === 1} aria-label={`Remover a faixa ${i + 1}`}>
                            Remover
                        </A.DangerButton>
                    </S.InlineFields>
                ))}
                <A.InlineGroup>
                    <A.SecondaryButton type="button" $size="sm" onClick={() => set("tiers", [...form.tiers, { minDays: "", percentage: "" }])} disabled={form.tiers.length >= 10}>
                        Adicionar faixa
                    </A.SecondaryButton>
                </A.InlineGroup>
                <A.FormGroup>
                    <label htmlFor="rules-notes">Observação (opcional)</label>
                    <S.TextArea id="rules-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={500} placeholder="Ex.: Remarcação gratuita uma vez, com 30 dias de antecedência." />
                </A.FormGroup>

                {tiers.length > 0 && (
                    <A.FieldHint as="div">
                        <S.Sentences aria-label="Como fica para o cliente">
                            {describeTiers(tiers).map((line) => <li key={line}>{line}</li>)}
                        </S.Sentences>
                        <S.InlineFields style={{ marginTop: 12 }}>
                            <S.NumberField>
                                Simular: dias antes do evento
                                <A.TextInput inputMode="numeric" value={simDays} onChange={(e) => setSimDays(e.target.value)} />
                            </S.NumberField>
                            <p aria-live="polite">
                                Cancelando {Number(simDays) || 0} dia{Number(simDays) === 1 ? "" : "s"} antes, o cliente recebe <strong>{refundFor(tiers, Number(simDays) || 0)}%</strong>.
                            </p>
                        </S.InlineFields>
                    </A.FieldHint>
                )}
                {settings.cancellationPolicy.isDefault && <S.Meta>O salão está usando a política padrão da plataforma.</S.Meta>}
            </A.FormSection>

            <A.InlineGroup>
                <A.PrimaryButton type="submit" disabled={saving} aria-busy={saving}>{saving ? "Salvando..." : "Salvar regras"}</A.PrimaryButton>
                {!settings.cancellationPolicy.isDefault && (
                    <A.SecondaryButton type="button" disabled={saving} onClick={() => save({ cancellationPolicy: null }, "Política padrão restaurada.")}>
                        Usar a política padrão
                    </A.SecondaryButton>
                )}
            </A.InlineGroup>
        </A.Form>
    );
}
