import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { animateFadeInUp } from "../../utils/animations";
import * as S from "./styles";

/**
 * Página exibida quando o usuário cancela o pagamento no Stripe Checkout.
 *
 * Exibe ícone de cancelamento com entrada GSAP e botão para tentar novamente.
 * Rota: `/payment/cancel`
 *
 * @component
 */
export default function PaymentCancel() {
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
                    <S.XIcon />
                </S.IconWrapper>

                <S.Title>Pagamento cancelado</S.Title>

                <S.Description>
                    Você saiu do pagamento antes de concluir. Sua reserva continua
                    pendente — a data ainda não está garantida.
                </S.Description>

                <S.Hint>
                    Para concluir, abra suas reservas e use “Pagar” na reserva pendente.
                </S.Hint>

                <S.Actions>
                    <S.PrimaryButton onClick={() => navigate("/reservations")}>
                        Ver minhas reservas
                    </S.PrimaryButton>

                    <S.SecondaryButton onClick={() => navigate("/venues")}>
                        Explorar espaços
                    </S.SecondaryButton>
                </S.Actions>
            </S.Card>
        </S.Container>
    );
}
