import { useEffect, type ReactNode } from "react";
import * as S from "./styles";

interface ModalHeaderProps {
    children: ReactNode;
    /** Mesmo handler do botão Cancelar/Fechar do modal. */
    onClose: () => void;
    /** Bloqueia o fechamento (ex.: enquanto salva). */
    disabled?: boolean;
}

/**
 * Cabeçalho dos modais do painel admin: título + botão "X" fixo no topo.
 * Também fecha com Esc enquanto o modal está montado.
 */
export function ModalHeader({ children, onClose, disabled = false }: ModalHeaderProps) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !disabled) onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose, disabled]);

    return (
        <S.ModalHeader>
            <S.ModalTitle>{children}</S.ModalTitle>
            <S.ModalClose type="button" aria-label="Fechar janela" onClick={onClose} disabled={disabled}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </S.ModalClose>
        </S.ModalHeader>
    );
}
