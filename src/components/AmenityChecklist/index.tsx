import { Fragment } from "react";

import { AMENITY_GROUPS, sortAmenities } from "../../constants/amenities";
import * as F from "../FilterBar/styles";

interface AmenityChecklistProps {
    value: string[];
    onChange: (value: string[]) => void;
    /** Marcadas por outro motivo (piscina ou área kids cobradas): aparecem marcadas e não se desmarcam aqui. */
    locked?: Record<string, string>;
}

/** Comodidades em pílulas, por grupo (estrutura e serviços), para o dono marcar o que o espaço oferece. */
export default function AmenityChecklist({ value, onChange, locked = {} }: AmenityChecklistProps) {
    const selected = new Set(value);
    function toggle(code: string) {
        const next = new Set(selected);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        onChange(sortAmenities([...next]));
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {AMENITY_GROUPS.map((g) => (
                <F.MultiGroup key={g.key}>
                    <legend>{g.label}</legend>
                    <F.PillList>
                        {g.items.map((item) => {
                            const reason = locked[item.value];
                            const on = Boolean(reason) || selected.has(item.value);
                            return (
                                <Fragment key={item.value}>
                                    <F.Pill $on={on} title={reason} style={reason ? { cursor: "default" } : undefined}>
                                        <input type="checkbox" checked={on} disabled={Boolean(reason)} onChange={() => toggle(item.value)} aria-describedby={reason ? `lock-${item.value}` : undefined} />
                                        <span>{item.label}</span>
                                    </F.Pill>
                                    {/* O motivo fica fora do rótulo: o nome continua "Piscina" e o leitor de tela lê o porquê. */}
                                    {reason && <span id={`lock-${item.value}`} hidden>{reason}</span>}
                                </Fragment>
                            );
                        })}
                    </F.PillList>
                </F.MultiGroup>
            ))}
        </div>
    );
}
