import { useSearchParams } from "react-router-dom";

import { BookingSection } from "./BookingSection";
import { ContractRulesSection } from "./ContractRulesSection";
import { ItemsSection } from "./ItemsSection";
import { PackagesSection } from "./PackagesSection";
import * as S from "./styles";

const SECTIONS = [
    { key: "packages", label: "Pacotes", hint: "Preço, dias, horário e o que vem incluso" },
    { key: "items", label: "Itens e adicionais", hint: "Monitor, buffet, garçom, piscina..." },
    { key: "booking", label: "Reserva e cancelamento", hint: "Prazo, antecedência e reembolso" },
    { key: "contract", label: "Contrato e contato", hint: "Locador, contatos e regras do espaço" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

/**
 * Aba "Regras do salão" do painel: tudo o que define como o salão é reservado. A seção fica na
 * URL (`?tab=rules&section=items`) para recarregar e compartilhar o link na mesma tela.
 */
export function RulesTab() {
    const [params, setParams] = useSearchParams();
    const requested = params.get("section");
    const active: SectionKey = SECTIONS.some((s) => s.key === requested) ? (requested as SectionKey) : "packages";

    function go(key: string) {
        setParams({ tab: "rules", ...(key === "packages" ? {} : { section: key }) });
    }

    return (
        <S.Layout>
            <S.SectionNav aria-label="Regras do salão">
                {SECTIONS.map((s) => (
                    <S.SectionLink key={s.key} type="button" $active={active === s.key} aria-current={active === s.key ? "page" : undefined} onClick={() => go(s.key)}>
                        {s.label}
                        <small>{s.hint}</small>
                    </S.SectionLink>
                ))}
            </S.SectionNav>
            <div>
                {active === "packages" && <PackagesSection onGoTo={go} />}
                {active === "items" && <ItemsSection />}
                {active === "booking" && <BookingSection />}
                {active === "contract" && <ContractRulesSection />}
            </div>
        </S.Layout>
    );
}
