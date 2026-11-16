import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import VenueCover from "../../../components/VenueCover";
import { CATEGORY_LABELS } from "../../../constants/providers";
import { addPartner, listPartners, removePartner, searchPartnerCandidates, updatePartner } from "../../../services/partner";
import type { PartnerSearchResult, SalonPartner } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { formatPlace } from "../../../utils/salonFormat";
import * as M from "../../MyBusiness/styles";
import * as S from "../styles";

/**
 * Fornecedores que o salão indica: aparecem na página do salão e primeiro no "Monte a sua festa" de
 * quem reserva aqui. O orçamento que sai dessa indicação fica registrado como indicação do salão.
 *
 * @see GET /admin/partners
 */
export function PartnersTab() {
    const [partners, setPartners] = useState<SalonPartner[] | null>(null);
    const [q, setQ] = useState("");
    const [results, setResults] = useState<PartnerSearchResult[] | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        listPartners(controller.signal)
            .then(setPartners)
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar os parceiros.")); });
        return () => controller.abort();
    }, []);

    // A busca roda enquanto digita, com uma pausa curta para não disparar a cada letra.
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            searchPartnerCandidates(q.trim(), controller.signal)
                .then(setResults)
                .catch((err) => { if (!isAbortError(err)) setResults([]); });
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [q, partners]);

    async function run(action: () => Promise<SalonPartner[]>, done: string) {
        try {
            setBusy(true);
            setPartners(await action());
            toast.success(done);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <S.Section aria-labelledby="partners-title">
            <S.SectionHeader>
                <S.SectionTitle id="partners-title">Fornecedores parceiros</S.SectionTitle>
            </S.SectionHeader>
            <S.FieldHint>
                Indique o buffet, a decoração e os outros fornecedores com quem você já trabalha. Eles aparecem na página do salão e primeiro
                para quem reserva aqui, no "Monte a sua festa".
            </S.FieldHint>

            {partners === null ? (
                <S.LoadingSpinner aria-label="Carregando os parceiros" />
            ) : partners.length === 0 ? (
                <S.EmptyState>Nenhum fornecedor indicado ainda. Procure abaixo pelo nome ou pela cidade.</S.EmptyState>
            ) : (
                <M.QuoteList>
                    {partners.map((p) => <PartnerRow key={`${p.id}:${p.note ?? ""}`} partner={p} busy={busy} run={run} />)}
                </M.QuoteList>
            )}

            <S.FormSection>
                <legend>Indicar um fornecedor</legend>
                <S.FormGroup>
                    <label htmlFor="partner-search">Buscar na vitrine de serviços</label>
                    <S.SearchInput id="partner-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou cidade" />
                </S.FormGroup>
                {results !== null && (results.length === 0 ? (
                    <S.FieldHint>
                        Ninguém com esse nome na vitrine. O fornecedor cria o perfil em <strong>Meu negócio</strong>, com a conta de cliente dele, e publica.
                    </S.FieldHint>
                ) : (
                    <M.BusyList>
                        {results.map((r) => (
                            <li key={r.id}>
                                <div>
                                    <strong>{r.name}</strong>
                                    <span>{r.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}{r.city ? `, ${formatPlace(null, r.city, r.state)}` : ""}</span>
                                </div>
                                {r.isPartner ? (
                                    <S.FieldHint>Já indicado</S.FieldHint>
                                ) : (
                                    <S.PrimaryButton type="button" $size="sm" disabled={busy} onClick={() => run(() => addPartner(r.slug), `${r.name} agora é parceiro do salão.`)}>
                                        Indicar
                                    </S.PrimaryButton>
                                )}
                            </li>
                        ))}
                    </M.BusyList>
                ))}
            </S.FormSection>
        </S.Section>
    );
}

function PartnerRow({ partner: p, busy, run }: { partner: SalonPartner; busy: boolean; run: (a: () => Promise<SalonPartner[]>, done: string) => void }) {
    const [note, setNote] = useState(p.note ?? "");
    const changed = note.trim() !== (p.note ?? "");
    return (
        <M.QuoteCard $status={p.listed ? "ANSWERED" : "CANCELED"}>
            <S.InlineGroup style={{ alignItems: "center", flexWrap: "nowrap", gap: 14 }}>
                <div style={{ width: 72, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
                    <VenueCover venueName={p.provider.name} photo={p.provider.cover} sizes="72px" ratio={1} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <strong><Link to={`/servicos/${p.provider.slug}`}>{p.provider.name}</Link></strong>
                    <M.QuoteMeta>{p.provider.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}</M.QuoteMeta>
                    {!p.listed && <M.QuoteMeta>Fora da vitrine agora: não aparece na página do salão.</M.QuoteMeta>}
                </div>
            </S.InlineGroup>
            <S.FormGroup>
                <label htmlFor={`note-${p.id}`}>Recado para quem reserva (opcional)</label>
                <S.TextInput id={`note-${p.id}`} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Faz o buffet das nossas festas há 5 anos." />
            </S.FormGroup>
            <S.InlineGroup>
                {changed && <S.PrimaryButton type="button" $size="sm" disabled={busy} onClick={() => run(() => updatePartner(p.id, { note: note.trim() || null }), "Recado salvo.")}>Salvar recado</S.PrimaryButton>}
                <S.DangerButton type="button" $size="sm" disabled={busy} onClick={() => { if (window.confirm(`Deixar de indicar ${p.provider.name}?`)) run(() => removePartner(p.id), "Parceiro removido."); }}>
                    Deixar de indicar
                </S.DangerButton>
            </S.InlineGroup>
        </M.QuoteCard>
    );
}
