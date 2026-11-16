import { describe, expect, it } from "vitest";

import { scrubUrl } from "../../config/sentry";
import { safeHexColor } from "../../utils/color";
import { instagramHref, mailtoHref, safeHttpUrl } from "../../utils/safeUrl";

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

describe("mailtoHref", () => {
    it("só endereço simples vira mailto:", () => {
        expect(mailtoHref("oi@jardim.com")).toBe("mailto:oi@jardim.com");
        expect(mailtoHref(" ana.souza+festa@salao-x.com.br ")).toBe("mailto:ana.souza+festa@salao-x.com.br");
        expect(mailtoHref("a@b.com?bcc=c@d.com")).toBeNull();
        expect(mailtoHref("a&cc=c@d.com")).toBeNull();
        expect(mailtoHref("a=b@d.com")).toBeNull();
        expect(mailtoHref("a%0d%0abcc@d.com")).toBeNull();
        expect(mailtoHref("a b@d.com")).toBeNull();
        expect(mailtoHref("a@d.com\r\nbcc: x@y.com")).toBeNull();
        expect(mailtoHref("a@b@d.com")).toBeNull();
        expect(mailtoHref("sem-arroba.com")).toBeNull();
        expect(mailtoHref("a@localhost")).toBeNull();
        expect(mailtoHref(`${"a".repeat(250)}@d.com`)).toBeNull();
        expect(mailtoHref("")).toBeNull();
        expect(mailtoHref(null)).toBeNull();
    });
});

describe("instagramHref", () => {
    it("monta o link a partir do @, codificando o que não for do handle", () => {
        expect(instagramHref("@jardim")).toBe("https://instagram.com/jardim");
        expect(instagramHref(" jardim.festas ")).toBe("https://instagram.com/jardim.festas");
        expect(instagramHref("../../evil?x=1")).toBe("https://instagram.com/..%2F..%2Fevil%3Fx%3D1");
        expect(instagramHref("@")).toBeNull();
        expect(instagramHref("  ")).toBeNull();
        expect(instagramHref(null)).toBeNull();
    });

    it("URL completa só passa se for do Instagram", () => {
        expect(instagramHref("https://www.instagram.com/salaolagoa")).toBe("https://www.instagram.com/salaolagoa");
        expect(instagramHref("https://instagram.com/salao")).toBe("https://instagram.com/salao");
        expect(instagramHref("https://evil.example/instagram.com")).toBeNull();
        expect(instagramHref("https://instagram.com.evil.example/x")).toBeNull();
        expect(instagramHref("https://user@evil.example/x")).toBeNull();
        expect(instagramHref("https://")).toBeNull();
    });
});

describe("safeHexColor", () => {
    it("aceita só #rgb e #rrggbb", () => {
        expect(safeHexColor("#1f6b4f")).toBe("#1f6b4f");
        expect(safeHexColor("#ABC")).toBe("#ABC");
        expect(safeHexColor("#1f6b4")).toBeNull();
        expect(safeHexColor("#1f6b4f00")).toBeNull();
        expect(safeHexColor("red")).toBeNull();
        expect(safeHexColor("#fff;background:url(x)")).toBeNull();
        expect(safeHexColor(" #fff")).toBeNull();
        expect(safeHexColor(null)).toBeNull();
        expect(safeHexColor(undefined)).toBeNull();
    });
});

describe("scrubUrl", () => {
    it("tira o valor dos tokens da query e do link de convite", () => {
        expect(scrubUrl("https://app.festario.com.br/redefinir-senha?token=abc123&x=1")).toBe("https://app.festario.com.br/redefinir-senha?token=[removido]&x=1");
        expect(scrubUrl("/verificar?a=1&code=xyz")).toBe("/verificar?a=1&code=[removido]");
        expect(scrubUrl("https://app.festario.com.br/convite/9f8e7d?x=1")).toBe("https://app.festario.com.br/convite/[removido]?x=1");
        expect(scrubUrl("/saloes?cidade=Lavras")).toBe("/saloes?cidade=Lavras");
        const token = "a".repeat(64);
        expect(scrubUrl(`https://api.festario.com.br/owner-invites/${token}/accept`)).toBe("https://api.festario.com.br/owner-invites/[removido]/accept");
        // segmento com cara de token em qualquer outra rota também sai; UUID (36 com hífens) idem
        expect(scrubUrl(`https://api.festario.com.br/x/${"b1".repeat(20)}`)).toBe("https://api.festario.com.br/x/[removido]");
        expect(scrubUrl("/s/recanto-vila-rica")).toBe("/s/recanto-vila-rica");
    });
});
