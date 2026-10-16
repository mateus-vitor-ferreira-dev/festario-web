import { describe, expect, it } from "vitest";
import { safeReturnPath, withReturn } from "../../utils/returnPath";

describe("returnPath", () => {
    it("aceita caminhos do app, com busca", () => {
        expect(safeReturnPath("/s/jardim?reservar=v1")).toBe("/s/jardim?reservar=v1");
        expect(safeReturnPath("/reservations")).toBe("/reservations");
    });

    it("recusa endereços externos e disfarçados", () => {
        for (const bad of ["https://site.com", "//site.com", "/\\\\site.com", "javascript:alert(1)", "site.com", "/\\nsite", "", null, undefined]) {
            expect(safeReturnPath(bad as string)).toBeNull();
        }
        expect(safeReturnPath("/ok\u0000")).toBeNull();
    });

    it("monta o link de login ou cadastro só com caminho válido", () => {
        expect(withReturn("/login", "/saloes?city=Lavras")).toBe("/login?voltar=%2Fsaloes%3Fcity%3DLavras");
        expect(withReturn("/cadastro", "//site.com")).toBe("/cadastro");
        expect(withReturn("/login", null)).toBe("/login");
    });
});
