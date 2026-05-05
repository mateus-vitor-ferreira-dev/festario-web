import { describe, expect, it } from "vitest";
import { formatPhone } from "../../utils/formatPhone";

describe("formatPhone", () => {
    it("returns empty string when value is null", () => {
        expect(formatPhone(null)).toBe("");
    });

    it("formats when length is up to 2 digits", () => {
        expect(formatPhone("12")).toBe("(12");
    });

    it("formats when length is between 3 and 6 digits", () => {
        expect(formatPhone("123456")).toBe("(12) 3456");
    });

    it("formats landline numbers with 10 digits", () => {
        expect(formatPhone("3198765432")).toBe("(31) 9876-5432");
    });

    it("formats mobile numbers with 11 digits", () => {
        expect(formatPhone("31987654321")).toBe("(31) 98765-4321");
    });

    it("removes non-digit characters and limits to 11 digits", () => {
        expect(formatPhone("(31) 9 8765-4321 99")).toBe("(31) 98765-4321");
    });
});