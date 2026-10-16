import { useEffect, useState } from "react";
import styled from "styled-components";

import { listPackages } from "../../services/salonRules";
import { isAbortError } from "../../utils/errors";

interface AgendaClosedNoticeProps {
    /** Muda a cada troca de aba: o aviso confere de novo (o dono pode ter acabado de criar um pacote). */
    refreshKey: string;
    onCreatePackage: () => void;
}

/**
 * Aviso do painel enquanto o salão não tem nenhum pacote ativo: sem pacote, ninguém consegue reservar e o
 * salão não aparece na vitrine. Some sozinho quando o primeiro pacote é ativado.
 */
export function AgendaClosedNotice({ refreshKey, onCreatePackage }: AgendaClosedNoticeProps) {
    const [closed, setClosed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        listPackages(controller.signal)
            .then((packages) => setClosed(!packages.some((p) => p.isActive)))
            .catch((err) => { if (!isAbortError(err)) setClosed(false); });
        return () => controller.abort();
    }, [refreshKey]);

    if (!closed) return null;
    return (
        <Notice role="status" aria-labelledby="agenda-closed-title">
            <div>
                <h2 id="agenda-closed-title">Seu salão ainda não aparece na vitrine</h2>
                <p>Os clientes só encontram e reservam o salão depois que ele tiver pelo menos um pacote ativo, com os seus preços e horários.</p>
            </div>
            <button type="button" onClick={onCreatePackage}>Criar pacote</button>
        </Notice>
    );
}

const Notice = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--status-pending-border);
    background: var(--status-pending-bg);

    h2 {
        font-size: var(--text-lg);
        color: var(--status-pending-text-deep);
    }

    p {
        margin-top: 2px;
        max-width: 70ch;
        color: var(--status-pending-text);
        font-size: var(--text-sm);
        line-height: 1.5;
    }

    button {
        min-height: 44px;
        padding: 0 18px;
        border: 0;
        border-radius: var(--radius-md);
        background: var(--brand);
        color: var(--on-brand);
        font: inherit;
        font-size: var(--text-sm);
        font-weight: 700;
        cursor: pointer;
    }

    button:hover {
        background: var(--brand-dark);
    }

    button:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
    }
`;
