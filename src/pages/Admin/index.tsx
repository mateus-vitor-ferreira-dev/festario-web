import { useCallback, useEffect, useRef, useState } from "react";
import { TABS } from "./tabs/constants";
import { BlockedDatesTab } from "./tabs/BlockedDatesTab";
import { CampaignsTab } from "./tabs/CampaignsTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { HolidaysTab } from "./tabs/HolidaysTab";
import { NegotiationsTab } from "./tabs/NegotiationsTab";
import { PlansTab } from "./tabs/PlansTab";
import { ReservationsTab } from "./tabs/ReservationsTab";
import { UsersTab } from "./tabs/UsersTab";
import { VenueTab } from "./tabs/VenueTab";
import * as S from "./styles";

const TAB_COMPONENTS = {
    dashboard:    DashboardTab,
    reservations: ReservationsTab,
    negotiations: NegotiationsTab,
    users:        UsersTab,
    campaigns:    CampaignsTab,
    holidays:     HolidaysTab,
    blockedDates: BlockedDatesTab,
    plans:        PlansTab,
    venues:       VenueTab,
};

export default function Admin() {
    const [activeTab, setActiveTab] = useState("dashboard");
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
                <S.Title>Painel administrativo</S.Title>
                <S.Description>Gerencie reservas, usuários, campanhas e configurações.</S.Description>
            </S.PageHeader>

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
                <ActiveTab />
            </S.TabPanel>
        </S.Container>
    );
}
