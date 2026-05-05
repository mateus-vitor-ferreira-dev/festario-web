import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import * as S from "./styles";

export default function NotFound() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <S.Container>
            <S.Card>
                <S.IconWrapper>
                    <S.Code>404</S.Code>
                </S.IconWrapper>

                <S.Title>Página não encontrada</S.Title>

                <S.Description>
                    O endereço que você acessou não existe ou foi removido.
                    Verifique o link e tente novamente.
                </S.Description>

                <S.Actions>
                    <S.PrimaryButton onClick={() => navigate(isAuthenticated ? "/home" : "/login")}>
                        {isAuthenticated ? "Ir para o início" : "Ir para o login"}
                    </S.PrimaryButton>

                    <S.SecondaryButton onClick={() => navigate(-1)}>
                        Voltar
                    </S.SecondaryButton>
                </S.Actions>
            </S.Card>
        </S.Container>
    );
}
