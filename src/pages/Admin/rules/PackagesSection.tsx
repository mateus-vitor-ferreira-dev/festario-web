import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createPackage, deletePackage, listItems, listPackages, updatePackage } from "../../../services/salonRules";
import { listVenues } from "../../../services/venue";
import type { SalonItem, SalonPackage, SalonPackageInput, Venue } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as A from "../styles";
import { describeDays, describeWindow, formatBRL, formatHours } from "./format";
import { PackageEditor } from "./PackageEditor";
import * as S from "./styles";
import { TimeWindow, WeekStrip } from "./Visuals";

/** Pacote → corpo de criação (para duplicar). */
function asInput(p: SalonPackage, overrides: Partial<SalonPackageInput>): SalonPackageInput {
    return {
        name: p.name, description: p.description, basePriceAmount: Number(p.basePriceAmount), venueId: p.venueId,
        validWeekdays: p.validWeekdays, validOnHolidays: p.validOnHolidays,
        earliestStartMinute: p.earliestStartMinute, latestEndMinute: p.latestEndMinute,
        minDurationMinutes: p.minDurationMinutes, maxDurationMinutes: p.maxDurationMinutes,
        minGuests: p.minGuests, maxGuests: p.maxGuests, keyDeliveryOffsetHours: p.keyDeliveryOffsetHours, isActive: p.isActive,
        items: p.items.map((pi) => ({ itemId: pi.item.id, mode: pi.mode, includedQuantity: pi.includedQuantity })),
        ...overrides,
    };
}

/**
 * Pacotes do salão (#42–#44): lista na ordem em que o cliente vê, com a semana e o horário de cada um,
 * e o editor. Salão sem pacote vê o passo a passo de primeiro acesso.
 */
export function PackagesSection({ onGoTo }: { onGoTo: (section: string) => void }) {
    const [packages, setPackages] = useState<SalonPackage[]>([]);
    const [items, setItems] = useState<SalonItem[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<SalonPackage | "new" | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const [p, i, v] = await Promise.all([listPackages(signal), listItems(signal), listVenues(signal)]);
            if (signal?.aborted) return;
            setPackages([...p].sort((a, b) => a.sortOrder - b.sortOrder));
            setItems(i);
            setVenues(v ?? []);
        } catch (error) {
            if (!isAbortError(error)) toast.error(getErrorMessage(error, "Não foi possível carregar os pacotes."));
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function run(id: string, action: () => Promise<unknown>, done: string) {
        try {
            setBusyId(id);
            await action();
            toast.success(done);
            await load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Não foi possível concluir."));
        } finally {
            setBusyId(null);
        }
    }

    /** Troca a ordem com o vizinho (botões, não arrasto: funciona no teclado e no celular). */
    function move(index: number, delta: -1 | 1) {
        const a = packages[index];
        const b = packages[index + delta];
        if (!a || !b) return;
        const orderA = a.sortOrder === b.sortOrder ? index : a.sortOrder;
        const orderB = a.sortOrder === b.sortOrder ? index + delta : b.sortOrder;
        run(a.id, () => Promise.all([updatePackage(a.id, { sortOrder: orderB }), updatePackage(b.id, { sortOrder: orderA })]), "Ordem atualizada.");
    }

    function remove(p: SalonPackage) {
        if (!window.confirm(`Excluir o pacote "${p.name}"? Reservas já feitas continuam com a cópia do pacote. Para só tirar da vitrine, desative.`)) return;
        run(p.id, () => deletePackage(p.id), "Pacote excluído.");
    }

    const nextSortOrder = packages.reduce((max, p) => Math.max(max, p.sortOrder), 0) + 1;

    if (editing) {
        return (
            <PackageEditor
                pkg={editing === "new" ? null : editing}
                items={items}
                venues={venues}
                nextSortOrder={nextSortOrder}
                onCancel={() => setEditing(null)}
                onSaved={async () => { setEditing(null); await load(); }}
            />
        );
    }

    if (loading) return <A.LoadingSpinner aria-label="Carregando pacotes" />;

    if (packages.length === 0) {
        const hasItems = items.length > 0;
        return (
            <A.Section>
                <S.Steps aria-label="Primeiros passos">
                    <h3>Abra a agenda do salão em quatro passos</h3>
                    <S.Step $done={hasItems}>
                        <div>
                            <strong>Cadastre o que o salão oferece</strong>
                            <p>Monitor da área kids, buffet, garçom, piscina, limpeza: o que vem incluso e o que é cobrado à parte.</p>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => onGoTo("items")}>{hasItems ? "Revisar itens" : "Cadastrar itens"}</A.SecondaryButton>
                        </div>
                    </S.Step>
                    <S.Step>
                        <div>
                            <strong>Crie o primeiro pacote</strong>
                            <p>Preço, dias, horário e o que vem incluso. Sem pacote ativo, o salão não recebe reservas.</p>
                            <A.PrimaryButton type="button" $size="sm" onClick={() => setEditing("new")}>Criar pacote</A.PrimaryButton>
                        </div>
                    </S.Step>
                    <S.Step>
                        <div>
                            <strong>Defina as regras da reserva</strong>
                            <p>Prazo para pagar, antecedência e a política de cancelamento.</p>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => onGoTo("booking")}>Ajustar regras</A.SecondaryButton>
                        </div>
                    </S.Step>
                    <S.Step>
                        <div>
                            <strong>Revise o contrato</strong>
                            <p>Seus dados de locador, contato e as regras do espaço que vão no contrato.</p>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => onGoTo("contract")}>Revisar contrato</A.SecondaryButton>
                        </div>
                    </S.Step>
                </S.Steps>
            </A.Section>
        );
    }

    return (
        <A.Section>
            <A.SectionHeader>
                <S.Intro>Os pacotes aparecem para o cliente nesta ordem. Cada um vale nos dias e no horário marcados.</S.Intro>
                <A.PrimaryButton type="button" onClick={() => setEditing("new")}>Novo pacote</A.PrimaryButton>
            </A.SectionHeader>

            <S.PackageList>
                {packages.map((p, i) => {
                    const included = p.items.filter((pi) => pi.mode === "INCLUDED").map((pi) => pi.item.name);
                    const extras = p.items.filter((pi) => pi.mode === "OPTIONAL").map((pi) => pi.item.name);
                    const busy = busyId === p.id;
                    return (
                        <S.PackageCard key={p.id} $inactive={!p.isActive}>
                            <S.PackageHead>
                                <h3>{p.name}</h3>
                                <S.Price>{formatBRL(p.basePriceAmount)}</S.Price>
                                <S.Meta>{p.venue?.name ?? "Todos os espaços"}{p.maxGuests ? `, até ${p.maxGuests} convidados` : ""}</S.Meta>
                                {!p.isActive && <S.Tag>Desativado: não aparece para os clientes</S.Tag>}
                                {included.length > 0 && <S.Meta>Incluso: {included.join(", ")}</S.Meta>}
                                {extras.length > 0 && <S.Meta>Adicionais: {extras.join(", ")}</S.Meta>}
                            </S.PackageHead>
                            <S.WhenCol>
                                <WeekStrip weekdays={p.validWeekdays} holidays={p.validOnHolidays} compact />
                                <TimeWindow earliest={p.earliestStartMinute} latest={p.latestEndMinute} />
                                <A.VisuallyHidden>
                                    {describeDays(p.validWeekdays, p.validOnHolidays)}. {describeWindow(p.earliestStartMinute, p.latestEndMinute)}.
                                </A.VisuallyHidden>
                                {p.maxDurationMinutes != null && <S.Meta>Até {formatHours(p.maxDurationMinutes)} de festa</S.Meta>}
                            </S.WhenCol>
                            <S.CardActions>
                                <A.SecondaryButton type="button" $size="sm" onClick={() => setEditing(p)} disabled={busy}>Editar</A.SecondaryButton>
                                <A.SecondaryButton type="button" $size="sm" disabled={busy} onClick={() => run(p.id, () => updatePackage(p.id, { isActive: !p.isActive }), p.isActive ? "Pacote desativado." : "Pacote ativado.")}>
                                    {p.isActive ? "Desativar" : "Ativar"}
                                </A.SecondaryButton>
                                <A.SecondaryButton type="button" $size="sm" disabled={busy} onClick={() => run(p.id, () => createPackage(asInput(p, { name: `${p.name} (cópia)`, isActive: false, sortOrder: nextSortOrder })), "Cópia criada, desativada para você revisar.")}>
                                    Duplicar
                                </A.SecondaryButton>
                                <A.SecondaryButton type="button" $size="sm" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${p.name} na ordem`} title="Subir na ordem">↑</A.SecondaryButton>
                                <A.SecondaryButton type="button" $size="sm" disabled={busy || i === packages.length - 1} onClick={() => move(i, 1)} aria-label={`Descer ${p.name} na ordem`} title="Descer na ordem">↓</A.SecondaryButton>
                                <A.DangerButton type="button" $size="sm" disabled={busy} onClick={() => remove(p)}>Excluir</A.DangerButton>
                            </S.CardActions>
                        </S.PackageCard>
                    );
                })}
            </S.PackageList>
        </A.Section>
    );
}
