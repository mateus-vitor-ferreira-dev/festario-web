/**
 * @module components/Button
 * @description Botão primário do design system. Aplica os estilos do tema via
 * styled-component e repassa todos os atributos HTML ao elemento subjacente.
 */
import { ButtonHTMLAttributes } from "react";
import * as S from "./styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * Botão genérico do design system.
 *
 * @component
 */
export default function Button({ children, ...props }: ButtonProps) {
    return <S.Container {...props}>{children}</S.Container>;
}