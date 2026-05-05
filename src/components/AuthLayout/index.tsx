import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import Logo from "../../assets/logo-recanto.svg";
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
 * Coluna esquerda: branding + decorações. Coluna direita: formulário com GSAP stagger.
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
                <S.LeftInner>
                    <S.Brand>
                        <S.BrandName>Recanto Vila Rica</S.BrandName>

                        <S.BrandLogoWrapper
                            data-intro-logo-target="true"
                            data-intro-target-desktop="true"
                            $visible={introFinished}
                        >
                            <S.BrandLogo src={Logo} alt="Recanto Vila Rica" />
                        </S.BrandLogoWrapper>
                    </S.Brand>

                    <S.LeftBody>
                        <S.Headline>Reserve com elegância e simplicidade.</S.Headline>
                        <S.Tagline>
                            Uma experiência profissional para organizar eventos, pagamentos
                            e disponibilidade em um só lugar.
                        </S.Tagline>
                    </S.LeftBody>
                </S.LeftInner>

                <S.Deco1 />
                <S.Deco2 />
                <S.Deco3 />
            </S.LeftSide>

            <S.RightSide>
                <S.FormArea ref={formAreaRef}>
                    <S.MobileBrand
                        data-intro-logo-target="true"
                        data-intro-target-mobile="true"
                        $visible={introFinished}
                    >
                        <S.MobileBrandLogo src={Logo} alt="Recanto Vila Rica" />
                        <S.MobileBrandName>Recanto Vila Rica</S.MobileBrandName>
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