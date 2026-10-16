/**
 * Gera o PDF do contrato no navegador e baixa. Carregado sob demanda (`import()`), para o
 * `@react-pdf/renderer` e as fontes não entrarem no bundle principal.
 */
import { createElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

import type { ContractDocument } from "../../types";
import { ContractPdf } from "./ContractPdf";

/** "contrato-salao-lagoa-14-11-2026.pdf" */
export function contractFileName(contract: ContractDocument): string {
    const slug = contract.landlord.tradeName.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `contrato-${slug}-${contract.event.date.replaceAll("/", "-")}.pdf`;
}

export async function downloadContract(contract: ContractDocument): Promise<void> {
    const element = createElement(ContractPdf, { contract }) as unknown as ReactElement<DocumentProps>;
    const blob = await pdf(element).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = contractFileName(contract);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
