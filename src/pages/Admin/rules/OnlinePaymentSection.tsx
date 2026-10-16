import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createPaymentAccount, getPaymentAccount, refreshPaymentAccount, setPaymentMode } from "../../../services/payment";
import { getTenantSettings } from "../../../services/salonRules";
import type { PaymentAccountHolder, PaymentAccountInfo } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import * as S from "./styles";

interface HolderForm {
    name: string;
    email: string;
    cpfCnpj: string;
    birthDate: string;
    companyType: "" | "MEI" | "LIMITED" | "INDIVIDUAL" | "ASSOCIATION";
    mobilePhone: string;
    incomeValue: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
}

const EMPTY: HolderForm = {
    name: "", email: "", cpfCnpj: "", birthDate: "", companyType: "", mobilePhone: "", incomeValue: "",
    postalCode: "", address: "", addressNumber: "", complement: "", province: "",
};

const digits = (v: string) => v.replace(/\D/g, "");

const COMPANY_TYPES = [
    { value: "MEI", label: "MEI" },
    { value: "LIMITED", label: "Limitada (Ltda.)" },
    { value: "INDIVIDUAL", label: "Empresário individual" },
    { value: "ASSOCIATION", label: "Associação" },
] as const;

/** O que falta no formulário, em palavras; vazio quando dá para enviar. */
function validate(f: HolderForm): string[] {
    const errors: string[] = [];
    const doc = digits(f.cpfCnpj);
    if (f.name.trim().length < 3) errors.push("Informe o nome do titular.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.push("Informe um e-mail válido.");
    if (doc.length !== 11 && doc.length !== 14) errors.push("CPF (11 números) ou CNPJ (14 números) do titular.");
    if (doc.length === 11 && !f.birthDate) errors.push("Com CPF, informe a data de nascimento.");
    if (![10, 11].includes(digits(f.mobilePhone).length)) errors.push("Celular com DDD.");
    if (!(Number(f.incomeValue.replace(/\./g, "").replace(",", ".")) > 0)) errors.push("Faturamento (ou renda) mensal aproximado.");
    if (digits(f.postalCode).length !== 8) errors.push("CEP com 8 números.");
    if (!f.address.trim() || !f.addressNumber.trim() || !f.province.trim()) errors.push("Endereço, número e bairro.");
    return errors;
}

function toHolder(f: HolderForm): PaymentAccountHolder {
    const isCompany = digits(f.cpfCnpj).length === 14;
    return {
        name: f.name.trim(),
        email: f.email.trim(),
        cpfCnpj: digits(f.cpfCnpj),
        birthDate: isCompany ? null : f.birthDate,
        companyType: isCompany ? (f.companyType || "LIMITED") : null,
        mobilePhone: digits(f.mobilePhone),
        incomeValue: Number(f.incomeValue.replace(/\./g, "").replace(",", ".")),
        postalCode: digits(f.postalCode),
        address: f.address.trim(),
        addressNumber: f.addressNumber.trim(),
        complement: f.complement.trim() || null,
        province: f.province.trim(),
    };
}

/**
 * Pagamento online do salão pelo Asaas, em três passos: criar a conta do salão (subconta em nome do
 * titular), enviar os documentos e, com a conta aprovada, ligar o pagamento online. O dinheiro das
 * reservas cai na conta do salão; o combinado continua valendo para quem preferir.
 */
export function OnlinePaymentSection() {
    const [info, setInfo] = useState<PaymentAccountInfo | null>(null);
    const [form, setForm] = useState<HolderForm>(EMPTY);
    const [errors, setErrors] = useState<string[]>([]);
    const [busy, setBusy] = useState<null | "create" | "refresh" | "mode">(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([getPaymentAccount(controller.signal), getTenantSettings(controller.signal).catch(() => null)])
            .then(([account, settings]) => {
                setInfo(account);
                // Os dados do contrato já preenchem o que der; o dono confere antes de enviar.
                if (settings) {
                    setForm((f) => ({
                        ...f,
                        name: settings.legalName ?? "",
                        cpfCnpj: settings.documentNumber ?? "",
                        email: settings.contactEmail ?? "",
                        mobilePhone: settings.contactWhatsapp ?? settings.contactPhone ?? "",
                    }));
                }
            })
            .catch((err) => { if (!isAbortError(err)) setLoadError(getErrorMessage(err, "Não foi possível carregar o pagamento online.")); });
        return () => controller.abort();
    }, []);

    const set = <K extends keyof HolderForm>(key: K, value: HolderForm[K]) => setForm((f) => ({ ...f, [key]: value }));
    const isCompany = digits(form.cpfCnpj).length === 14;

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        const problems = validate(form);
        setErrors(problems);
        if (problems.length) return;
        try {
            setBusy("create");
            setInfo(await createPaymentAccount(toHolder(form)));
            toast.success("Conta criada no Asaas. Agora envie os documentos.");
        } catch (err) {
            setErrors([getErrorMessage(err, "O Asaas não criou a conta.")]);
        } finally {
            setBusy(null);
        }
    }

    async function handleRefresh() {
        try {
            setBusy("refresh");
            const next = await refreshPaymentAccount();
            setInfo(next);
            toast.info(next.account?.status === "APPROVED" ? "Conta aprovada pelo Asaas." : next.account?.detail ?? "Situação atualizada.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível consultar o Asaas."));
        } finally {
            setBusy(null);
        }
    }

    async function handleMode(mode: "MANUAL" | "ONLINE") {
        try {
            setBusy("mode");
            setInfo(await setPaymentMode(mode));
            toast.success(mode === "ONLINE" ? "Pagamento online ligado. Os clientes já podem pagar por Pix ou cartão." : "Pagamento online desligado.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível mudar o modo de pagamento."));
        } finally {
            setBusy(null);
        }
    }

    if (loadError) return <A.ModalNote role="alert">{loadError}</A.ModalNote>;
    if (!info) return <A.LoadingSpinner aria-label="Carregando pagamento online" />;

    if (!info.available) {
        return (
            <A.FormSection as="section">
                <legend>Pagamento online</legend>
                <S.Intro>O pagamento online ainda não está disponível no Festário. Enquanto isso, o cliente combina o pagamento com o salão e você registra o que recebeu.</S.Intro>
            </A.FormSection>
        );
    }

    const account = info.account;
    const approved = account?.status === "APPROVED";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <S.Intro>
                Com o pagamento online, o cliente paga o sinal e o restante por Pix ou cartão, e o dinheiro cai na conta do salão no
                <strong> Asaas</strong>. A reserva confirma sozinha quando o pagamento é aprovado. Quem preferir continua combinando com você.
            </S.Intro>

            <S.Steps aria-label="Ligar o pagamento online">
                <S.Step $done={Boolean(account)}>
                    <div>
                        <strong>Criar a conta do salão no Asaas</strong>
                        <p>{account ? "Conta criada." : "Em nome do dono (CPF) ou da empresa do salão (CNPJ). É para onde o dinheiro vai."}</p>
                    </div>
                </S.Step>
                <S.Step $done={approved}>
                    <div>
                        <strong>Enviar os documentos</strong>
                        <p>
                            {!account ? "Depois de criar a conta, o Asaas pede um documento com foto e uma selfie do titular."
                                : approved ? "Documentos aprovados."
                                : account.status === "REJECTED" ? (account.detail ?? "O Asaas recusou o cadastro.")
                                : (account.detail ?? "Envie pelo link ou pelo e-mail que o Asaas mandou ao titular.")}
                        </p>
                        {account && !approved && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {account.onboardingUrl && (
                                    <A.PrimaryButton as="a" href={account.onboardingUrl} target="_blank" rel="noopener noreferrer" $size="sm">Enviar documentos</A.PrimaryButton>
                                )}
                                <A.SecondaryButton type="button" $size="sm" onClick={handleRefresh} disabled={busy !== null} aria-busy={busy === "refresh"}>
                                    {busy === "refresh" ? "Consultando..." : "Atualizar situação"}
                                </A.SecondaryButton>
                            </div>
                        )}
                    </div>
                </S.Step>
                <S.Step $done={info.mode === "ONLINE"}>
                    <div>
                        <strong>Ligar o pagamento online</strong>
                        <p>
                            {info.mode === "ONLINE" ? "Ligado: os clientes veem \"Pagar agora\" na reserva."
                                : approved ? "A conta está aprovada. Ligue quando quiser."
                                : "Fica disponível quando o Asaas aprovar a conta."}
                        </p>
                        {approved && (
                            info.mode === "ONLINE"
                                ? <A.SecondaryButton type="button" $size="sm" onClick={() => handleMode("MANUAL")} disabled={busy !== null}>Desligar</A.SecondaryButton>
                                : <A.PrimaryButton type="button" $size="sm" onClick={() => handleMode("ONLINE")} disabled={busy !== null}>Ligar pagamento online</A.PrimaryButton>
                        )}
                    </div>
                </S.Step>
            </S.Steps>

            {!account && (
                <A.Form onSubmit={handleCreate} noValidate aria-label="Criar a conta do salão no Asaas">
                    {errors.length > 0 && <S.Errors role="alert">{errors.map((e) => <li key={e}>{e}</li>)}</S.Errors>}
                    <A.FormSection>
                        <legend>Titular da conta</legend>
                        <A.FormRow $cols="2fr 1fr">
                            <A.FormGroup>
                                <label htmlFor="pa-name">Nome completo ou razão social</label>
                                <A.TextInput id="pa-name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pa-doc">CPF ou CNPJ</label>
                                <A.TextInput id="pa-doc" inputMode="numeric" value={form.cpfCnpj} onChange={(e) => set("cpfCnpj", e.target.value)} />
                            </A.FormGroup>
                        </A.FormRow>
                        <A.FormRow $cols="1fr 1fr 1fr">
                            {isCompany ? (
                                <A.FormGroup>
                                    <label htmlFor="pa-company">Tipo de empresa</label>
                                    <A.Select id="pa-company" value={form.companyType} onChange={(e) => set("companyType", e.target.value as HolderForm["companyType"])}>
                                        <option value="">Limitada (Ltda.)</option>
                                        {COMPANY_TYPES.filter((c) => c.value !== "LIMITED").map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </A.Select>
                                </A.FormGroup>
                            ) : (
                                <A.FormGroup>
                                    <label htmlFor="pa-birth">Data de nascimento</label>
                                    <A.TextInput id="pa-birth" type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
                                </A.FormGroup>
                            )}
                            <A.FormGroup>
                                <label htmlFor="pa-phone">Celular com DDD</label>
                                <A.TextInput id="pa-phone" inputMode="tel" value={form.mobilePhone} onChange={(e) => set("mobilePhone", e.target.value)} autoComplete="tel" />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pa-income">Faturamento mensal (R$)</label>
                                <A.TextInput id="pa-income" inputMode="decimal" value={form.incomeValue} onChange={(e) => set("incomeValue", e.target.value)} placeholder="Ex.: 8.000" />
                            </A.FormGroup>
                        </A.FormRow>
                        <A.FormGroup>
                            <label htmlFor="pa-email">E-mail do titular</label>
                            <A.TextInput id="pa-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                        </A.FormGroup>
                        <A.FieldHint>O Asaas manda para este e-mail o acesso à conta e o pedido de documentos.</A.FieldHint>
                    </A.FormSection>

                    <A.FormSection>
                        <legend>Endereço do titular</legend>
                        <A.FormRow $cols="1fr 2fr 1fr">
                            <A.FormGroup>
                                <label htmlFor="pa-cep">CEP</label>
                                <A.TextInput id="pa-cep" inputMode="numeric" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} autoComplete="postal-code" />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pa-address">Rua</label>
                                <A.TextInput id="pa-address" value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="address-line1" />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pa-number">Número</label>
                                <A.TextInput id="pa-number" value={form.addressNumber} onChange={(e) => set("addressNumber", e.target.value)} />
                            </A.FormGroup>
                        </A.FormRow>
                        <A.FormRow $cols="1fr 1fr">
                            <A.FormGroup>
                                <label htmlFor="pa-province">Bairro</label>
                                <A.TextInput id="pa-province" value={form.province} onChange={(e) => set("province", e.target.value)} />
                            </A.FormGroup>
                            <A.FormGroup>
                                <label htmlFor="pa-complement">Complemento (opcional)</label>
                                <A.TextInput id="pa-complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} />
                            </A.FormGroup>
                        </A.FormRow>
                    </A.FormSection>

                    <A.ModalActions>
                        <A.PrimaryButton type="submit" disabled={busy !== null} aria-busy={busy === "create"}>
                            {busy === "create" ? "Criando no Asaas..." : "Criar conta no Asaas"}
                        </A.PrimaryButton>
                    </A.ModalActions>
                </A.Form>
            )}
        </div>
    );
}
