import { useState } from "react";
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

    return (
        <S.Container>
            <S.PageHeader>
                <S.Title>Painel Administrativo</S.Title>
                <S.Description>Gerencie reservas, usuários, campanhas e configurações.</S.Description>
            </S.PageHeader>

            <S.TabBar>
                {TABS.map((tab) => (
                    <S.Tab
                        key={tab.key}
                        $active={activeTab === tab.key}
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
