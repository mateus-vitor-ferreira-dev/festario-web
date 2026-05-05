import { describe, expect, it } from "vitest";
import { translateApiMessage } from "../../utils/translateApiMessage";

describe("translateApiMessage", () => {
    it("translates a known message", () => {
        expect(translateApiMessage("Venue not found")).toBe("Salão não encontrado.");
    });

    it("returns the original message when not in the map", () => {
        expect(translateApiMessage("Some unknown message")).toBe("Some unknown message");
    });

    it("returns default error when message is null", () => {
        expect(translateApiMessage(null)).toBe("Ocorreu um erro inesperado.");
    });

    it("returns default error when message is undefined", () => {
        expect(translateApiMessage(undefined)).toBe("Ocorreu um erro inesperado.");
    });

    it("returns default error when message is empty string", () => {
        expect(translateApiMessage("")).toBe("Ocorreu um erro inesperado.");
    });
});
