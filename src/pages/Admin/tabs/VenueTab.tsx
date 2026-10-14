import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listVenues, updateVenue } from "../../../services/venue";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { Venue } from "../../../types";
import { ModalHeader } from "../ModalHeader";
import * as S from "../styles";

interface VenueForm {
    name: string;
    description: string;
    capacity: number | string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    hasKidsArea: boolean;
    kidsAreaPricePerHour: number | string;
    hasPool: boolean;
    poolPricePerDay: number | string;
}

const EMPTY_FORM: VenueForm = {
    name: "",
    description: "",
    capacity: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    hasKidsArea: false,
    kidsAreaPricePerHour: "",
    hasPool: false,
    poolPricePerDay: "",
};

interface AddressParts {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

function parseLocation(location: string | null | undefined): AddressParts {
    if (!location) return { rua: "", numero: "", bairro: "", cidade: "", estado: "", cep: "" };
    try {
        const cepMatch = location.match(/(\d{5}-\d{3})\s*$/);
        const cep = cepMatch ? cepMatch[1] : "";
        const withoutCep = cep
            ? location.slice(0, location.lastIndexOf(cep)).replace(/,\s*$/, "").trim()
            : location;
        const parts = withoutCep.split(",").map((s) => s.trim());
        let rua = "", numero = "", bairro = "", cidade = "", estado = "";
        if (parts[0]) rua = parts[0].trim();
        if (parts[1]) {
            const numBairro = parts[1].split(" - ");
            if (numBairro.length >= 2) {
                numero = numBairro[0].trim();
                bairro = numBairro.slice(1).join(" - ").trim();
            } else {
                const val = parts[1].trim();
                if (/^\d+/.test(val)) numero = val;
                else bairro = val;
            }
        }
        if (parts[2]) {
            const cidadeEstado = parts[2].split(" - ");
            cidade = cidadeEstado[0]?.trim() || "";
            estado = cidadeEstado[1]?.trim() || "";
        }
        return { rua, numero, bairro, cidade, estado, cep };
    } catch {
        return { rua: location, numero: "", bairro: "", cidade: "", estado: "", cep: "" };
    }
}

function buildLocation({ rua, numero, bairro, cidade, estado, cep }: AddressParts): string {
    const parts: string[] = [];
    const ruaNumero = [rua, numero].filter(Boolean).join(", ");
    if (ruaNumero || bairro) {
        parts.push(bairro ? `${ruaNumero} - ${bairro}` : ruaNumero);
    }
    const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");
    if (cidadeEstado) parts.push(cidadeEstado);
    if (cep) parts.push(cep);
    return parts.join(", ");
}

function venueToForm(v: Venue): VenueForm {
    const addr = parseLocation(v.location);
    return {
        name: v.name ?? "",
        description: v.description ?? "",
        capacity: v.capacity ?? "",
        ...addr,
        hasKidsArea: v.hasKidsArea ?? false,
        kidsAreaPricePerHour: v.kidsAreaPricePerHour ?? "",
        hasPool: v.hasPool ?? false,
        poolPricePerDay: v.poolPricePerDay ?? "",
    };
}

export function VenueTab() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<VenueForm>(EMPTY_FORM);

    async function load() {
        try {
            setIsLoading(true);
            const data = await listVenues();
            setVenues(data ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao carregar espaços."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function openEdit(venue: Venue) {
        setEditingVenue(venue);
        setForm(venueToForm(venue));
        setShowModal(true);
    }

    function field(key: keyof VenueForm) {
        return {
            value: form[key] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
        };
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingVenue) return;
        try {
            setIsSaving(true);
            const location = buildLocation(form) || null;
            const payload = {
                name: form.name,
                description: form.description || null,
                capacity: Number(form.capacity),
                location,
                hasKidsArea: form.hasKidsArea,
                kidsAreaPricePerHour:
                    form.hasKidsArea && form.kidsAreaPricePerHour !== ""
                        ? Number(form.kidsAreaPricePerHour)
                        : null,
                hasPool: form.hasPool,
                poolPricePerDay:
                    form.hasPool && form.poolPricePerDay !== ""
                        ? Number(form.poolPricePerDay)
                        : null,
            };
            await updateVenue(editingVenue.id, payload as Partial<Venue>);
            toast.success("Espaço atualizado com sucesso.");
            setShowModal(false);
            load();
        } catch (error) {
            toast.error(getErrorMessage(error, "Erro ao salvar espaço."));
        } finally {
            setIsSaving(false);
        }
    }

    const locationPreview = buildLocation(form);

    return (
        <S.Section>
            <S.SectionHeader>
                <S.SectionTitle>Espaços</S.SectionTitle>
            </S.SectionHeader>

            {isLoading ? (
                <S.LoadingSpinner />
            ) : venues.length === 0 ? (
                <S.EmptyState>
                    <h3>Nenhum espaço cadastrado</h3>
                </S.EmptyState>
            ) : (
                <S.TableWrapper>
                    <S.Table>
                        <thead>
                            <tr>
                                <S.Th>Nome</S.Th>
                                <S.Th $num>Capacidade</S.Th>
                                <S.Th>Localização</S.Th>
                                <S.Th>Área kids</S.Th>
                                <S.Th>Piscina</S.Th>
                                <S.Th></S.Th>
                            </tr>
                        </thead>
                        <tbody>
                            {venues.map((v) => (
                                <S.Tr key={v.id}>
                                    <S.Td>
                                        <strong>{v.name}</strong>
                                    </S.Td>
                                    <S.Td $num>{v.capacity} pessoas</S.Td>
                                    <S.Td>{v.location || "—"}</S.Td>
                                    <S.Td>{v.hasKidsArea ? "Sim" : "Não"}</S.Td>
                                    <S.Td>{v.hasPool ? "Sim" : "Não"}</S.Td>
                                    <S.Td>
                                        <S.SecondaryButton
                                            $size="sm"
                                            onClick={() => openEdit(v)}
                                        >
                                            Editar
                                        </S.SecondaryButton>
                                    </S.Td>
                                </S.Tr>
                            ))}
                        </tbody>
                    </S.Table>
                </S.TableWrapper>
            )}

            {showModal && (
                <S.ModalOverlay onClick={() => setShowModal(false)}>
                    <S.ModalBox
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        $maxWidth={540}
                    >
                        <ModalHeader onClose={() => setShowModal(false)} disabled={isSaving}>Editar espaço</ModalHeader>
                        <S.Form onSubmit={handleSubmit}>
                            <S.FormGroup>
                                <label>Nome</label>
                                <S.TextInput required {...field("name")} placeholder="Nome do espaço" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Descrição</label>
                                <S.TextInput {...field("description")} placeholder="Descrição (opcional)" />
                            </S.FormGroup>
                            <S.FormGroup>
                                <label>Capacidade (pessoas)</label>
                                <S.TextInput
                                    required
                                    type="number"
                                    min="1"
                                    {...field("capacity")}
                                    placeholder="Ex: 100"
                                />
                            </S.FormGroup>

                            <S.FormSection>
                                <legend>Endereço</legend>
                                <S.FormGroup>
                                    <label>Rua</label>
                                    <S.TextInput {...field("rua")} placeholder="Ex: Rua Bernadino Antônio Tomás" />
                                </S.FormGroup>
                                <S.FormRow>
                                    <S.FormGroup>
                                        <label>Número</label>
                                        <S.TextInput {...field("numero")} inputMode="numeric" placeholder="Ex: 21" />
                                    </S.FormGroup>
                                    <S.FormGroup>
                                        <label>CEP</label>
                                        <S.TextInput {...field("cep")} inputMode="numeric" placeholder="Ex: 37203-775" />
                                    </S.FormGroup>
                                </S.FormRow>
                                <S.FormGroup>
                                    <label>Bairro</label>
                                    <S.TextInput {...field("bairro")} placeholder="Ex: Jardim Vila Rica" />
                                </S.FormGroup>
                                <S.FormRow $cols="2fr 1fr">
                                    <S.FormGroup>
                                        <label>Cidade</label>
                                        <S.TextInput {...field("cidade")} placeholder="Ex: Lavras" />
                                    </S.FormGroup>
                                    <S.FormGroup>
                                        <label>Estado (UF)</label>
                                        <S.TextInput {...field("estado")} placeholder="Ex: MG" maxLength={2} />
                                    </S.FormGroup>
                                </S.FormRow>
                                {locationPreview && (
                                    <S.FieldHint>
                                        Endereço gerado: <strong>{locationPreview}</strong>
                                    </S.FieldHint>
                                )}
                            </S.FormSection>

                            <S.FormSection>
                                <legend>Comodidades</legend>
                                <S.CheckboxLabel>
                                    <input
                                        type="checkbox"
                                        checked={form.hasKidsArea}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setForm((f) => ({ ...f, hasKidsArea: e.target.checked }))
                                        }
                                    />
                                    Possui área kids
                                </S.CheckboxLabel>
                                {form.hasKidsArea && (
                                    <S.FormGroup>
                                        <label>Preço da área kids (R$/hora)</label>
                                        <S.TextInput
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field("kidsAreaPricePerHour")}
                                            placeholder="Ex: 30"
                                        />
                                    </S.FormGroup>
                                )}
                                <S.CheckboxLabel>
                                    <input
                                        type="checkbox"
                                        checked={form.hasPool}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setForm((f) => ({ ...f, hasPool: e.target.checked }))
                                        }
                                    />
                                    Possui piscina
                                </S.CheckboxLabel>
                                {form.hasPool && (
                                    <S.FormGroup>
                                        <label>Preço da piscina (R$/dia)</label>
                                        <S.TextInput
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field("poolPricePerDay")}
                                            placeholder="Ex: 0"
                                        />
                                    </S.FormGroup>
                                )}
                            </S.FormSection>

                            <S.ModalActions>
                                <S.SecondaryButton
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </S.SecondaryButton>
                                <S.PrimaryButton type="submit" disabled={isSaving}>
                                    {isSaving ? "Salvando..." : "Salvar alterações"}
                                </S.PrimaryButton>
                            </S.ModalActions>
                        </S.Form>
                    </S.ModalBox>
                </S.ModalOverlay>
            )}
        </S.Section>
    );
}
