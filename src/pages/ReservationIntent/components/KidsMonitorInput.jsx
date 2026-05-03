import * as S from "../styles";

/**
 * Card de configuração de horas do monitor da área kids.
 *
 * @param {{ kidsMonitorHours: number, minimumKidsHours: number, onChange: (hours: number) => void }} props
 */
export function KidsMonitorInput({ kidsMonitorHours, minimumKidsHours, onChange }) {
    return (
        <S.Card className="anim-card">
            <S.CardTitle>Área Kids com monitor</S.CardTitle>
            <S.CardDescription>
                O plano selecionado inclui {minimumKidsHours} horas de monitor. Caso deseje mais tempo,
                cada hora adicional será cobrada à parte.
            </S.CardDescription>

            <S.OptionItem>
                <div>
                    <strong>Horas do monitor</strong>
                    <span>{minimumKidsHours}h incluídas no plano. Horas adicionais: R$ 30,00/h</span>
                </div>
                <S.KidsInput
                    type="number"
                    min={minimumKidsHours}
                    max="12"
                    value={kidsMonitorHours}
                    onChange={(e) => onChange(Math.max(minimumKidsHours, Number(e.target.value) || 0))}
                />
            </S.OptionItem>
        </S.Card>
    );
}
