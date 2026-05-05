import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ReactNode } from "react";

interface ParaProps {
    label: string;
    children: ReactNode;
}

interface BulletProps {
    children: ReactNode;
}

interface ContratoRVRProps {
    locatario: string;
    data: string;
    horarioInicio: string;
    horarioFim: string;
    comKids: boolean;
    comPiscina: boolean;
    planCode: "PROMOCIONAL" | "ESSENCIAL" | "COMPLETA";
    totalCents?: number;
}

const PLAN_INFO = {
    PROMOCIONAL: {
        label: "Promocional",
        days: "Segunda a Quinta-feira",
        priceCents: 65000,
        inclusions: ["Salão de festas, cozinha, banheiros e quadra esportiva", "Área kids com monitor infantil por 4 horas", "Faxinas"],
    },
    ESSENCIAL: {
        label: "Essencial",
        days: "Sexta-feira, Sábado, Domingo e Feriados",
        priceCents: 85000,
        inclusions: ["Salão de festas, cozinha, banheiros e quadra esportiva", "Área kids com monitor infantil por 4 horas", "Faxinas"],
    },
    COMPLETA: {
        label: "Completa",
        days: "Sexta-feira, Sábado, Domingo e Feriados",
        priceCents: 99900,
        inclusions: ["Salão de festas, cozinha, banheiros e quadra esportiva", "Área kids com monitor infantil por 4 horas", "Área da piscina (período integral)", "Faxinas"],
    },
};

function formatCurrency(cents: number): string {
    return (Number(cents) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        paddingTop: 50,
        paddingBottom: 60,
        paddingHorizontal: 55,
        color: "#111",
        lineHeight: 1.6,
    },
    header: {
        textAlign: "center",
        marginBottom: 24,
        borderBottomWidth: 2,
        borderBottomColor: "#7c3aed",
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: "#7c3aed",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 10,
        color: "#555",
    },
    partiesSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: "#7c3aed",
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    partiesRow: {
        flexDirection: "row",
        gap: 12,
    },
    partyBox: {
        flex: 1,
        backgroundColor: "#f5f3ff",
        borderRadius: 4,
        padding: 8,
    },
    partyRole: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        color: "#7c3aed",
        marginBottom: 3,
    },
    partyName: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        marginBottom: 2,
    },
    partyDetail: {
        fontSize: 9,
        color: "#444",
    },
    planBox: {
        backgroundColor: "#f5f3ff",
        borderLeftWidth: 3,
        borderLeftColor: "#7c3aed",
        borderRadius: 4,
        padding: 10,
        marginBottom: 20,
    },
    planRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    planName: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#7c3aed",
    },
    planPrice: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
    },
    planMeta: {
        fontSize: 9,
        color: "#555",
        marginBottom: 6,
    },
    planInclusionsList: {
        marginTop: 4,
    },
    planInclusionItem: {
        fontSize: 9,
        color: "#333",
        marginBottom: 2,
    },
    clauseTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        textAlign: "center",
        marginBottom: 10,
        marginTop: 4,
    },
    paragraph: {
        marginBottom: 8,
        textAlign: "justify",
    },
    paragraphLabel: {
        fontFamily: "Helvetica-Bold",
    },
    bulletItem: {
        marginLeft: 16,
        marginBottom: 6,
        textAlign: "justify",
    },
    bulletDot: {
        fontFamily: "Helvetica-Bold",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 55,
        right: 55,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 8,
        color: "#999",
    },
    pageNumber: {
        fontSize: 8,
        color: "#999",
    },
});

function Para({ label, children }: ParaProps) {
    return (
        <View style={styles.paragraph}>
            <Text>
                <Text style={styles.paragraphLabel}>{label} – </Text>
                {children}
            </Text>
        </View>
    );
}

function Bullet({ children }: BulletProps) {
    return (
        <View style={styles.bulletItem}>
            <Text>
                <Text style={styles.bulletDot}>• </Text>
                {children}
            </Text>
        </View>
    );
}

/**
 * Documento PDF do contrato de locação do Recanto Vila Rica, gerado via `@react-pdf/renderer`.
 *
 * O texto das cláusulas 3ª–5ª varia automaticamente conforme a combinação de espaços opcionais
 * (`comKids` / `comPiscina`). Use `ContratoDownloadLink` para disponibilizar o download.
 *
 * @component
 */
export function ContratoRVR({ locatario, data, horarioInicio, horarioFim, comKids, comPiscina, planCode, totalCents }: ContratoRVRProps) {
    const plan = PLAN_INFO[planCode] ?? PLAN_INFO.ESSENCIAL;
    const preco = formatCurrency(totalCents ?? plan.priceCents);
    const periodo = `${data}, das ${horarioInicio} às ${horarioFim}`;

    // §3 varia por combinação
    const par3 = (() => {
        if (comKids && comPiscina) {
            return "O espaço, objeto desta locação, compreende: salão de festas; cozinha; 2 banheiros - masculino e feminino e quadra esportiva (Espaços Usuais); estão inclusas, ainda, a área kids (Espaço Opcional 1) e a área da piscina (Espaço Opcional 2), por opção do locatário.";
        }
        if (comKids && !comPiscina) {
            return "O espaço, objeto desta locação, compreende: salão de festas; cozinha; 2 banheiros - masculino e feminino e quadra esportiva (Espaços Usuais), e também, a área kids (Espaço Opcional 1). A área da piscina (Espaço Opcional 2) não está inclusa nesta locação, por opção do locatário.";
        }
        if (!comKids && comPiscina) {
            return "O espaço, objeto desta locação, compreende: salão de festas; cozinha; 2 banheiros - masculino e feminino e quadra esportiva (Espaços Usuais) e, também, a área da piscina (Espaço Opcional 2). A área kids (Espaço Opcional 1) não está inclusa nesta locação, por opção do locatário.";
        }
        return "O espaço, objeto desta locação, compreende: salão de festas; cozinha; 2 banheiros - masculino e feminino e quadra esportiva (Espaços Usuais). Não estão inclusos os Espaços Opcionais 1 e 2, por opção do locatário.";
    })();

    // §7 — CT não menciona limpeza; as demais sim
    const par7Limpeza = !(comKids && comPiscina)
        ? " A limpeza final é por conta do locador."
        : "";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Contrato de Locação de Espaço para Eventos</Text>
                    <Text style={styles.headerSubtitle}>Recanto Vila Rica – Festas e Eventos</Text>
                    <Text style={styles.headerSubtitle}>Rua Bernardino Antônio Tomáz, 21 – Jardim Vila Rica, Lavras/MG</Text>
                </View>

                {/* Partes */}
                <View style={styles.partiesSection}>
                    <Text style={styles.sectionLabel}>Partes contratantes</Text>
                    <View style={styles.partiesRow}>
                        <View style={styles.partyBox}>
                            <Text style={styles.partyRole}>Locador</Text>
                            <Text style={styles.partyName}>Recanto Vila Rica</Text>
                            <Text style={styles.partyDetail}>Rua Bernardino Antônio Tomáz, 21</Text>
                            <Text style={styles.partyDetail}>Jardim Vila Rica, Lavras/MG</Text>
                        </View>
                        <View style={styles.partyBox}>
                            <Text style={styles.partyRole}>Locatário</Text>
                            <Text style={styles.partyName}>{locatario || "—"}</Text>
                        </View>
                    </View>
                </View>

                {/* Plano contratado */}
                <Text style={styles.sectionLabel}>Modalidade contratada</Text>
                <View style={styles.planBox}>
                    <View style={styles.planRow}>
                        <Text style={styles.planName}>Plano {plan.label}</Text>
                        <Text style={styles.planPrice}>{preco}</Text>
                    </View>
                    <Text style={styles.planMeta}>Válido: {plan.days}</Text>
                    <Text style={styles.planMeta}>Data e horário: {periodo}</Text>
                    <View style={styles.planInclusionsList}>
                        {plan.inclusions.map((item, i) => (
                            <Text key={i} style={styles.planInclusionItem}>•  {item}</Text>
                        ))}
                    </View>
                </View>

                {/* Cláusula 1ª */}
                <Text style={styles.clauseTitle}>Cláusula Primeira – Do Objeto do Contrato</Text>

                <Para label="Parágrafo 1º">
                    O primeiro nomeado, aqui chamado "locador", sendo proprietário do imóvel Recanto Vila Rica – Festas e Eventos, localizado à Rua Bernardino Antônio Tomáz, 21 – Jardim Vila Rica, Lavras/MG, loca-o ao segundo contratante, aqui chamado "locatário", mediante as condições descritas a seguir, neste instrumento.
                </Para>

                <Para label="Parágrafo 2º">
                    A locação se efetuará no dia {data}, das {horarioInicio} às {horarioFim}h, sob a modalidade {plan.label} ({preco}), para exercer sua atividade.
                </Para>

                <Para label="Parágrafo 3º">{par3}</Para>

                {/* §4 — área kids */}
                {comKids ? (
                    <>
                        <Para label="Parágrafo 4º">
                            O espaço kids ficará disponível pelo período de 4 horas (horário a definir), sob a supervisão de um monitor infantil; antes e após esse período o espaço {comPiscina ? "fica FECHADO" : "PERMANECE FECHADO"}. O locatário poderá optar pela permanência do monitor infantil, com pagamento extra por sua conta no valor de R$ 25,00 por hora-extra (combinados previamente).
                        </Para>
                        <Bullet>
                            Em caso de constatação de invasão na área kids (Espaço Opcional 1), fora do horário estipulado, será cobrada multa no valor de R$ 400,00 + reparação dos possíveis danos, com pagamento e ressarcimento em até 7 dias.
                        </Bullet>
                    </>
                ) : (
                    <>
                        <Para label="Parágrafo 4º">
                            {comPiscina
                                ? "O espaço kids (Espaço Opcional 1) não ficará disponível por todo o período da locação."
                                : "A área kids (Espaço Opcional 1) não ficará disponível pelo período todo da locação."}
                        </Para>
                        <Bullet>
                            Em caso de constatação de invasão nesta área será cobrada multa no valor de R$ 400,00 + reparação dos possíveis danos, com pagamento e ressarcimento em até 7 dias.
                        </Bullet>
                    </>
                )}

                {/* §5 — piscina */}
                {comPiscina ? (
                    comKids ? (
                        <Para label="Parágrafo 5º">
                            A área da piscina ficará disponível nesta locação, por todo o período locado.
                        </Para>
                    ) : (
                        <Para label="Parágrafo 5º">
                            A área da piscina (Espaço Opcional 2) ficará disponível nesta locação, por todo o período da locação.
                        </Para>
                    )
                ) : (
                    <Para label="Parágrafo 5º">
                        {comKids
                            ? "A área da piscina não ficará disponível nesta locação, por opção do locatário. Em caso de constatação de invasão nesta área será cobrada multa no valor de R$ 300,00 + reparação dos possíveis danos, com pagamento e ressarcimento em até 7 dias."
                            : "A área da piscina (Espaço Opcional 2) não ficará disponível pelo período todo da locação."}
                        {!comKids && (
                            <Text> Em caso de constatação de invasão nesta área será cobrada multa no valor de R$ 300,00 + reparação dos possíveis danos, com pagamento e ressarcimento em até 7 dias.</Text>
                        )}
                    </Para>
                )}

                {/* §6 */}
                <Para label="Parágrafo 6º">
                    Não estão inclusas nesta locação as áreas privativas do locador: área de despejo, horta e armário embutido na cozinha.
                </Para>
                <Bullet>
                    Em caso de constatação de invasão nestas áreas será cobrada multa no valor de R$ 200,00 + reparação dos possíveis danos, em cada uma delas, com pagamento e ressarcimento em até 7 dias.
                </Bullet>

                {/* §7 */}
                <Para label="Parágrafo 7º">
                    O locatário compromete-se à devolução do salão e das respectivas chaves ao locatário (ou a alguém autorizado por ele) no mesmo dia, ao final da festa ou, no máximo até às 10h do dia seguinte, com o imóvel desocupado dos seus pertences e daqueles relativos aos prestadores de serviço, além do lixo acondicionado em sacos plásticos.{par7Limpeza}
                </Para>

                {/* §8 */}
                <Para label="Parágrafo 8º">
                    Fica vedado o empréstimo do imóvel, total ou parcial, para terceiros alheios à locação, ou para uso não contratado; assim como a entrega das suas cópias da chave a terceiros para qualquer fim.
                </Para>

                {/* §9 */}
                <Para label="Parágrafo 9º">
                    Fica vedada a organização de eventos com fins lucrativos e, portanto, a cobrança de qualquer tipo de ingresso ou acesso, total ou parcial, de terceiros para qualquer fim.
                </Para>

                {/* §10 */}
                <Para label="Parágrafo 10º">
                    A confirmação da concordância e anuência das cláusulas contratuais, pelo locatário, poderá se dar com seu aceite por meio digital, sem a necessidade de assinatura em papel.
                </Para>

                {/* Rodapé */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Recanto Vila Rica – Festas e Eventos · Lavras/MG</Text>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
