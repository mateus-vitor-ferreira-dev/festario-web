import { useState } from "react";
import { toast } from "react-toastify";

import DatePickerInput from "../../components/DatePickerInput";
import { addBusyDates, removeBusyDate } from "../../services/provider";
import type { MyProvider } from "../../types";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatEventDate } from "../../utils/providerFormat";
import * as A from "../Admin/styles";
import * as S from "./styles";

interface AgendaTabProps {
    provider: MyProvider;
    onChange: (p: MyProvider) => void;
}

const localToday = () => new Date().toLocaleDateString("en-CA");

/** Todos os dias de `from` a `to`, inclusive (datas `YYYY-MM-DD`). */
function daysBetween(from: string, to: string): string[] {
    const out: string[] = [];
    const d = new Date(`${from}T12:00:00`);
    const end = new Date(`${(to || from)}T12:00:00`);
    while (d <= end && out.length < 366) {
        out.push(d.toLocaleDateString("en-CA"));
        d.setDate(d.getDate() + 1);
    }
    return out;
}

/** Dias em que não atende: some da vitrine filtrada por essas datas e o pedido de orçamento não aceita. */
export default function AgendaTab({ provider, onChange }: AgendaTabProps) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);

    async function add(e: React.FormEvent) {
        e.preventDefault();
        if (!from) return toast.error("Escolha a data.");
        if (to && to < from) return toast.error("A data final vem depois da inicial.");
        try {
            setBusy(true);
            const dates = daysBetween(from, to);
            onChange(await addBusyDates(dates, note.trim() || null));
            toast.success(dates.length === 1 ? "Data marcada como ocupada." : `${dates.length} dias marcados como ocupados.`);
            setFrom(""); setTo(""); setNote("");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível marcar a data."));
        } finally {
            setBusy(false);
        }
    }

    async function remove(id: string) {
        try {
            setBusy(true);
            onChange(await removeBusyDate(id));
            toast.success("Data liberada.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível liberar a data."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <A.Section aria-labelledby="agenda-title">
            <A.SectionTitle id="agenda-title">Agenda</A.SectionTitle>
            <A.FieldHint>
                Marque os dias em que você não atende (outra festa, férias). Quem busca serviço para esses dias não vê você, e o pedido de
                orçamento não aceita a data.
            </A.FieldHint>

            <S.PackageFormBox as="form" onSubmit={add} noValidate aria-label="Marcar dias ocupados">
                <A.FormRow $cols="1fr 1fr 2fr">
                    <DatePickerInput label="De" value={from} minDate={localToday()} onChange={(e) => setFrom(e.target.value)} />
                    <DatePickerInput label="Até (opcional)" value={to} minDate={from || localToday()} onChange={(e) => setTo(e.target.value)} />
                    <A.FormGroup>
                        <label htmlFor="busy-note">Observação (só você vê)</label>
                        <A.TextInput id="busy-note" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Casamento da Júlia" />
                    </A.FormGroup>
                </A.FormRow>
                <div><A.PrimaryButton type="submit" disabled={busy}>Marcar como ocupado</A.PrimaryButton></div>
            </S.PackageFormBox>

            {provider.busyDates.length === 0 ? (
                <A.EmptyState>Nenhum dia ocupado daqui para frente.</A.EmptyState>
            ) : (
                <S.BusyList>
                    {provider.busyDates.map((b) => (
                        <li key={b.id}>
                            <div>
                                <strong>{formatEventDate(b.date)}</strong>
                                {b.note && <span>{b.note}</span>}
                            </div>
                            <A.SecondaryButton type="button" $size="sm" onClick={() => remove(b.id)} disabled={busy} aria-label={`Liberar ${formatEventDate(b.date)}`}>
                                Liberar
                            </A.SecondaryButton>
                        </li>
                    ))}
                </S.BusyList>
            )}
        </A.Section>
    );
}
