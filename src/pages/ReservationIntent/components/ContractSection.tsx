import { lazy, Suspense } from "react";
import ErrorBoundary from "../../../components/ErrorBoundary";
import * as S from "../styles";

const ContratoDownloadLink = lazy(() => import("../../../components/ContratoRVR/DownloadLink"));

interface ContractSectionProps {
    planCode: string;
    eventDate: string;
    contratoProps: Record<string, unknown>;
    acceptedContract: boolean;
    onAcceptedChange: (value: boolean) => void;
}

/**
 * Card de download e aceite do contrato da reserva.
 */
export function ContractSection({ planCode, eventDate, contratoProps, acceptedContract, onAcceptedChange }: ContractSectionProps) {
    return (
        <S.ContractCard>
            <S.ContractTitle>Contrato da reserva</S.ContractTitle>
            <S.ContractDescription>
                O contrato é gerado automaticamente com base no plano e data escolhidos. Baixe e leia antes de confirmar.
            </S.ContractDescription>

            {planCode ? (
                <S.ContractDownloadWrapper>
                    <ErrorBoundary fallback={<span>Erro ao gerar contrato. Tente novamente.</span>}>
                        <Suspense fallback={<span>Carregando...</span>}>
                            <ContratoDownloadLink
                                contratoProps={contratoProps}
                                fileName={`contrato-recanto-vila-rica-${eventDate || "reserva"}.pdf`}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </S.ContractDownloadWrapper>
            ) : (
                <S.ContractDescription style={{ fontStyle: "italic" }}>
                    Selecione um plano para gerar o contrato.
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
