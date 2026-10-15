import { useRef, type KeyboardEvent } from "react";

import { TimeWindow, WeekStrip } from "../../../components/PackageVisuals";
import { describeDays, describeWindow, formatBRL, formatHours } from "../../../utils/packageFormat";
import type { VenuePackage } from "../../../types";
import * as S from "../styles";

interface PackageSelectorProps {
    packages: VenuePackage[];
    loading: boolean;
    eventDate: string;
    isHoliday: boolean;
    selectedId: string | null;
    onSelect: (pkg: VenuePackage) => void;
}

/** O que vem incluso, em uma frase: "Monitor na área kids (4h), Limpeza". */
function includedText(pkg: VenuePackage): string | null {
    const names = pkg.items
        .filter((it) => it.mode === "INCLUDED")
        .map((it) => (it.chargeType === "PER_HOUR" && it.includedQuantity ? `${it.name} (${it.includedQuantity}h)` : it.name));
    return names.length ? names.join(", ") : null;
}

/**
 * Pacotes do espaço como o salão cadastrou (web#37): nome, preço, a semana e o horário em que valem e o
 * que vem incluso. Com a data escolhida, o pacote que não vale no dia fica desabilitado.
 *
 * Acessível como `radiogroup`: Tab entra no grupo (opção selecionada ou a primeira habilitada), setas
 * movem o foco entre as habilitadas e Enter/Espaço selecionam.
 */
export function PackageSelector({ packages, loading, eventDate, isHoliday, selectedId, onSelect }: PackageSelectorProps) {
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

    const options = packages.map((pkg) => ({ pkg, disabled: pkg.availableOnDate === false, selected: pkg.id === selectedId }));
    const selectedIndex = options.findIndex((o) => o.selected && !o.disabled);
    const tabStopIndex = selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled);

    function focusSibling(from: number, step: 1 | -1) {
        const total = options.length;
        for (let i = 1; i <= total; i++) {
            const next = (from + step * i + total) % total;
            if (!options[next].disabled) {
                optionRefs.current[next]?.focus();
                return;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number, pkg: VenuePackage) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(pkg);
        } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            focusSibling(index, 1);
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            focusSibling(index, -1);
        }
    }

    const available = options.filter((o) => !o.disabled).length;

    return (
        <S.Card className="anim-card">
            <S.CardTitle id="package-selector-title">Escolha o pacote</S.CardTitle>
            <S.CardDescription>
                {!eventDate
                    ? "Cada pacote vale em certos dias e horários. Escolha a data para ver os que valem nela."
                    : available === 0
                        ? `Nenhum pacote vale nesta data${isHoliday ? " (feriado)" : ""}. Escolha outro dia.`
                        : `Pacotes que valem nesta data${isHoliday ? ", que é feriado" : ""}.`}
            </S.CardDescription>

            {loading && packages.length === 0 ? (
                <S.QuoteLoading>Carregando pacotes...</S.QuoteLoading>
            ) : packages.length === 0 ? (
                <S.Hint>Este espaço ainda não tem pacotes abertos para reserva. Fale com o salão pela página de contato.</S.Hint>
            ) : (
                <S.PlanGrid role="radiogroup" aria-labelledby="package-selector-title" aria-busy={loading}>
                    {options.map(({ pkg, disabled, selected }, index) => {
                        const included = includedText(pkg);
                        return (
                            <S.PlanCard
                                key={pkg.id}
                                ref={(el) => { optionRefs.current[index] = el; }}
                                role="radio"
                                aria-checked={selected}
                                aria-disabled={disabled || undefined}
                                tabIndex={index === tabStopIndex ? 0 : -1}
                                $selected={selected}
                                $disabled={disabled}
                                onClick={() => onSelect(pkg)}
                                onKeyDown={(e) => handleKeyDown(e, index, pkg)}
                            >
                                <S.PlanLabel>{pkg.name}</S.PlanLabel>
                                <S.PlanDays>
                                    {disabled
                                        ? <S.PlanUnavailable>Não vale nesta data</S.PlanUnavailable>
                                        : `${describeDays(pkg.validWeekdays, pkg.validOnHolidays)}. ${describeWindow(pkg.earliestStartMinute, pkg.latestEndMinute)}${pkg.maxDurationMinutes ? `, até ${formatHours(pkg.maxDurationMinutes)} de festa` : ""}.`}
                                </S.PlanDays>
                                <S.PlanPrice>{formatBRL(pkg.basePriceAmount)}</S.PlanPrice>
                                <S.PlanDetails>
                                    <WeekStrip weekdays={pkg.validWeekdays} holidays={pkg.validOnHolidays} compact />
                                    <TimeWindow earliest={pkg.earliestStartMinute} latest={pkg.latestEndMinute} />
                                    {pkg.description && <p>{pkg.description}</p>}
                                    {included && <p>Incluso: {included}</p>}
                                    {pkg.maxGuests != null && <p>Até {pkg.maxGuests} convidados{pkg.minGuests ? ` (mínimo ${pkg.minGuests})` : ""}.</p>}
                                </S.PlanDetails>
                            </S.PlanCard>
                        );
                    })}
                </S.PlanGrid>
            )}
        </S.Card>
    );
}
