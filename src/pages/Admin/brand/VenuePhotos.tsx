import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { deleteVenuePhoto, listVenuePhotos, reorderVenuePhotos, updateVenuePhoto, uploadVenuePhoto } from "../../../services/media";
import { listVenues } from "../../../services/venue";
import type { Venue, VenuePhoto } from "../../../types";
import { isAbortError } from "../../../utils/errors";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { pickVariant, srcSet } from "../../../utils/images";
import * as A from "../styles";
import * as S from "./styles";

const ACCEPT_PHOTO = "image/jpeg,image/png,image/webp";
const MIN_ALT = 3;

/** Move o item `from` para a posição `to`. */
function moved<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

/**
 * Fotos de cada espaço no painel: uma folha de contato na ordem em que o cliente vê. Arrastar reordena
 * (com o mouse); os botões subir/descer fazem o mesmo pelo teclado e no celular. A capa é a foto do card.
 */
export function VenuePhotos() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [venueId, setVenueId] = useState("");
    const [photos, setPhotos] = useState<VenuePhoto[] | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        listVenues(controller.signal)
            .then((v) => { setVenues(v); setVenueId((cur) => cur || v[0]?.id || ""); })
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar os espaços.")); });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!venueId) return;
        const controller = new AbortController();
        setPhotos(null);
        listVenuePhotos(venueId, controller.signal)
            .then(setPhotos)
            .catch((err) => { if (!isAbortError(err)) toast.error(getErrorMessage(err, "Não foi possível carregar as fotos.")); });
        return () => controller.abort();
    }, [venueId]);

    const venue = venues.find((v) => v.id === venueId);

    async function run(id: string, action: () => Promise<VenuePhoto[]>, done: string) {
        try {
            setBusyId(id);
            setPhotos(await action());
            toast.success(done);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
            // a tela pode ter mudado antes da resposta (reordenar): volta ao que está salvo
            listVenuePhotos(venueId).then(setPhotos).catch(() => undefined);
        } finally {
            setBusyId(null);
        }
    }

    function reorder(from: number, to: number) {
        if (!photos || from === to || to < 0 || to >= photos.length) return;
        const next = moved(photos, from, to);
        setPhotos(next); // aparece já; se a API recusar, `run` recarrega a ordem salva
        run(next[to].id, () => reorderVenuePhotos(venueId, next.map((p) => p.id)), "Ordem atualizada.");
    }

    if (venues.length === 0) {
        return (
            <S.Block aria-labelledby="brand-photos">
                <h3 id="brand-photos">Fotos dos espaços</h3>
                <S.Lead>Cadastre um espaço na aba Espaços para enviar fotos dele.</S.Lead>
            </S.Block>
        );
    }

    return (
        <S.Block aria-labelledby="brand-photos">
            <h3 id="brand-photos">Fotos dos espaços</h3>
            <S.Lead>
                A capa aparece no card do espaço; as outras, na página de reserva, nesta ordem. Descreva cada foto: o texto
                alternativo é lido para quem usa leitor de tela e aparece se a imagem não carregar.
            </S.Lead>
            {venues.length > 1 && (
                <A.FormGroup style={{ maxWidth: 360 }}>
                    <label htmlFor="photos-venue">Espaço</label>
                    <A.Select id="photos-venue" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                        {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </A.Select>
                </A.FormGroup>
            )}

            {photos === null ? (
                <A.LoadingSpinner aria-label="Carregando as fotos" />
            ) : (
                <>
                    {photos.length === 0 ? (
                        <S.Lead>{venue?.name} ainda não tem fotos. Comece pela que melhor mostra o espaço: ela vira a capa.</S.Lead>
                    ) : (
                        <S.Sheet aria-label={`Fotos de ${venue?.name ?? "espaço"}, na ordem em que o cliente vê`}>
                            {photos.map((p, i) => (
                                <PhotoTile
                                    // a descrição salva volta para o campo: a chave muda junto
                                    key={`${p.id}:${p.alt}`}
                                    photo={p}
                                    index={i}
                                    total={photos.length}
                                    busy={busyId !== null}
                                    dragging={dragIndex === i}
                                    over={overIndex === i && dragIndex !== null && dragIndex !== i}
                                    onDragStart={() => setDragIndex(i)}
                                    onDragEnter={() => setOverIndex(i)}
                                    onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                                    onDrop={() => { if (dragIndex !== null) reorder(dragIndex, i); setDragIndex(null); setOverIndex(null); }}
                                    onMove={(delta) => reorder(i, i + delta)}
                                    onCover={() => run(p.id, () => updateVenuePhoto(venueId, p.id, { isCover: true }), "Capa definida.")}
                                    onAlt={(alt) => run(p.id, () => updateVenuePhoto(venueId, p.id, { alt }), "Descrição salva.")}
                                    onDelete={() => {
                                        if (!window.confirm(`Excluir a foto "${p.alt}"? Ela sai do card e da página de reserva.`)) return;
                                        run(p.id, () => deleteVenuePhoto(venueId, p.id), "Foto excluída.");
                                    }}
                                />
                            ))}
                        </S.Sheet>
                    )}
                    <PhotoUploader venueName={venue?.name ?? "espaço"} onUploaded={setPhotos} venueId={venueId} isFirst={photos.length === 0} />
                </>
            )}
        </S.Block>
    );
}

interface TileProps {
    photo: VenuePhoto;
    index: number;
    total: number;
    busy: boolean;
    dragging: boolean;
    over: boolean;
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    onDrop: () => void;
    onMove: (delta: -1 | 1) => void;
    onCover: () => void;
    onAlt: (alt: string) => void;
    onDelete: () => void;
}

function PhotoTile({ photo, index, total, busy, dragging, over, onDragStart, onDragEnter, onDragEnd, onDrop, onMove, onCover, onAlt, onDelete }: TileProps) {
    const [alt, setAlt] = useState(photo.alt);
    const small = pickVariant(photo.variants, 480);
    const altChanged = alt.trim() !== photo.alt && alt.trim().length >= MIN_ALT;
    const altId = `alt-${photo.id}`;

    return (
        <S.Tile
            $dragging={dragging}
            $over={over}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={onDragEnter}
            onDrop={(e) => { e.preventDefault(); onDrop(); }}
        >
            <S.TileImage draggable={!busy} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }} onDragEnd={onDragEnd} title="Arraste para mudar a ordem">
                <img src={small?.url} srcSet={srcSet(photo.variants)} sizes="240px" width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" draggable={false} />
                {photo.isCover && <S.CoverFlag>Capa</S.CoverFlag>}
                <S.Position aria-hidden="true">{index + 1}/{total}</S.Position>
            </S.TileImage>
            <S.TileBody>
                <A.FormGroup>
                    <label htmlFor={altId}>Descrição da foto</label>
                    <A.TextInput
                        id={altId}
                        value={alt}
                        maxLength={160}
                        onChange={(e) => setAlt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && altChanged) { e.preventDefault(); onAlt(alt.trim()); } }}
                    />
                </A.FormGroup>
                <S.TileActions>
                    {altChanged && <A.PrimaryButton type="button" $size="sm" onClick={() => onAlt(alt.trim())} disabled={busy}>Salvar descrição</A.PrimaryButton>}
                    <A.SecondaryButton type="button" $size="sm" onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label={`Mover "${photo.alt}" para antes`} title="Mover para antes">↑</A.SecondaryButton>
                    <A.SecondaryButton type="button" $size="sm" onClick={() => onMove(1)} disabled={busy || index === total - 1} aria-label={`Mover "${photo.alt}" para depois`} title="Mover para depois">↓</A.SecondaryButton>
                    {!photo.isCover && <A.SecondaryButton type="button" $size="sm" onClick={onCover} disabled={busy} aria-label={`Usar "${photo.alt}" como capa`}>Usar como capa</A.SecondaryButton>}
                    <A.DangerButton type="button" $size="sm" onClick={onDelete} disabled={busy} aria-label={`Excluir "${photo.alt}"`}>Excluir</A.DangerButton>
                </S.TileActions>
            </S.TileBody>
        </S.Tile>
    );
}

function PhotoUploader({ venueId, venueName, isFirst, onUploaded }: { venueId: string; venueName: string; isFirst: boolean; onUploaded: (p: VenuePhoto[]) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [alt, setAlt] = useState("");
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const altRef = useRef<HTMLInputElement | null>(null);
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    function choose(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        e.target.value = "";
        setError(null);
        setFile(f);
        if (f) setTimeout(() => altRef.current?.focus(), 0);
    }

    async function send(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;
        if (alt.trim().length < MIN_ALT) { setError("Descreva a foto (o que aparece nela) antes de enviar."); altRef.current?.focus(); return; }
        try {
            setProgress(0);
            setError(null);
            onUploaded(await uploadVenuePhoto(venueId, file, alt.trim(), setProgress));
            toast.success(isFirst ? "Foto enviada. Ela é a capa do espaço." : "Foto enviada.");
            setFile(null);
            setAlt("");
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível enviar a foto."));
        } finally {
            setProgress(null);
        }
    }

    const sending = progress !== null;
    return (
        <S.Uploader $withPreview={Boolean(preview)} onSubmit={send} noValidate aria-label={`Enviar foto de ${venueName}`}>
            {preview && (
                <S.PendingPreview>
                    <img src={preview} alt="" />
                </S.PendingPreview>
            )}
            <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                {error && <A.ModalNote role="alert" style={{ color: "var(--status-error-text)" }}>{error}</A.ModalNote>}
                <S.Row>
                    <S.FileLabel $disabled={sending}>
                        {file ? "Escolher outra" : "Escolher foto"}
                        <input type="file" accept={ACCEPT_PHOTO} onChange={choose} disabled={sending} />
                    </S.FileLabel>
                    <A.FieldHint>{file ? file.name : "JPEG, PNG ou WebP, até 8 MB e com pelo menos 480 px no lado menor."}</A.FieldHint>
                </S.Row>
                {file && (
                    <>
                        <A.FormGroup>
                            <label htmlFor="new-photo-alt">Descrição da foto (obrigatória)</label>
                            <A.TextInput id="new-photo-alt" ref={altRef} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={160} placeholder="Ex.: Salão com mesas montadas para aniversário" />
                        </A.FormGroup>
                        {sending && <S.Progress value={progress ?? 0} max={1} aria-label="Enviando a foto" />}
                        <S.Row>
                            <A.PrimaryButton type="submit" disabled={sending} aria-busy={sending}>{sending ? "Enviando..." : "Enviar foto"}</A.PrimaryButton>
                            <A.SecondaryButton type="button" onClick={() => { setFile(null); setAlt(""); setError(null); }} disabled={sending}>Cancelar</A.SecondaryButton>
                        </S.Row>
                    </>
                )}
            </div>
        </S.Uploader>
    );
}
