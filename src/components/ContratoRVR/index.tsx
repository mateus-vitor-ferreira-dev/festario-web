import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export interface ContratoRVRProps {
    locatario: string;
    data: string;
    horarioInicio: string;
    horarioFim: string;
    comKids: boolean;
    comPiscina: boolean;
    planCode: "PROMOCIONAL" | "ESSENCIAL" | "COMPLETA";
    totalCents?: number;
}

function formatCurrency(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ACCENT = "#7c3aed";
const ACCENT_LIGHT = "#f5f3ff";
const TEXT = "#111";
const MUTED = "#555";

const s = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9.5,
        paddingTop: 44,
        paddingBottom: 56,
        paddingHorizontal: 52,
        color: TEXT,
        lineHeight: 1.55,
    },

    // ── Cabeçalho ────────────────────────────────────────────────────────
    header: {
        textAlign: "center",
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: ACCENT,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 13,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: 3,
    },
    headerSub: { fontSize: 9, color: MUTED },

    // ── Partes ────────────────────────────────────────────────────────────
    partiesGrid: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16,
    },
    partyBox: {
        flex: 1,
        backgroundColor: ACCENT_LIGHT,
        borderRadius: 4,
        padding: 8,
    },
    partyRole: {
        fontSize: 7.5,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: 3,
        letterSpacing: 0.5,
    },
    partyName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
    partyDetail: { fontSize: 8.5, color: "#444" },

    // ── Seção numerada ────────────────────────────────────────────────────
    sectionTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: 6,
        marginTop: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: "#d8b4fe",
        paddingBottom: 3,
    },

    // ── Tabela de modalidades ─────────────────────────────────────────────
    table: { marginBottom: 10, borderWidth: 0.5, borderColor: "#ccc", borderRadius: 3 },
    tableHeader: { flexDirection: "row", backgroundColor: ACCENT },
    tableHeaderCell: {
        flex: 1,
        padding: "5 6",
        color: "#fff",
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
    },
    tableRow: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#ddd" },
    tableRowSelected: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#ddd", backgroundColor: ACCENT_LIGHT },
    tableCell: { flex: 1, padding: "5 6", fontSize: 8.5, color: TEXT },
    tableCellBold: { flex: 1, padding: "5 6", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: ACCENT },

    // ── Texto genérico ────────────────────────────────────────────────────
    row: { flexDirection: "row", marginBottom: 4 },
    label: { fontFamily: "Helvetica-Bold", minWidth: 110 },
    value: { flex: 1 },
    paragraph: { marginBottom: 7, textAlign: "justify" },
    bold: { fontFamily: "Helvetica-Bold" },
    bullet: { marginLeft: 14, marginBottom: 5, textAlign: "justify" },
    note: { fontSize: 8, color: MUTED, marginBottom: 4, fontStyle: "italic" },

    // ── Assinaturas ───────────────────────────────────────────────────────
    sigSection: { marginTop: 20 },
    sigDate: { marginBottom: 14, fontSize: 9 },
    sigRow: { flexDirection: "row", gap: 24, marginTop: 10 },
    sigBox: { flex: 1 },
    sigLine: { borderBottomWidth: 1, borderBottomColor: "#999", marginBottom: 4 },
    sigLabel: { fontSize: 8, color: MUTED, textAlign: "center" },

    // ── Rodapé ────────────────────────────────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 26,
        left: 52,
        right: 52,
        borderTopWidth: 0.5,
        borderTopColor: "#ddd",
        paddingTop: 6,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: { fontSize: 7.5, color: "#aaa" },
});

const PLANS = {
    PROMOCIONAL: {
        modalidade: "1 – Promocional",
        validade: "2ª a 5ª feira (não feriados)",
        tempo: "5h de festa",
        inclui: "Espaço geral; área kids c/ 4h de monitoria",
        valor: "R$ 650,00",
    },
    ESSENCIAL: {
        modalidade: "2 – Essencial",
        validade: "Sexta, sábado, domingo e feriados",
        tempo: "4h de festa",
        inclui: "Espaço geral; área kids c/ 4h de monitoria",
        valor: "R$ 850,00",
    },
    COMPLETA: {
        modalidade: "3 – Completa",
        validade: "Sexta, sábado, domingo e feriados",
        tempo: "Das 9h às 23h",
        inclui: "Espaço geral; área kids c/ 4h de monitoria; área da piscina",
        valor: "R$ 990,00",
    },
} as const satisfies Record<"PROMOCIONAL" | "ESSENCIAL" | "COMPLETA", {
    modalidade: string; validade: string; tempo: string; inclui: string; valor: string;
}>;

type PlanKey = keyof typeof PLANS;

/**
 * Contrato de locação do Recanto Vila Rica — formato amigável (Abril/2026).
 * Use `ContratoDownloadLink` para disponibilizar o download do PDF.
 */
export function ContratoRVR({ locatario, data, horarioInicio, horarioFim, planCode, totalCents }: ContratoRVRProps) {
    const total = totalCents ? formatCurrency(totalCents) : "a confirmar";
    const ano = new Date().getFullYear();

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* Cabeçalho */}
                <View style={s.header}>
                    <Text style={s.headerTitle}>Contrato de Locação de Espaço para Eventos</Text>
                    <Text style={s.headerSub}>Recanto Vila Rica – Festas e Eventos</Text>
                    <Text style={s.headerSub}>Rua Bernardino Antônio Tomaz, 21 – B. Jardim Vila Rica – Lavras/MG – CEP 37.203-775</Text>
                </View>

                {/* Partes */}
                <View style={s.partiesGrid}>
                    <View style={s.partyBox}>
                        <Text style={s.partyRole}>Locador</Text>
                        <Text style={s.partyName}>Cleide Mirian Pereira</Text>
                        <Text style={s.partyDetail}>CPF: 554.624.486-00</Text>
                        <Text style={s.partyDetail}>Recanto Vila Rica – Festas e Eventos</Text>
                    </View>
                    <View style={s.partyBox}>
                        <Text style={s.partyRole}>Locatário</Text>
                        <Text style={s.partyName}>{locatario || "—"}</Text>
                        <Text style={s.partyDetail}>CPF: _________________________</Text>
                        <Text style={s.partyDetail}>Endereço: ____________________</Text>
                    </View>
                </View>

                {/* 1. OBJETO */}
                <Text style={s.sectionTitle}>1. Objeto</Text>
                <Text style={s.paragraph}>Locação do espaço para evento.</Text>

                <View style={[s.row, { marginBottom: 10 }]}>
                    <Text style={s.label}>Data:</Text>
                    <Text style={s.value}>{data}</Text>
                    <Text style={s.label}>Início:</Text>
                    <Text style={s.value}>{horarioInicio}h</Text>
                    <Text style={s.label}>Término:</Text>
                    <Text style={s.value}>{horarioFim}h</Text>
                </View>

                <Text style={[s.paragraph, { marginBottom: 6 }]}>
                    <Text style={s.bold}>Espaços oferecidos:{"  "}</Text>
                    <Text>a) Espaço geral: salão de festas, cozinha, banheiros e quadra esportiva{"  "}</Text>
                    <Text>b) Espaço Opcional 1: área kids{"  "}</Text>
                    <Text>c) Espaço Opcional 2: área da piscina</Text>
                </Text>

                {/* Tabela de modalidades */}
                <View style={s.table}>
                    <View style={s.tableHeader}>
                        <Text style={[s.tableHeaderCell, { flex: 1.4 }]}>Modalidade</Text>
                        <Text style={[s.tableHeaderCell, { flex: 1.8 }]}>Validade</Text>
                        <Text style={[s.tableHeaderCell, { flex: 0.9 }]}>Tempo</Text>
                        <Text style={[s.tableHeaderCell, { flex: 2.2 }]}>Inclui</Text>
                        <Text style={[s.tableHeaderCell, { flex: 0.8 }]}>Valor</Text>
                    </View>
                    {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
                        const isSelected = key === planCode;
                        const row = isSelected ? s.tableRowSelected : s.tableRow;
                        const cell = isSelected ? s.tableCellBold : s.tableCell;
                        return (
                            <View key={key} style={row}>
                                <Text style={[cell, { flex: 1.4 }]}>
                                    {isSelected ? "✓ " : ""}{plan.modalidade}
                                </Text>
                                <Text style={[cell, { flex: 1.8 }]}>{plan.validade}</Text>
                                <Text style={[cell, { flex: 0.9 }]}>{plan.tempo}</Text>
                                <Text style={[cell, { flex: 2.2 }]}>{plan.inclui}</Text>
                                <Text style={[cell, { flex: 0.8 }]}>{plan.valor}</Text>
                            </View>
                        );
                    })}
                </View>

                <Text style={s.note}>* Modalidades 1 e 2: entrega das chaves 5h antes do início.  * Hora extra de monitoria: R$ 30,00/h.</Text>

                {/* 2. PAGAMENTO */}
                <Text style={s.sectionTitle}>2. Pagamento</Text>
                <Text style={s.paragraph}>Pagamento via pix, dinheiro ou cartão de crédito.</Text>
                <View style={s.row}>
                    <Text style={s.label}>Valor do aluguel:</Text>
                    <Text style={s.value}>{total}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Sinal pago:</Text>
                    <Text style={s.value}>R$ __________ via ____________ em ___/___/___</Text>
                </View>
                <View style={[s.row, { marginBottom: 8 }]}>
                    <Text style={s.label}>Restante:</Text>
                    <Text style={s.value}>R$ __________ até o dia do evento</Text>
                </View>

                {/* 3. REGRAS DOS ESPAÇOS */}
                <Text style={s.sectionTitle}>3. Regras dos Espaços</Text>

                <Text style={[s.bold, { marginBottom: 3 }]}>Área kids:</Text>
                <Text style={s.bullet}>• Monitor obrigatório. Hora extra: R$ 30,00/h.</Text>
                <Text style={s.bullet}>• Multa por uso indevido: R$ 200,00 + danos.</Text>

                <Text style={[s.bold, { marginBottom: 3, marginTop: 6 }]}>Piscina:</Text>
                <Text style={s.bullet}>• Proibido alimentos, bebidas e materiais de vidro na área da piscina.</Text>
                <Text style={s.bullet}>• Multa por uso indevido: R$ 200,00 + danos.</Text>

                <Text style={[s.bold, { marginBottom: 3, marginTop: 6 }]}>Áreas privativas:</Text>
                <Text style={s.bullet}>• Área de despejo, horta e armário embutido na cozinha. Proibido acesso.</Text>
                <Text style={s.bullet}>• Multa por uso indevido: R$ 200,00 por área + danos.</Text>

                {/* 4. OBRIGAÇÕES */}
                <Text style={s.sectionTitle}>4. Obrigações</Text>
                <Text style={s.paragraph}>Respeitar leis municipais (som até 23h), estaduais e federais, vizinhos e regras do espaço.</Text>
                <Text style={s.paragraph}>Proibido cobrar entrada ou repassar o espaço. O locatário é responsável por qualquer ocorrência durante o evento.</Text>

                {/* 5. DEVOLUÇÃO */}
                <Text style={s.sectionTitle}>5. Devolução</Text>
                <Text style={s.paragraph}>Devolver no mesmo dia, ao final do evento, ou até às 9h do dia seguinte. Retirar pertences até 9h do dia seguinte, ensacar lixo e não empilhar móveis.</Text>

                {/* 6. CUIDADOS */}
                <Text style={s.sectionTitle}>6. Cuidados</Text>
                <Text style={s.paragraph}>Não danificar paredes ou estruturas. Danos deverão ser ressarcidos em até 7 dias. Vistorias podem ocorrer a qualquer momento durante o evento.</Text>

                {/* 7. ATRASO */}
                <Text style={s.sectionTitle}>7. Atraso</Text>
                <Text style={s.paragraph}>Atraso na saída ou na entrega das chaves gerará cobrança adicional.</Text>

                {/* 8. CANCELAMENTO */}
                <Text style={s.sectionTitle}>8. Cancelamento</Text>
                <Text style={s.bullet}>• Até 60 dias antes do evento: sem reembolso.</Text>
                <Text style={s.bullet}>• De 61 a 120 dias antes: devolução de 40%.</Text>
                <Text style={s.bullet}>• De 121 a 180 dias antes: devolução de 70%.</Text>

                {/* 9. GERAL */}
                <Text style={s.sectionTitle}>9. Geral</Text>
                <Text style={s.paragraph}>O local possui câmeras de segurança. Este contrato pode ser aceito digitalmente, sem necessidade de assinatura em papel.</Text>

                {/* Assinaturas */}
                <View style={s.sigSection}>
                    <Text style={s.sigDate}>Lavras, _____ de __________________ de {ano}.</Text>
                    <View style={s.sigRow}>
                        <View style={s.sigBox}>
                            <View style={s.sigLine} />
                            <Text style={s.sigLabel}>Locador – Cleide Mirian Pereira</Text>
                        </View>
                        <View style={s.sigBox}>
                            <View style={s.sigLine} />
                            <Text style={s.sigLabel}>Locatário – {locatario || "____________________"}</Text>
                        </View>
                    </View>
                </View>

                {/* Rodapé */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>Recanto Vila Rica – Festas e Eventos · Lavras/MG</Text>
                    <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
