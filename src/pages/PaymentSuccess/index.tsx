import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página de confirmação de pagamento bem-sucedido (retorno do Stripe Checkout).
 *
 * Exibe ícone de sucesso com entrada GSAP e botão para ir às reservas.
 * Rota: `/payment/success`
 *
 * @component
 */
export default function PaymentSuccess() {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        if (!cardRef.current) return;
        animateFadeInUp(cardRef.current);
    }, { scope: cardRef, dependencies: [] });

    return (
        <S.Container>
            <S.Card ref={cardRef}>
                <S.IconWrapper>
                    <S.CheckIcon />
                </S.IconWrapper>

                <S.Title>Pagamento confirmado</S.Title>

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
