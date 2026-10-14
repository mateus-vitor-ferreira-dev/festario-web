/**
 * @module components/Footer
 * @description Rodapé simples com copyright da plataforma (`BRAND_NAME`).
 */
import { BRAND_NAME } from "../../config/brand";
import * as S from "./styles";

/** @component */
export default function Footer() {
    return (
        <S.Container>
            <S.Content>
                <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.</p>
                <span>Dúvidas sobre sua reserva? Fale com a gente em Contate-nos.</span>
            </S.Content>
        </S.Container>
    );
}