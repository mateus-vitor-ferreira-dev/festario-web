import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FADE_UP } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página de confirmação de pagamento bem-sucedido (retorno do Stripe Checkout).
 *
 * Exibe ícone de sucesso com animação GSAP e botão para ir às reservas.
 * Rota: `/payment/success`
 *
 * @component
 */
export default function PaymentSuccess() {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        if (!cardRef.current) return;
        const children = cardRef.current.children;
        gsap.from(children[0], { scale: 0.5, opacity: 0, duration: 0.6, ease: "back.out(1.7)" });
        gsap.from(Array.from(children).slice(1), { ...FADE_UP, stagger: 0.1, delay: 0.3 });
    }, { scope: cardRef, dependencies: [] });

    return (
        <S.Container>
            <S.Card ref={cardRef}>
                <S.IconWrapper>
                    <S.CheckIcon />
                </S.IconWrapper>

                <S.Title>Pagamento confirmado!</S.Title>

                <S.Description>
                    Sua reserva foi confirmada com sucesso. Em breve você receberá
                    um e-mail com os detalhes do seu evento.
                </S.Description>

                <S.Actions>
                    <S.PrimaryButton onClick={() => navigate("/reservations")}>
                        Ver minhas reservas
                    </S.PrimaryButton>

                    <S.SecondaryButton onClick={() => navigate("/home")}>
                        Voltar para o início
                    </S.SecondaryButton>
                </S.Actions>
            </S.Card>
        </S.Container>
    );
}
