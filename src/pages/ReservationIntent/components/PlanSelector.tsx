import { useRef, type KeyboardEvent } from "react";
import { PLANS, isPlanAvailableForDate } from "../../../constants/reservation";
import { formatCents } from "../../../utils/reservationFormat";
import type { PlanCode } from "../../../types";
import * as S from "../styles";

interface PlanSelectorProps {
    eventDate: string;
    planCode: string;
    onPlanClick: (code: PlanCode) => void;
}

/**
 * Grid de seleção de planos com disponibilidade por data.
 *
 * Acessível como `radiogroup`: Tab entra no grupo (opção selecionada ou a
 * primeira habilitada), setas movem o foco entre opções habilitadas e
 * Enter/Espaço selecionam usando o mesmo handler do clique.
 */
export function PlanSelector({ eventDate, planCode, onPlanClick }: PlanSelectorProps) {
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

    const options = PLANS.map((plan) => ({
        plan,
        disabled: eventDate ? !isPlanAvailableForDate(plan.code, eventDate) : false,
        selected: planCode === plan.code,
    }));

    const selectedIndex = options.findIndex((o) => o.selected && !o.disabled);
    const firstEnabledIndex = options.findIndex((o) => !o.disabled);
    const tabStopIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex;

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

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number, code: PlanCode) {
        switch (event.key) {
            case "Enter":
            case " ":
                event.preventDefault();
                onPlanClick(code);
                break;
            case "ArrowDown":
            case "ArrowRight":
                event.preventDefault();
                focusSibling(index, 1);
                break;
            case "ArrowUp":
            case "ArrowLeft":
                event.preventDefault();
                focusSibling(index, -1);
                break;
            default:
                break;
        }
    }

    return (
        <S.Card className="anim-card">
            <S.CardTitle id="plan-selector-title">Escolha a modalidade</S.CardTitle>
            <S.CardDescription>
                {eventDate
                    ? "As modalidades disponíveis para a data selecionada estão habilitadas abaixo."
                    : "Selecione uma data primeiro para ver as modalidades disponíveis."}
            </S.CardDescription>

            <S.PlanGrid role="radiogroup" aria-labelledby="plan-selector-title">
                {options.map(({ plan, disabled, selected }, index) => (
                    <S.PlanCard
                        key={plan.code}
                        ref={(el) => { optionRefs.current[index] = el; }}
                        role="radio"
                        aria-checked={selected}
                        aria-disabled={disabled || undefined}
                        tabIndex={index === tabStopIndex ? 0 : -1}
                        $selected={selected}
                        $disabled={disabled}
                        onClick={() => onPlanClick(plan.code)}
                        onKeyDown={(e) => handleKeyDown(e, index, plan.code)}
                    >
                        <S.PlanLabel>{plan.label}</S.PlanLabel>
                        <S.PlanDays>{plan.days}</S.PlanDays>
                        <S.PlanPrice>{formatCents(plan.priceCents)}</S.PlanPrice>
                    </S.PlanCard>
                ))}
            </S.PlanGrid>
        </S.Card>
    );
}
