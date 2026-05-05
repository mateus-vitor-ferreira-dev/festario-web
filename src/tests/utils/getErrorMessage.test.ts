import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../../utils/getErrorMessage";

describe("getErrorMessage", () => {
    it("returns translated message from response.data.message", () => {
        const error = { response: { data: { message: "Venue not found" } } };
        expect(getErrorMessage(error)).toBe("Salão não encontrado.");
    });

    it("returns translated message from response.data.error.message", () => {
        const error = { response: { data: { error: { message: "User not found" } } } };
        expect(getErrorMessage(error)).toBe("Usuário não encontrado.");
    });

    it("returns error.message when there is no response", () => {
        const error = { message: "Network Error" };
        expect(getErrorMessage(error)).toBe("Network Error");
    });

    it("returns fallback when error has no message at all", () => {
        expect(getErrorMessage({}, "Erro padrão")).toBe("Erro padrão");
    });

    it("returns default fallback when no fallback is provided", () => {
        expect(getErrorMessage({})).toBe("Ocorreu um erro inesperado.");
    });

    it("returns untranslated message when key is not in the map", () => {
        const error = { message: "Unknown error message" };
        expect(getErrorMessage(error)).toBe("Unknown error message");
    });
});
