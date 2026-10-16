import styled from "styled-components";
import { Link } from "react-router-dom";
import { media } from "../../styles/breakpoints";

/* Peças próprias da área da plataforma. O resto (tabela, chips, modais, botões)
   vem de ../Admin/styles para manter o mesmo sistema visual do painel. */

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;

  & > :first-child {
    min-width: 0;
    flex: 1 1 320px;
  }

  ${media.sm} {
    & > button {
      width: 100%;
    }
  }
`;

/** Nome do espaço (link para o detalhe) + endereço em texto menor. */
export const NameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  white-space: normal;

  a {
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: underline;
    text-decoration-color: var(--border-medium);
    text-underline-offset: 3px;

    &:hover {
      color: var(--brand);
      text-decoration-color: currentColor;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-radius: var(--radius-sm);
    }

    ${media.md} {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }

  span {
    font-size: var(--text-xs);
    color: var(--text-muted);
    overflow-wrap: anywhere;
  }
`;

export const RowActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const BackLink = styled(Link)`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--brand);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    border-radius: var(--radius-sm);
  }

  svg {
    width: var(--icon-sm);
    height: var(--icon-sm);
  }
`;

/** Dados do espaço (endereço, plano, situação, criação) — lista de definição. */
export const MetaList = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 4px;

  & > div {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  dt {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  dd {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
`;

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  min-width: 0;

  ${media.sm} {
    padding: 16px;
  }
`;

export const PanelTitle = styled.h2`
  font-size: var(--text-xl);
  line-height: 1.2;
  color: var(--text-primary);
`;

export const PanelText = styled.p`
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--text-muted);
`;

/** Formulário em linha (e-mail + botão); empilha no celular. */
export const InlineForm = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  & > :first-child {
    flex: 1 1 280px;
    min-width: 0;
  }

  ${media.sm} {
    & > button {
      width: 100%;
    }
  }
`;

/** Link copiável (convite, login do espaço). */
export const LinkBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-md);
  background: var(--brand-subtle);
  min-width: 0;

  p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.45;
  }

  code {
    display: block;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    font-size: var(--text-sm);
    color: var(--text-primary);
    overflow-wrap: anywhere;
    word-break: break-all;
  }
`;

export const LinkActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  ${media.sm} {
    display: grid;
    grid-template-columns: 1fr;

    & > button {
      width: 100%;
    }
  }
`;

export const FieldError = styled.p`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--status-error-text);
`;

export const FieldHelp = styled.p`
  font-size: var(--text-xs);
  color: var(--text-muted);
  overflow-wrap: anywhere;
`;

/** Chip de situação do convite. */
export const InviteChip = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid;
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "valid":
        return "background: var(--status-pending-bg); color: var(--status-pending-text); border-color: var(--status-pending-border);";
      case "accepted":
        return "background: var(--status-paid-bg); color: var(--status-paid-text); border-color: var(--status-paid-border);";
      case "revoked":
        return "background: var(--status-error-bg); color: var(--status-error-text); border-color: var(--status-error-border);";
      default:
        return "background: var(--bg-muted); color: var(--text-muted); border-color: var(--border-default);";
    }
  }}
`;

export const Muted = styled.span`
  color: var(--text-muted);
`;

/** Erro de carregamento com a saída "Tentar de novo". */
export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px;
  border: 1px solid var(--status-error-border);
  border-radius: var(--radius-lg);
  background: var(--status-error-bg);

  h3 {
    font-size: var(--text-lg);
    color: var(--status-error-text);
  }

  p {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }
`;

/** Filtro único de situação dos convites (mesmo controle da barra de filtros). */
export const StatusFilter = styled.div`
  width: 260px;
  max-width: 100%;

  ${media.sm} {
    width: 100%;
  }
`;
