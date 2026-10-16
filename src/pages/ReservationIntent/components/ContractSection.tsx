import { useState } from "react";
import { toast } from "react-toastify";

import { previewContract } from "../../../services/contract";
import type { QuotePayload } from "../../../types";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import * as S from "../styles";

interface ContractSectionProps {
    /** Mesmo corpo do orçamento; nulo enquanto faltam data, pacote, horário ou convidados. */
    payload: QuotePayload | null;
    acceptedContract: boolean;
    onAcceptedChange: (value: boolean) => void;
}

/**
 * Download e aceite do contrato da reserva. O contrato é montado pela API com as regras e os
 * dados do salão; o PDF é gerado no navegador, carregado só quando a pessoa pede.
 */
export function ContractSection({ payload, acceptedContract, onAcceptedChange }: ContractSectionProps) {
    const [generating, setGenerating] = useState(false);

    async function handleDownload() {
        if (!payload) return;
        try {
            setGenerating(true);
            const [contract, { downloadContract }] = await Promise.all([
                previewContract(payload),
                import("../../../components/Contract/download"),
            ]);
            await downloadContract(contract);
        } catch (error) {
            toast.error(getErrorMessage(error, "Não foi possível gerar o contrato. Confira a data, o horário e o pacote."));
        } finally {
            setGenerating(false);
        }
    }

    return (
        <S.ContractCard>
            <S.ContractTitle>Contrato da reserva</S.ContractTitle>
            <S.ContractDescription>
                O contrato traz as regras do salão, o pacote, os valores e a política de cancelamento desta reserva. Baixe e leia antes de confirmar.
            </S.ContractDescription>

            {payload ? (
                <S.ContractDownloadWrapper>
                    <button type="button" onClick={handleDownload} disabled={generating} aria-busy={generating}>
                        {generating ? "Gerando contrato..." : "Baixar contrato em PDF"}
                    </button>
                </S.ContractDownloadWrapper>
            ) : (
                <S.ContractDescription style={{ fontStyle: "italic" }}>
                    Escolha a data, o pacote, o horário e os convidados para gerar o contrato.
                </S.ContractDescription>
            )}

            <S.ContractCheckboxWrapper>
                <input
                    type="checkbox"
                    id="acceptedContract"
                    checked={acceptedContract}
                    onChange={(e) => onAcceptedChange(e.target.checked)}
                />
                <label htmlFor="acceptedContract">
                    Li e estou de acordo com os termos do contrato.
                </label>
            </S.ContractCheckboxWrapper>
        </S.ContractCard>
    );
}
