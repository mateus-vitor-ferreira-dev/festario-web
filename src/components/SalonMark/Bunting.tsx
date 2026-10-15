/**
 * Fileira de bandeirinhas: o mesmo motivo do símbolo do Festário, nas cores da festa e do salão.
 * Decorativa (aria-hidden); quem descreve é o texto ao lado.
 */
export function Bunting({ flags = 5, className }: { flags?: number; className?: string }) {
    const colors = ["var(--salon-accent)", "var(--gold)", "var(--festive)"];
    const step = 100 / flags;
    return (
        <svg className={className} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M0 3 Q50 11 100 3" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            {Array.from({ length: flags }, (_, i) => {
                const x = i * step + step * 0.15;
                const w = step * 0.7;
                // a corda faz uma curva: as bandeiras do meio penduram mais baixo
                const t = (x + w / 2) / 100;
                const y = 3 + 8 * 4 * t * (1 - t) * 0.5;
                return <polygon key={i} points={`${x},${y} ${x + w},${y} ${x + w / 2},${y + 13}`} fill={colors[i % colors.length]} />;
            })}
        </svg>
    );
}
