import { PLANS, isPlanAvailableForDate } from "../../../constants/reservation";
import { formatCents } from "../../../utils/reservationFormat";
import * as S from "../styles";

interface PlanSelectorProps {
    eventDate: string;
    planCode: string;
    onPlanClick: (code: string) => void;
}

/**
 * Grid de seleção de planos com disponibilidade por data.
 */
export function PlanSelector({ eventDate, planCode, onPlanClick }: PlanSelectorProps) {
    return (
        <S.Card className="anim-card">
            <S.CardTitle>Escolha a modalidade</S.CardTitle>
            <S.CardDescription>
                {eventDate
                    ? "As modalidades disponíveis para a data selecionada estão habilitadas abaixo."
                    : "Selecione uma data primeiro para ver as modalidades disponíveis."}
            </S.CardDescription>

            <S.PlanGrid>
                {PLANS.map((plan) => {
                    const available = isPlanAvailableForDate(plan.code, eventDate);
                    return (
                        <S.PlanCard
                            key={plan.code}
                            $selected={planCode === plan.code}
                            $disabled={eventDate ? !available : false}
                            onClick={() => onPlanClick(plan.code)}
                        >
                            <S.PlanLabel>{plan.label}</S.PlanLabel>
                            <S.PlanDays>{plan.days}</S.PlanDays>
                            <S.PlanPrice>{formatCents(plan.priceCents)}</S.PlanPrice>
                        </S.PlanCard>
                    );
                })}
            </S.PlanGrid>
        </S.Card>
    );
}
