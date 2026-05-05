import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { Footer, Header } from "..";
import * as S from "./styles";

const ChatWidget = lazy(() => import("../ChatWidget"));

/**
 * Shell principal da aplicação autenticada.
 *
 * Renderiza `Header` no topo, o conteúdo da rota atual via `<Outlet>` no meio,
 * `Footer` no rodapé e o `ChatWidget` flutuante sobreposto.
 *
 * @component
 */
export default function MainLayout() {
    return (
        <S.Container>
            <Header />
            <S.Main>
                <Outlet />
            </S.Main>
            <Footer />
            <Suspense fallback={null}>
                <ChatWidget />
            </Suspense>
        </S.Container>
    );
}
