import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { REQUIREMENT_LABELS } from "../../constants/providers";
import { getMyProvider, publishMyProvider, unpublishMyProvider } from "../../services/provider";
import type { MyProvider } from "../../types";
import { isAbortError } from "../../utils/errors";
import { getErrorMessage, getLoadErrorMessage } from "../../utils/getErrorMessage";
import * as A from "../Admin/styles";
import AgendaTab from "./AgendaTab";
import PackagesTab from "./PackagesTab";
import PortfolioTab from "./PortfolioTab";
import ProfileForm from "./ProfileForm";
import QuotesInbox from "./QuotesInbox";
import ReviewsTab from "./ReviewsTab";
import * as S from "./styles";

const TABS = [
    { key: "orcamentos", label: "Orçamentos" },
    { key: "perfil", label: "Perfil" },
    { key: "portfolio", label: "Portfólio" },
    { key: "pacotes", label: "Pacotes" },
    { key: "agenda", label: "Agenda" },
    { key: "avaliacoes", label: "Avaliações" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

type LoadState = { status: "loading" } | { status: "ready"; provider: MyProvider | null } | { status: "error"; message: string };

const joinList = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`);

/**
 * "Meu negócio": o painel de quem presta serviço de festa. Sem perfil, mostra o cadastro; com perfil,
 * a situação na vitrine (rascunho, publicado ou oculto pela plataforma) e as abas. A aba fica na URL
 * (`?aba=`), para o link do e-mail de pedido novo abrir direto nos orçamentos.
 *
 * @see GET /providers/me
 */
export default function MyBusiness() {
    const [state, setState] = useState<LoadState>({ status: "loading" });
    const [reload, setReload] = useState(0);
    const [publishing, setPublishing] = useState(false);
    const [params, setParams] = useSearchParams();

    useEffect(() => {
        const controller = new AbortController();
        getMyProvider(controller.signal)
            .then((provider) => setState({ status: "ready", provider }))
            .catch((err) => { if (!isAbortError(err)) setState({ status: "error", message: getLoadErrorMessage(err, "Não foi possível carregar o seu negócio.") }); });
        return () => controller.abort();
    }, [reload]);

    const provider = state.status === "ready" ? state.provider : null;
    const setProvider = (p: MyProvider) => setState({ status: "ready", provider: p });

    // Recém-criado ainda não tem pedido: começa pelo que falta para publicar.
    const fallbackTab: TabKey = provider && provider.visibility === "DRAFT" ? "perfil" : "orcamentos";
    const tab = (TABS.some((t) => t.key === params.get("aba")) ? params.get("aba") : fallbackTab) as TabKey;
    const setTab = (key: TabKey) => setParams({ aba: key }, { replace: true });

    async function togglePublish() {
        if (!provider) return;
        try {
            setPublishing(true);
            const next = provider.status === "PUBLISHED" ? await unpublishMyProvider() : await publishMyProvider();
            setProvider(next);
            toast.success(next.status === "PUBLISHED" ? "Perfil publicado. Ele já aparece na vitrine." : "Perfil tirado da vitrine.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Não foi possível mudar a publicação."));
        } finally {
            setPublishing(false);
        }
    }

    if (state.status === "loading") return <S.Container><A.LoadingSpinner aria-label="Carregando o seu negócio" /></S.Container>;
    if (state.status === "error") {
        return (
            <S.Container>
                <A.EmptyState role="alert">
                    {state.message}
                    <A.SecondaryButton type="button" onClick={() => setReload((n) => n + 1)}>Tentar de novo</A.SecondaryButton>
                </A.EmptyState>
            </S.Container>
        );
    }

    if (!provider) {
        return (
            <S.Container>
                <S.Intro>
                    <S.Title>Ofereça seus serviços para festas</S.Title>
                    <S.Lead>
                        Buffet, decoração, maquiagem, doces, foto, música: monte o perfil do seu negócio e receba pedidos de orçamento de quem
                        está organizando uma festa. Os salões parceiros também podem indicar você para quem reserva com eles.
                    </S.Lead>
                    <S.Steps>
                        <li><strong>Conte o que você faz</strong> e onde atende.</li>
                        <li><strong>Mostre o trabalho</strong> com fotos e pacotes.</li>
                        <li><strong>Publique</strong> e responda os pedidos por aqui.</li>
                    </S.Steps>
                </S.Intro>
                <ProfileForm provider={null} onSaved={(p) => { setProvider(p); setTab("perfil"); toast.success("Perfil criado. Agora mande as fotos do seu trabalho."); }} />
            </S.Container>
        );
    }

    const missing = provider.missingToPublish.map((m) => REQUIREMENT_LABELS[m]);

    return (
        <S.Container>
            <S.Top>
                <div>
                    <S.Title>{provider.name}</S.Title>
                    <S.TopLinks>
                        <Link to={`/servicos/${provider.slug}`}>{provider.visibility === "PUBLISHED" ? "Ver a minha página" : "Ver como vai ficar"}</Link>
                    </S.TopLinks>
                </div>
            </S.Top>

            {provider.visibility === "HIDDEN" ? (
                <S.StatusBar $tone="error" role="status">
                    <div>
                        <strong>A plataforma tirou o seu perfil da vitrine.</strong>
                        <p>Motivo: {provider.hiddenReason}. Ajuste o perfil e fale com a gente em Contate-nos para voltar.</p>
                    </div>
                </S.StatusBar>
            ) : provider.visibility === "PUBLISHED" ? (
                <S.StatusBar $tone="ok" role="status">
                    <div>
                        <strong>Seu perfil está na vitrine.</strong>
                        <p>Quem procura serviços para a festa já encontra você.</p>
                    </div>
                    <A.SecondaryButton type="button" onClick={togglePublish} disabled={publishing}>Tirar da vitrine</A.SecondaryButton>
                </S.StatusBar>
            ) : (
                <S.StatusBar $tone="draft" role="status">
                    <div>
                        <strong>{missing.length ? "Quase lá: o perfil ainda é um rascunho." : "Tudo pronto para publicar."}</strong>
                        <p>{missing.length ? `Para publicar, falta ${joinList(missing)}.` : "Publique para aparecer na vitrine e receber pedidos."}</p>
                    </div>
                    <A.PrimaryButton type="button" onClick={togglePublish} disabled={publishing || missing.length > 0} aria-busy={publishing}>
                        {publishing ? "Publicando..." : "Publicar"}
                    </A.PrimaryButton>
                </S.StatusBar>
            )}

            <A.TabBar role="tablist" aria-label="Seções do Meu negócio">
                {TABS.map((t) => (
                    <A.Tab key={t.key} type="button" role="tab" $active={tab === t.key} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                        {t.label}
                    </A.Tab>
                ))}
            </A.TabBar>

            <div role="tabpanel">
                {tab === "orcamentos" && <QuotesInbox />}
                {tab === "perfil" && <ProfileForm provider={provider} onSaved={(p) => { setProvider(p); toast.success("Perfil salvo."); }} />}
                {tab === "portfolio" && <PortfolioTab provider={provider} onChange={setProvider} />}
                {tab === "pacotes" && <PackagesTab provider={provider} onChange={setProvider} />}
                {tab === "agenda" && <AgendaTab provider={provider} onChange={setProvider} />}
                {tab === "avaliacoes" && <ReviewsTab />}
            </div>
        </S.Container>
    );
}
