import { describe, expect, it } from "vitest";
import { initials, pickVariant, srcSet } from "../../utils/images";
import { AA, contrast, formatRatio } from "../../utils/color";

const V = [
    { width: 960, height: 640, url: "m.webp" },
    { width: 480, height: 320, url: "s.webp" },
    { width: 1600, height: 1067, url: "l.webp" },
];

describe("imagens em vários tamanhos", () => {
    it("monta o srcset e escolhe o menor tamanho que serve", () => {
        expect(srcSet(V)).toBe("m.webp 960w, s.webp 480w, l.webp 1600w");
        expect(srcSet([])).toBeUndefined();
        expect(pickVariant(V, 500)?.url).toBe("m.webp");
        expect(pickVariant(V, 4000)?.url).toBe("l.webp");
        expect(pickVariant(null, 100)).toBeNull();
    });

    it("iniciais ignoram de/da/das", () => {
        expect(initials("Recanto Vila Rica")).toBe("RV");
        expect(initials("Salão das Flores")).toBe("SF");
        expect(initials("Jardim")).toBe("JA");
        expect(initials("")).toBe("?");
    });
});

describe("contraste", () => {
    it("o anil passa com texto branco; o milho não", () => {
        expect(contrast("#27357e", "#ffffff")).toBeGreaterThan(AA);
        expect(contrast("#f4b41a", "#ffffff")).toBeLessThan(AA);
        expect(formatRatio(4.5)).toBe("4,5:1");
    });
});
