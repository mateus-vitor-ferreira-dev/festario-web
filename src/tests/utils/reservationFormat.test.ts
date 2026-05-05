import { describe, expect, it } from "vitest";
import {
    PLAN_LABELS,
    calcDuration,
    formatCurrency,
    formatDate,
    formatDateFull,
    formatTime,
} from "../../utils/reservationFormat";

describe("reservationFormat utils", () => {
    it("exports expected plan labels", () => {
        expect(PLAN_LABELS.PROMOCIONAL).toBe("Promocional");
        expect(PLAN_LABELS.ESSENCIAL).toBe("Essencial");
        expect(PLAN_LABELS.COMPLETA).toBe("Completa");
    });

    it("formats date in pt-BR", () => {
        expect(formatDate("2026-04-20T12:00:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("formats full date", () => {
        const result = formatDateFull("2026-04-20T12:00:00.000Z");

        expect(result).toContain("2026");
    });

    it("formats time", () => {
        expect(formatTime("2026-04-20T15:30:00.000Z")).toMatch(/\d{2}:\d{2}/);
    });

    it("formats currency", () => {
        const result = formatCurrency(850);

        expect(result).toContain("R$");
    });

    it("calculates duration", () => {
        expect(
            calcDuration(
                "2026-04-20T10:00:00.000Z",
                "2026-04-20T15:00:00.000Z"
            )
        ).toBe(5);
    });

    it("handles fractional duration", () => {
        expect(
            calcDuration(
                "2026-04-20T10:00:00.000Z",
                "2026-04-20T11:29:00.000Z"
            )
        ).toBe(1);
    });
});