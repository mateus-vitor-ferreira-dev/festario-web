import { InputHTMLAttributes, ReactNode, useState } from "react";
import * as S from "./styles";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  id?: string;
  label?: string;
  error?: string;
  prefix?: ReactNode;
  showPasswordToggle?: boolean;
}

function EyeIcon({ visible }: { visible: boolean }) {
    return visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/**
 * Campo de formulário com suporte a label, mensagem de erro, prefixo e toggle de senha.
 *
 * @component
 * @param {object} props
 * @param {string} [props.id] - ID do input (vincula ao `<label>`)
 * @param {string} [props.label] - Texto do rótulo exibido acima do campo
 * @param {string} [props.error] - Mensagem de erro exibida abaixo do campo
 * @param {React.ReactNode} [props.prefix] - Conteúdo exibido antes do texto (ex.: ícone, símbolo)
 * @param {boolean} [props.showPasswordToggle] - Exibe botão para mostrar/ocultar senha
 * @param {...*} props - Demais atributos repassados ao `<input>` nativo
 */
export default function Input({
    id,
    label,
    error,
    prefix,
    showPasswordToggle,
    ...props
}: InputProps) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const resolvedType = showPasswordToggle
        ? (passwordVisible ? "text" : "password")
        : props.type;

    const errorId = id ? `${id}-error` : error ? `${props.name}-error` : undefined;
    const a11yProps = {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error && errorId ? errorId : undefined,
    };

    return (
        <S.Container>
            {label && <S.Label htmlFor={id}>{label}</S.Label>}

            {prefix ? (
                <S.InputWrapper $error={!!error}>
                    <S.Prefix>{prefix}</S.Prefix>
                    <S.Divider />
                    <S.InnerInput id={id} {...a11yProps} {...props} />
                </S.InputWrapper>
            ) : showPasswordToggle ? (
                <S.InputWrapper $error={!!error}>
                    <S.InnerInput id={id} {...a11yProps} {...props} type={resolvedType} />
                    <S.ToggleButton
                        type="button"
                        onClick={() => setPasswordVisible((v) => !v)}
                        aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                    >
                        <EyeIcon visible={passwordVisible} />
                    </S.ToggleButton>
                </S.InputWrapper>
            ) : (
                <S.Input id={id} {...a11yProps} {...props} $error={!!error} />
            )}

            {error && <S.Error id={errorId} role="alert">{error}</S.Error>}
        </S.Container>
    );
}
