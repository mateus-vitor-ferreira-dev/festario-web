import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import type { NavItem } from "./navItems";
import * as S from "./styles";

interface AccountMenuProps {
    name: string;
    initials: string;
    items: NavItem[];
    onLogout: () => void;
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s ease" }}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

/**
 * Menu da conta (telas largas): o avatar abre uma lista de links com o perfil e o que se usa de vez
 * em quando, e o "Sair" separado no fim. É uma lista que abre e fecha (disclosure), não um menu de
 * aplicativo: Tab percorre os links, Esc fecha e devolve o foco ao botão, clicar fora também fecha.
 */
export default function AccountMenu({ name, initials, items, onLogout }: AccountMenuProps) {
    const { pathname } = useLocation();
    // O menu lembra em qual página abriu: trocar de página já o fecha, sem efeito colateral.
    const [openAt, setOpenAt] = useState<string | null>(null);
    const open = openAt === pathname;
    const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
        setOpenAt((cur) => ((typeof next === "function" ? next(cur === pathname) : next) ? pathname : null));
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const listId = useId();

    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        }
        function onPointer(e: PointerEvent) {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        }
        // O foco saindo do menu pelo Tab também fecha.
        function onFocus(e: FocusEvent) {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("focusin", onFocus);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("focusin", onFocus);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const first = name.split(" ")[0];
    const inAccount = items.some((i) => i.match(pathname));

    return (
        <S.AccountWrap ref={wrapRef}>
            <S.AccountButton
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                $current={inAccount}
                onClick={() => setOpen((o) => !o)}
            >
                <S.Avatar aria-hidden="true">{initials}</S.Avatar>
                <S.UserInfo>
                    <span>Olá,</span>
                    <strong>{first}</strong>
                </S.UserInfo>
                <S.VisuallyHidden>: menu da conta</S.VisuallyHidden>
                <Chevron open={open} />
            </S.AccountButton>

            {open && (
                <S.AccountPanel id={listId}>
                    <S.AccountName>{name}</S.AccountName>
                    <ul>
                        {items.map((item) => {
                            const active = item.match(pathname);
                            return (
                                <li key={item.to}>
                                    <S.AccountLink as={Link} to={item.to} $active={active} aria-current={active ? "page" : undefined}>
                                        {item.label}
                                    </S.AccountLink>
                                </li>
                            );
                        })}
                    </ul>
                    <S.AccountDivider />
                    <S.AccountLogout type="button" onClick={onLogout}>Sair</S.AccountLogout>
                </S.AccountPanel>
            )}
        </S.AccountWrap>
    );
}
