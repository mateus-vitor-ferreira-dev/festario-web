import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import Logo from "../../assets/logo-recanto.svg";
import { BRAND_NAME } from "../../config/brand";
import BookingPreview from "./BookingPreview";
import { animateStagger } from "../../utils/animations";
import * as S from "./styles";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    introFinished?: boolean;
}

/**
 * Layout de duas colunas para as páginas de autenticação (Login e Cadastro).
 *
 * Coluna esquerda: marca, prévia do calendário de reservas e chamada (sem foto de
 * um espaço específico — a plataforma atende vários espaços). Coluna direita: formulário com GSAP stagger.
 * Enquanto `introFinished` é `false`, o logo fica invisível para não conflitar
 * com a `IntroAnimation` que está voando até sua posição.
 *
 * @component
 */
export default function AuthLayout({
    title,
    subtitle,
    children,
    introFinished = true,
}: AuthLayoutProps) {
    const formAreaRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        if (!formAreaRef.current) return;
        animateStagger(formAreaRef.current.children, { delay: 0.1 });
    }, { scope: formAreaRef, dependencies: [] });

    return (
        <S.Container>
            <S.LeftSide>
                <S.Brand>
                    <S.BrandLogoWrapper
                        data-intro-logo-target="true"
                        data-intro-target-desktop="true"
                        $visible={introFinished}
                    >
                        <S.BrandLogo src={Logo} alt="" />
                    </S.BrandLogoWrapper>
                    <S.BrandName>{BRAND_NAME}</S.BrandName>
                </S.Brand>

                <BookingPreview />

                <S.LeftBody>
                    <S.Headline>Sua festa começa pela data certa.</S.Headline>
                    <S.Tagline>
                        Veja os dias livres, escolha o pacote, assine o contrato e pague,
                        tudo sem trocar mensagens.
                    </S.Tagline>
                </S.LeftBody>
            </S.LeftSide>

            <S.RightSide>
                <S.FormArea ref={formAreaRef}>
                    <S.MobileBrand
                        data-intro-logo-target="true"
                        data-intro-target-mobile="true"
                        $visible={introFinished}
                    >
                        <S.MobileBrandLogo src={Logo} alt={BRAND_NAME} />
                        <S.MobileBrandName>{BRAND_NAME}</S.MobileBrandName>
                    </S.MobileBrand>

                    <S.FormHeader>
                        <S.Title>{title}</S.Title>
                        <S.Subtitle>{subtitle}</S.Subtitle>
                    </S.FormHeader>

                    {children}
                </S.FormArea>
            </S.RightSide>
        </S.Container>
    );
}