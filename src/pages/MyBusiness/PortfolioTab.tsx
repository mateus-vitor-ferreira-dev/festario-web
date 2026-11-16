import { useState } from "react";
import { toast } from "react-toastify";

import { deletePortfolioPhoto, getMyProvider, reorderPortfolio, updatePortfolioPhoto, uploadPortfolioPhoto } from "../../services/provider";
import type { MyProvider, ProviderPhoto } from "../../types";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { moved } from "../../utils/arrayMove";
import { PhotoTile, PhotoUploader } from "../Admin/brand/VenuePhotos";
import * as B from "../Admin/brand/styles";

interface PortfolioTabProps {
    provider: MyProvider;
    onChange: (p: MyProvider) => void;
}

/** Fotos do trabalho, na ordem em que o cliente vê. A capa aparece no card da vitrine. */
export default function PortfolioTab({ provider, onChange }: PortfolioTabProps) {
    const photos = provider.photos;
    const [busyId, setBusyId] = useState<string | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const setPhotos = (next: ProviderPhoto[]) => onChange({ ...provider, photos: next, missingToPublish: next.length ? provider.missingToPublish.filter((m) => m !== "PHOTO") : provider.missingToPublish });

    async function run(id: string, action: () => Promise<ProviderPhoto[]>, done: string) {
        try {
            setBusyId(id);
            setPhotos(await action());
            toast.success(done);
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível concluir."));
            getMyProvider().then((p) => p && onChange(p)).catch(() => undefined);
        } finally {
            setBusyId(null);
        }
    }

    function reorder(from: number, to: number) {
        if (from === to || to < 0 || to >= photos.length) return;
        const next = moved(photos, from, to);
        setPhotos(next);
        run(next[to].id, () => reorderPortfolio(next.map((p) => p.id)), "Ordem atualizada.");
    }

    return (
        <B.Block aria-labelledby="portfolio-title">
            <h3 id="portfolio-title">Portfólio</h3>
            <B.Lead>
                Mostre festas que você já fez. A primeira foto é a capa do seu card na vitrine. Descreva cada uma: a descrição é lida para quem
                usa leitor de tela.
            </B.Lead>
            {photos.length === 0 ? (
                <B.Lead>Comece pela foto que melhor mostra o seu trabalho.</B.Lead>
            ) : (
                <B.Sheet aria-label="Fotos do portfólio, na ordem em que o cliente vê">
                    {photos.map((p, i) => (
                        <PhotoTile
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
                            onCover={() => run(p.id, () => updatePortfolioPhoto(p.id, { isCover: true }), "Capa definida.")}
                            onAlt={(alt) => run(p.id, () => updatePortfolioPhoto(p.id, { alt }), "Descrição salva.")}
                            onDelete={() => {
                                if (!window.confirm(`Excluir a foto "${p.alt}"?`)) return;
                                run(p.id, () => deletePortfolioPhoto(p.id), "Foto excluída.");
                            }}
                        />
                    ))}
                </B.Sheet>
            )}
            <PhotoUploader
                subject={provider.name}
                isFirst={photos.length === 0}
                upload={uploadPortfolioPhoto}
                onUploaded={setPhotos}
                firstDoneMessage="Foto enviada. Ela é a capa do seu card."
                altPlaceholder="Ex.: Mesa de doces com tema jardim para 15 anos"
            />
        </B.Block>
    );
}
