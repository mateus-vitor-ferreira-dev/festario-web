import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ContratoRVR, type ContratoRVRProps } from "./index";

/**
 * Link de download do contrato PDF do Recanto Vila Rica.
 *
 * Isolado em arquivo separado para que `@react-pdf/renderer` seja carregado em
 * chunk lazy, evitando incluir a biblioteca no bundle principal.
 */
interface ContratoDownloadLinkProps {
    contratoProps: ContratoRVRProps;
    fileName: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function ContratoDownloadLink({ contratoProps, fileName, className, style }: ContratoDownloadLinkProps) {
    return (
        <PDFDownloadLink
            document={<ContratoRVR {...contratoProps} />}
            fileName={fileName}
            className={className}
            style={style}
        >
            {({ loading }) => (loading ? "Gerando contrato..." : "Baixar contrato em PDF")}
        </PDFDownloadLink>
    );
}
