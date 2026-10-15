import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import alegreya600 from "@expo-google-fonts/alegreya/600SemiBold/Alegreya_600SemiBold.ttf?url";
import alegreya700 from "@expo-google-fonts/alegreya/700Bold/Alegreya_700Bold.ttf?url";
import sans400 from "@expo-google-fonts/alegreya-sans/400Regular/AlegreyaSans_400Regular.ttf?url";
import sans400i from "@expo-google-fonts/alegreya-sans/400Regular_Italic/AlegreyaSans_400Regular_Italic.ttf?url";
import sans500 from "@expo-google-fonts/alegreya-sans/500Medium/AlegreyaSans_500Medium.ttf?url";
import sans700 from "@expo-google-fonts/alegreya-sans/700Bold/AlegreyaSans_700Bold.ttf?url";

import { BRAND_NAME } from "../../config/brand";
import type { ContractDocument } from "../../types";

/**
 * Contrato de locação em PDF (#47), desenhado a partir do documento que a API monta com os dados do
 * salão. Nada aqui é de um salão específico. Fontes do design system (Alegreya + Alegreya Sans) em TTF,
 * empacotadas localmente: o PDF não depende da rede, e o react-pdf erra os acentos com WOFF.
 */
Font.register({ family: "Alegreya", fonts: [{ src: alegreya600, fontWeight: 600 }, { src: alegreya700, fontWeight: 700 }] });
Font.register({
    family: "Alegreya Sans",
    fonts: [
        { src: sans400, fontWeight: 400 },
        { src: sans400i, fontWeight: 400, fontStyle: "italic" },
        { src: sans500, fontWeight: 500 },
        { src: sans700, fontWeight: 700 },
    ],
});
Font.registerHyphenationCallback((word) => [word]);

// Paleta do Festário (tema claro do design system): anil para a estrutura, tinta para o texto.
const ANIL = "#27357e";
const INK = "#141936";
const MUTED = "#5a6079";
const RULE = "#c2c8ec";
const WASH = "#eceefa";

const s = StyleSheet.create({
    page: { fontFamily: "Alegreya Sans", fontSize: 10, lineHeight: 1.5, color: INK, paddingTop: 48, paddingBottom: 64, paddingHorizontal: 56 },

    header: { marginBottom: 22 },
    salon: { fontFamily: "Alegreya", fontWeight: 700, fontSize: 24, color: ANIL, lineHeight: 1.1 },
    docTitle: { fontSize: 11, color: MUTED, marginTop: 4 },
    headerRule: { borderBottomWidth: 1.5, borderBottomColor: ANIL, marginTop: 12 },

    parties: { flexDirection: "row", gap: 18, marginBottom: 18 },
    party: { flex: 1, borderLeftWidth: 2, borderLeftColor: RULE, paddingLeft: 10 },
    partyRole: { fontSize: 9, color: MUTED, marginBottom: 2 },
    partyName: { fontWeight: 700, fontSize: 11 },
    partyLine: { fontSize: 9.5, color: INK },

    h2: { fontFamily: "Alegreya", fontWeight: 600, fontSize: 13, color: ANIL, marginTop: 16, marginBottom: 6 },

    facts: { flexDirection: "row", flexWrap: "wrap", backgroundColor: WASH, borderRadius: 3, paddingVertical: 8, paddingHorizontal: 10 },
    fact: { width: "33.33%", paddingVertical: 3, paddingRight: 8 },
    factLabel: { fontSize: 8.5, color: MUTED },
    factValue: { fontSize: 10.5, fontWeight: 500 },
    note: { fontSize: 9, color: MUTED, marginTop: 5 },

    included: { marginTop: 4 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: RULE },
    rowTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 6 },
    totalLabel: { fontWeight: 700, fontSize: 11 },
    totalValue: { fontFamily: "Alegreya", fontWeight: 700, fontSize: 13, color: ANIL },

    clause: { flexDirection: "row", marginBottom: 7 },
    clauseNumber: { width: 26, fontFamily: "Alegreya", fontWeight: 700, color: ANIL },
    clauseBody: { flex: 1 },
    clauseTitle: { fontWeight: 700 },

    bullet: { flexDirection: "row", marginBottom: 2 },
    bulletDot: { width: 10, color: ANIL },

    acceptance: { marginTop: 22, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: RULE, fontSize: 9.5 },

    // Rodapé: Text fixos e absolutos direto na página (um View absoluto em volta não é desenhado pelo react-pdf).
    footerLeft: { position: "absolute", bottom: 28, left: 56, fontSize: 8, color: MUTED },
    footerRight: { position: "absolute", bottom: 28, right: 56, width: 260, fontSize: 8, color: MUTED, textAlign: "right" },
});

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <View style={s.fact}>
            <Text style={s.factLabel}>{label}</Text>
            <Text style={s.factValue}>{value}</Text>
        </View>
    );
}

function Party({ role, name, lines }: { role: string; name: string; lines: (string | null)[] }) {
    return (
        <View style={s.party}>
            <Text style={s.partyRole}>{role}</Text>
            <Text style={s.partyName}>{name}</Text>
            {lines.filter(Boolean).map((line) => <Text key={line} style={s.partyLine}>{line}</Text>)}
        </View>
    );
}

export function ContractPdf({ contract: c }: { contract: ContractDocument }) {
    const generated = new Date(c.generatedAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });

    return (
        <Document title={`${c.title} — ${c.landlord.tradeName}`} author={c.landlord.tradeName} creator={BRAND_NAME}>
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.salon}>{c.landlord.tradeName}</Text>
                    <Text style={s.docTitle}>{c.title}</Text>
                    <View style={s.headerRule} />
                </View>

                <View style={s.parties}>
                    <Party
                        role="Locador"
                        name={c.landlord.name}
                        lines={[c.landlord.document && `CPF/CNPJ ${c.landlord.document}`, c.landlord.address, c.landlord.phone, c.landlord.email]}
                    />
                    <Party role="Locatário" name={c.renter.name || "—"} lines={[c.renter.email, c.renter.phone]} />
                </View>

                <Text style={s.h2}>1. Objeto</Text>
                <View style={s.facts}>
                    <Fact label="Espaço" value={c.event.venue} />
                    <Fact label="Data" value={c.event.date} />
                    <Fact label="Horário" value={`${c.event.start} às ${c.event.end}`} />
                    <Fact label="Pacote" value={c.package.name} />
                    <Fact label="Convidados" value={c.event.guests ? String(c.event.guests) : "a informar"} />
                    {c.event.address ? <Fact label="Endereço" value={c.event.address} /> : null}
                </View>
                {c.package.description ? <Text style={s.note}>{c.package.description}</Text> : null}
                {c.package.included.length > 0 ? <Text style={s.note}>Incluso no pacote: {c.package.included.join(", ")}.</Text> : null}
                {c.event.keyDelivery ? <Text style={s.note}>{c.event.keyDelivery}</Text> : null}

                <Text style={s.h2}>2. Valores e pagamento</Text>
                {c.charges.lines.map((line) => (
                    <View key={line.description} style={s.row}>
                        <Text>{line.description}</Text>
                        <Text>{line.amount}</Text>
                    </View>
                ))}
                {c.charges.discount ? (
                    <View style={s.row}>
                        <Text>Desconto</Text>
                        <Text>− {c.charges.discount}</Text>
                    </View>
                ) : null}
                <View style={s.rowTotal}>
                    <Text style={s.totalLabel}>Total</Text>
                    <Text style={s.totalValue}>{c.charges.total}</Text>
                </View>
                <Text style={s.note}>{c.payment}</Text>

                <Text style={s.h2}>3. Cancelamento e reembolso</Text>
                {c.cancellation.summary.map((line) => (
                    <View key={line} style={s.bullet}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text>{line}</Text>
                    </View>
                ))}
                {c.cancellation.notes ? <Text style={s.note}>{c.cancellation.notes}</Text> : null}

                <Text style={s.h2}>4. Regras do espaço</Text>
                {c.clauses.map((clause, i) => (
                    <View key={clause.title} style={s.clause} wrap={false}>
                        <Text style={s.clauseNumber}>4.{i + 1}</Text>
                        <Text style={s.clauseBody}>
                            <Text style={s.clauseTitle}>{clause.title}. </Text>
                            {clause.text}
                        </Text>
                    </View>
                ))}

                <Text style={s.acceptance}>
                    {c.place ? `${c.place}, ${generated}. ` : `${generated}. `}
                    O locatário aceita este contrato ao confirmar a reserva no app.
                </Text>

                <Text style={s.footerLeft} fixed>{c.landlord.tradeName}{c.place ? `, ${c.place}` : ""}</Text>
                <Text style={s.footerRight} fixed>Contrato gerado pelo {BRAND_NAME}</Text>
            </Page>
        </Document>
    );
}
