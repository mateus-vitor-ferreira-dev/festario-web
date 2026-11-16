import { describe, expect, it } from "vitest";

import { scrubUrl } from "../../config/sentry";
import { safeHttpUrl } from "../../utils/safeUrl";

describe("safeHttpUrl", () => {
    it("aceita só http e https", () => {
        expect(safeHttpUrl("https://maps.google.com/?q=Lavras")).toBe("https://maps.google.com/?q=Lavras");
        expect(safeHttpUrl("http://instagram.com/salao")).toBe("http://instagram.com/salao");
        expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
        expect(safeHttpUrl(" JaVaScRiPt:alert(1)")).toBeNull();
        expect(safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
        expect(safeHttpUrl("não é url")).toBeNull();
        expect(safeHttpUrl(null)).toBeNull();
    });
});

describe("scrubUrl", () => {
    it("tira o valor dos tokens da query e do link de convite", () => {
        expect(scrubUrl("https://app.festario.com.br/redefinir-senha?token=abc123&x=1")).toBe("https://app.festario.com.br/redefinir-senha?token=[removido]&x=1");
        expect(scrubUrl("/verificar?a=1&code=xyz")).toBe("/verificar?a=1&code=[removido]");
        expect(scrubUrl("https://app.festario.com.br/convite/9f8e7d?x=1")).toBe("https://app.festario.com.br/convite/[removido]?x=1");
        expect(scrubUrl("/saloes?cidade=Lavras")).toBe("/saloes?cidade=Lavras");
    });
});
