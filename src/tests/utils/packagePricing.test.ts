import { describe, expect, it } from "vitest";
import { describePackagePrice, packageBaseTotal, planBaseMath, pricingUnit } from "../../utils/packageFormat";
import { formatStartingPrice } from "../../utils/salonFormat";

describe("forma de cobrança do pacote", () => {
    it("descreve o preço com a unidade", () => {
        expect(describePackagePrice("1200.00", "FIXED")).toMatch(/^R\$\s?1\.200,00$/);
        expect(describePackagePrice("300.00", "PER_HOUR")).toMatch(/^R\$\s?300,00 por hora$/);
        expect(describePackagePrice(50, "PER_GUEST")).toMatch(/^R\$\s?50,00 por convidado$/);
        expect(describePackagePrice(900, undefined)).toMatch(/^R\$\s?900,00$/);
        expect(pricingUnit(null)).toBe("");
    });

    it("o \"a partir de\" da vitrine leva a unidade", () => {
        expect(formatStartingPrice(300, "PER_HOUR")).toMatch(/^R\$\s?300 por hora$/);
        expect(formatStartingPrice("1200", null)).toMatch(/^R\$\s?1\.200$/);
        expect(formatStartingPrice(null, "PER_GUEST")).toBeNull();
    });

    it("o exemplo do painel segue a regra da API: horas cheias e mínimos", () => {
        expect(packageBaseTotal(300, "PER_HOUR", { durationMinutes: 310, guests: 80 })).toEqual({ quantity: 6, total: 1800 });
        expect(packageBaseTotal(300, "PER_HOUR", { durationMinutes: 120, guests: 80, minDurationMinutes: 240 })).toEqual({ quantity: 4, total: 1200 });
        expect(packageBaseTotal(50, "PER_GUEST", { durationMinutes: 240, guests: 30, minGuests: 50 })).toEqual({ quantity: 50, total: 2500 });
        expect(packageBaseTotal(1200, "FIXED", { durationMinutes: 240, guests: 80 })).toEqual({ quantity: 1, total: 1200 });
    });

    it("a conta da linha do pacote no orçamento", () => {
        expect(planBaseMath({ quantity: 6, unitAmountCents: 30000, metadata: { pricingMode: "PER_HOUR" } })).toMatch(/^6 h × R\$\s?300,00$/);
        expect(planBaseMath({ quantity: 1, unitAmountCents: 5000, metadata: undefined }, { pricingMode: "PER_GUEST" })).toMatch(/^1 convidado × R\$\s?50,00$/);
        expect(planBaseMath({ quantity: 1, unitAmountCents: 120000, metadata: undefined })).toBeNull();
    });
});
