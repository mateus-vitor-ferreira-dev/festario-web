import { describe, expect, it } from "vitest";

import { formatEventDate, formatPhoneDigits, formatProviderPrice, whatsappLink } from "../../utils/providerFormat";

describe("providerFormat", () => {
    it("preço com a unidade; preço fixo sem sufixo; sem preço é nulo", () => {
        expect(formatProviderPrice(65, "PER_GUEST")).toMatch(/^R\$\s?65 por convidado$/);
        expect(formatProviderPrice(1800, "FIXED")).toMatch(/^R\$\s?1\.800$/);
        expect(formatProviderPrice(null, "FIXED")).toBeNull();
    });

    it("WhatsApp com DDI, mensagem codificada e número curto demais recusado", () => {
        expect(whatsappLink("(35) 99999-0000", "Olá!")).toBe("https://wa.me/5535999990000?text=Ol%C3%A1!");
        expect(whatsappLink("5535999990000")).toBe("https://wa.me/5535999990000");
        expect(whatsappLink("1234")).toBeNull();
    });

    it("telefone guardado em dígitos volta formatado", () => {
        expect(formatPhoneDigits("35999990000")).toBe("(35) 99999-0000");
        expect(formatPhoneDigits("3532210000")).toBe("(35) 3221-0000");
    });

    it("data da festa por extenso, sem virar o dia pelo fuso", () => {
        expect(formatEventDate("2026-11-21")).toBe("sábado, 21 de novembro de 2026");
        expect(formatEventDate("2026-11-21", { weekday: false })).toBe("21 de novembro de 2026");
    });
});
