/**
 * @module hooks/useDebouncedCallback
 * @description Retorna uma função que só executa `fn` depois de `delay` ms sem
 * novas chamadas. `flush` executa imediatamente a última chamada pendente e
 * `cancel` a descarta. O temporizador é limpo ao desmontar.
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
    const fnRef = useRef(fn);
    useLayoutEffect(() => {
        fnRef.current = fn;
    });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pending = useRef<A | null>(null);

    const cancel = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        pending.current = null;
    }, []);

    const flush = useCallback(() => {
        const args = pending.current;
        cancel();
        if (args) fnRef.current(...args);
    }, [cancel]);

    const debounced = useCallback((...args: A) => {
        if (timer.current) clearTimeout(timer.current);
        pending.current = args;
        timer.current = setTimeout(flush, delay);
    }, [delay, flush]);

    useEffect(() => cancel, [cancel]);

    return { debounced, flush, cancel };
}
