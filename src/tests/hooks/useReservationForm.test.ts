import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { useReservationForm } from "../../pages/ReservationIntent/useReservationForm";
import { quoteReservation, createReservation } from "../../services/reservation";

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("../../services/reservation", () => ({
    quoteReservation: vi.fn(),
    createReservation: vi.fn(),
}));

const mockQuote      = vi.mocked(quoteReservation);
const mockCreate     = vi.mocked(createReservation);
const toastWarning   = vi.mocked(toast.warning);
const toastInfo      = vi.mocked(toast.info);

const VENUE_ID = "venue-1";
// 2027-06-08 = Tuesday  → PROMOCIONAL only
const TUE = "2027-06-08";
// 2027-06-12 = Saturday → ESSENCIAL / COMPLETA only
const SAT = "2027-06-12";

function renderForm(venueId: string | undefined = VENUE_ID, hasKidsArea = false) {
    return renderHook(
        () => useReservationForm({ venueId, hasKidsArea }),
        { wrapper: MemoryRouter }
    );
}

beforeEach(() => {
    mockQuote.mockResolvedValue({
        totalCents: 85000, subtotalCents: 85000, discountCents: 0,
        discountApplied: false, planCode: "ESSENCIAL", currency: "BRL",
        items: [],
    });
    mockCreate.mockResolvedValue({ id: "res-new" } as never);
});

afterEach(() => vi.clearAllMocks());

// ─── handlePlanClick ──────────────────────────────────────────────────────────

describe("handlePlanClick", () => {
    it("sets planCode when plan is compatible with the date", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(TUE));
        act(() => result.current.handlePlanClick("PROMOCIONAL"));
        expect(result.current.planCode).toBe("PROMOCIONAL");
    });

    it("shows warning and keeps planCode empty when plan is incompatible", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(SAT));
        act(() => result.current.handlePlanClick("PROMOCIONAL"));
        expect(result.current.planCode).toBe("");
        expect(toastWarning).toHaveBeenCalledTimes(1);
    });

    it("allows ESSENCIAL on Saturday", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(SAT));
        act(() => result.current.handlePlanClick("ESSENCIAL"));
        expect(result.current.planCode).toBe("ESSENCIAL");
        expect(toastWarning).not.toHaveBeenCalled();
    });

    it("allows switching between compatible plans", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(SAT));
        act(() => result.current.handlePlanClick("ESSENCIAL"));
        act(() => result.current.handlePlanClick("COMPLETA"));
        expect(result.current.planCode).toBe("COMPLETA");
    });
});

// ─── handleDateChange ─────────────────────────────────────────────────────────

describe("handleDateChange", () => {
    it("updates eventDate", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(SAT));
        expect(result.current.eventDate).toBe(SAT);
    });

    it("resets planCode and shows info toast when plan becomes incompatible", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(TUE));
        act(() => result.current.handlePlanClick("PROMOCIONAL"));
        expect(result.current.planCode).toBe("PROMOCIONAL");

        act(() => result.current.handleDateChange(SAT)); // PROMOCIONAL not valid on Sat
        expect(result.current.planCode).toBe("");
        expect(toastInfo).toHaveBeenCalledTimes(1);
    });

    it("does not reset planCode when plan stays compatible", () => {
        const { result } = renderForm();
        act(() => result.current.handleDateChange(SAT));
        act(() => result.current.handlePlanClick("ESSENCIAL"));

        act(() => result.current.handleDateChange("2027-06-19")); // also a Saturday
        expect(result.current.planCode).toBe("ESSENCIAL");
        expect(toastInfo).not.toHaveBeenCalled();
    });
});

// ─── handleConfirmReservation — guards ────────────────────────────────────────

describe("handleConfirmReservation — validation guards", () => {
    it("returns early without calling createReservation when venueId is missing", async () => {
        const { result } = renderHook(
            () => useReservationForm({ venueId: undefined, hasKidsArea: false }),
            { wrapper: MemoryRouter }
        );
        await act(() => result.current.handleConfirmReservation());
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it("shows 'plano' warning when planCode is empty", async () => {
        const { result } = renderForm();
        act(() => { result.current.setStartTime("10:00"); result.current.setEndTime("16:00"); });
        await act(() => result.current.handleConfirmReservation());
        expect(toastWarning).toHaveBeenCalledWith(expect.stringMatching(/plano/i));
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it("shows 'data' warning when eventDate is missing", async () => {
        const { result } = renderForm();
        act(() => result.current.handlePlanClick("ESSENCIAL"));
        await act(() => result.current.handleConfirmReservation());
        expect(toastWarning).toHaveBeenCalledWith(expect.stringMatching(/data/i));
    });

    it("shows 'contrato' warning when acceptedContract is false", async () => {
        const { result } = renderForm();
        act(() => {
            result.current.handleDateChange(SAT);
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setStartTime("10:00");
            result.current.setEndTime("16:00");
        });
        await act(() => result.current.handleConfirmReservation());
        expect(toastWarning).toHaveBeenCalledWith(expect.stringMatching(/contrato/i));
    });

    it("shows 'término' warning when end time is before start time", async () => {
        const { result } = renderForm();
        act(() => {
            result.current.handleDateChange(SAT);
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setStartTime("18:00");
            result.current.setEndTime("10:00"); // before start
            result.current.setAcceptedContract(true);
        });
        await act(() => result.current.handleConfirmReservation());
        expect(toastWarning).toHaveBeenCalledWith(expect.stringMatching(/término/i));
    });
});

// ─── handleConfirmReservation — success ───────────────────────────────────────

describe("handleConfirmReservation — success", () => {
    it("calls createReservation with correct shape", async () => {
        const { result } = renderForm();
        act(() => {
            result.current.handleDateChange(SAT);
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setStartTime("10:00");
            result.current.setEndTime("16:00");
            result.current.setAcceptedContract(true);
        });

        await act(() => result.current.handleConfirmReservation());

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            venueId: VENUE_ID,
            planCode: "ESSENCIAL",
            termsAccepted: true,
        }));
        expect(result.current.submitting).toBe(false);
    });
});

// ─── minimumKidsHours / kidsMonitorExtraHours ─────────────────────────────────

describe("minimumKidsHours", () => {
    it("returns 0 when planCode is empty", () => {
        const { result } = renderForm(VENUE_ID, true);
        expect(result.current.minimumKidsHours).toBe(0);
    });

    it("returns 4 when a plan is selected (INCLUDED_KIDS_HOURS_BY_PLAN)", () => {
        const { result } = renderForm(VENUE_ID, true);
        act(() => result.current.handlePlanClick("ESSENCIAL"));
        expect(result.current.minimumKidsHours).toBe(4);
    });

    it("kidsMonitorExtraHours is 0 when hours equal minimum", () => {
        const { result } = renderForm(VENUE_ID, true);
        act(() => {
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setKidsMonitorHours(4);
        });
        expect(result.current.kidsMonitorExtraHours).toBe(0);
    });

    it("kidsMonitorExtraHours is positive when hours exceed minimum", () => {
        const { result } = renderForm(VENUE_ID, true);
        act(() => {
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setKidsMonitorHours(6);
        });
        expect(result.current.kidsMonitorExtraHours).toBe(2);
    });
});

// ─── COMPLETA price normalization ─────────────────────────────────────────────

describe("normalizedQuote — COMPLETA normalization", () => {
    it("corrects PLAN_BASE to R$1000 when API returns R$990", async () => {
        vi.useFakeTimers();

        mockQuote.mockResolvedValueOnce({
            totalCents: 99000,
            subtotalCents: 99000,
            discountCents: 0,
            discountApplied: false,
            planCode: "COMPLETA",
            currency: "BRL",
            items: [
                { description: "Base", type: "PLAN_BASE", amountCents: 99000, totalAmountCents: 99000 },
            ],
        });

        const { result } = renderForm();
        act(() => {
            result.current.handleDateChange(SAT);
            result.current.handlePlanClick("COMPLETA");
            result.current.setStartTime("09:00");
            result.current.setEndTime("23:00");
        });

        // Advance past 600ms debounce, then flush promise microtasks
        await act(async () => { vi.advanceTimersByTime(700); });
        await act(async () => { await Promise.resolve(); });

        vi.useRealTimers();

        await waitFor(() => expect(result.current.normalizedQuote).not.toBeNull(), { timeout: 2000 });

        const base = result.current.normalizedQuote?.items.find((i) => i.type === "PLAN_BASE");
        expect(base?.totalAmountCents).toBe(100_000);
    });

    it("returns quote unchanged for ESSENCIAL plan", async () => {
        vi.useFakeTimers();

        mockQuote.mockResolvedValueOnce({
            totalCents: 85000,
            subtotalCents: 85000,
            discountCents: 0,
            discountApplied: false,
            planCode: "ESSENCIAL",
            currency: "BRL",
            items: [
                { description: "Base", type: "PLAN_BASE", amountCents: 85000, totalAmountCents: 85000 },
            ],
        });

        const { result } = renderForm();
        act(() => {
            result.current.handleDateChange(SAT);
            result.current.handlePlanClick("ESSENCIAL");
            result.current.setStartTime("14:00");
            result.current.setEndTime("18:00");
        });

        await act(async () => { vi.advanceTimersByTime(700); });
        await act(async () => { await Promise.resolve(); });

        vi.useRealTimers();

        await waitFor(() => expect(result.current.normalizedQuote).not.toBeNull(), { timeout: 2000 });

        expect(result.current.normalizedQuote?.totalCents).toBe(85000);
    });
});
