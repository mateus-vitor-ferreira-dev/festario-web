/**
 * @module components/Footer
 * @description Rodapé simples com copyright e tagline do Recanto Vila Rica.
 */
import * as S from "./styles";

/** @component */
export default function Footer() {
    return (
        <S.Container>
            <S.Content>
                <p>© 2026 Recanto Vila Rica. Todos os direitos reservados.</p>
                <span>Dúvidas sobre sua reserva? Fale com a gente em Contate-nos.</span>
            </S.Content>
        </S.Container>
    );
}