import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useAuth } from "../../contexts/AuthContext";
import { PLATFORM_PATH } from "../../utils/roles";
import { TABS } from "./tabs/constants";
import { BlockedDatesTab } from "./tabs/BlockedDatesTab";
import { CampaignsTab } from "./tabs/CampaignsTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { HolidaysTab } from "./tabs/HolidaysTab";
import { NegotiationsTab } from "./tabs/NegotiationsTab";
import { ReservationsTab } from "./tabs/ReservationsTab";
import { UsersTab } from "./tabs/UsersTab";
import { VenueTab } from "./tabs/VenueTab";
import { RulesTab } from "./rules/RulesTab";
import { BrandTab } from "./brand/BrandTab";
import { AgendaClosedNotice } from "./AgendaClosedNotice";
import * as S from "./styles";

const TAB_COMPONENTS = {
    dashboard:    DashboardTab,
    reservations: ReservationsTab,
    negotiations: NegotiationsTab,
    users:        UsersTab,
    campaigns:    CampaignsTab,
    holidays:     HolidaysTab,
    blockedDates: BlockedDatesTab,
    rules:        RulesTab,
    brand:        BrandTab,
    venues:       VenueTab,
};

/**
 * Painel do espaço (`/painel`) — OWNER do próprio espaço e ADMIN da plataforma.
 * O espaço exibido é o do `X-Tenant-Slug` guardado (ou o padrão).
 */
export default function Admin() {
    const { user, tenant, setTenant } = useAuth();
    const isPlatformAdmin = user?.role === "ADMIN";
    // a aba fica na URL (?tab=reservations) junto com os filtros/página da aba,
    // para que recarregar, voltar ou compartilhar o link reabra a mesma visão
    const [searchParams, setSearchParams] = useSearchParams();
    // ?tab=plans é o endereço antigo da aba de pacotes: abre "Regras do salão".
    const rawTab = searchParams.get("tab") ?? "dashboard";
    const requestedTab = rawTab === "plans" ? "rules" : rawTab;
    const activeTab = requestedTab in TAB_COMPONENTS ? requestedTab : "dashboard";

    function setActiveTab(key: string) {
        if (key === activeTab) return;
        // filtros pertencem a cada aba: trocar de aba começa limpo
        setSearchParams(key === "dashboard" ? {} : { tab: key });
    }

    const ActiveTab = TAB_COMPONENTS[activeTab as keyof typeof TAB_COMPONENTS] ?? DashboardTab;

    // Indicadores de rolagem da barra de abas (fade nas bordas quando há abas escondidas)
    const tabBarRef = useRef<HTMLDivElement | null>(null);
    const [fade, setFade] = useState({ start: false, end: false });

    const updateFade = useCallback(() => {
        const el = tabBarRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const start = el.scrollLeft > 2;
        const end = el.scrollLeft < max - 2;
        setFade((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    }, []);

    useEffect(() => {
        updateFade();
        window.addEventListener("resize", updateFade);
        return () => window.removeEventListener("resize", updateFade);
    }, [updateFade]);

    // Mantém a aba ativa visível quando a barra rola
    useEffect(() => {
        const el = tabBarRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
        if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
    }, [activeTab]);

    return (
        <S.Container>
            <S.PageHeader>
                <S.Title>
                    Painel do espaço
                    {tenant?.name && <S.TitleTenant>{tenant.name}</S.TitleTenant>}
                </S.Title>
                <S.Description>Gerencie reservas, clientes, campanhas e as regras do salão.</S.Description>
            </S.PageHeader>

            {isPlatformAdmin && (
                <S.ContextBar role="note">
                    {tenant ? (
                        <>
                            <span>
                                Você está no painel de <strong>{tenant.name || tenant.slug}</strong> como equipe da plataforma.
                            </span>
                            <S.InlineGroup>
                                <S.SecondaryButton type="button" $size="sm" onClick={() => setTenant(null)}>
                                    Voltar ao espaço padrão
                                </S.SecondaryButton>
                                <S.ContextLink to={PLATFORM_PATH}>Ir para a plataforma</S.ContextLink>
                            </S.InlineGroup>
                        </>
                    ) : (
                        <>
                            <span>Você está no painel do espaço padrão. Para ver outro espaço, abra-o na plataforma.</span>
                            <S.ContextLink to={PLATFORM_PATH}>Ir para a plataforma</S.ContextLink>
                        </>
                    )}
                </S.ContextBar>
            )}

            {/* Na seção de pacotes o passo a passo já orienta: o aviso só aparece nas outras telas. */}
            {!(activeTab === "rules" && (searchParams.get("section") ?? "packages") === "packages") && (
                <AgendaClosedNotice refreshKey={searchParams.toString()} onCreatePackage={() => setSearchParams({ tab: "rules" })} />
            )}

            <S.TabBar
                ref={tabBarRef}
                onScroll={updateFade}
                $fadeStart={fade.start}
                $fadeEnd={fade.end}
            >
                {TABS.map((tab) => (
                    <S.Tab
                        key={tab.key}
                        type="button"
                        $active={activeTab === tab.key}
                        aria-current={activeTab === tab.key ? "page" : undefined}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </S.Tab>
                ))}
            </S.TabBar>

            <S.TabPanel $active>
                {/* erro em uma aba não derruba o painel inteiro; key reinicia ao trocar de aba */}
                <ErrorBoundary
                    key={`${activeTab}:${tenant?.slug ?? "padrao"}`}
                    fallback={
                        <S.EmptyState role="alert">
                            Esta aba não carregou. Tente outra aba ou recarregue a página.
                        </S.EmptyState>
                    }
                >
                    <ActiveTab />
                </ErrorBoundary>
            </S.TabPanel>
        </S.Container>
    );
}
