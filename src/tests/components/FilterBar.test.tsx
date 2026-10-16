import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
    ActiveFilterChips,
    DateField,
    FilterBar,
    MoneyRangeField,
    NoResults,
    SelectField,
    TextField,
    parseMoney,
} from "../../components/FilterBar";

describe("parseMoney", () => {
    it("accepts pt-BR and plain formats", () => {
        expect(parseMoney("1.500,50")).toBe("1500.5");
        expect(parseMoney("1500")).toBe("1500");
        expect(parseMoney("1.200")).toBe("1200");
        expect(parseMoney("1.234.567")).toBe("1234567");
        expect(parseMoney("12.5")).toBe("12.5");
        expect(parseMoney("R$ 99,9")).toBe("99.9");
        expect(parseMoney("abc")).toBe("");
        expect(parseMoney("1.2.3")).toBe("");
    });
});

describe("FilterBar", () => {
    it("labels every field and shows the active count on the mobile toggle", async () => {
        const user = userEvent.setup();
        render(
            <FilterBar activeCount={2} label="Filtrar reservas">
                <SelectField label="Status" value="" onChange={() => {}} options={[{ value: "", label: "Todos" }]} />
                <DateField label="Evento a partir de" value="" onChange={() => {}} />
            </FilterBar>,
        );
        expect(screen.getByRole("search", { name: "Filtrar reservas" })).toBeInTheDocument();
        expect(screen.getByLabelText("Status")).toBeInTheDocument();
        expect(screen.getByLabelText("Evento a partir de")).toBeInTheDocument();
        // o botão só aparece em telas ≤ md (no jsdom vale o CSS de desktop)
        const toggle = screen.getByText("Filtros (2)").closest("button")!;
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    it("shows plain 'Filtros' with no active filter", () => {
        render(<FilterBar><span /></FilterBar>);
        expect(screen.getByText("Filtros").closest("button")).toBeInTheDocument();
    });

    it("SelectField and DateField report the new value", () => {
        const onSelect = vi.fn();
        const onDate = vi.fn();
        render(
            <FilterBar>
                <SelectField label="Plano" value="" onChange={onSelect} options={[{ value: "", label: "Todos" }, { value: "COMPLETA", label: "Completa" }]} />
                <DateField label="Até" value="" onChange={onDate} />
            </FilterBar>,
        );
        fireEvent.change(screen.getByLabelText("Plano"), { target: { value: "COMPLETA" } });
        expect(onSelect).toHaveBeenCalledWith("COMPLETA");
        fireEvent.change(screen.getByLabelText("Até"), { target: { value: "2026-12-01" } });
        expect(onDate).toHaveBeenCalledWith("2026-12-01");
    });
});

describe("TextField", () => {
    it("debounces typing and applies Enter immediately", () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        render(<TextField label="Cliente" value="" onChange={onChange} />);
        const input = screen.getByLabelText("Cliente");

        fireEvent.change(input, { target: { value: "lu" } });
        fireEvent.change(input, { target: { value: "luc" } });
        expect(onChange).not.toHaveBeenCalled();
        act(() => { vi.advanceTimersByTime(300); });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("luc");

        fireEvent.change(input, { target: { value: "lucas" } });
        fireEvent.keyDown(input, { key: "Enter" });
        expect(onChange).toHaveBeenLastCalledWith("lucas");
        vi.useRealTimers();
    });

    it("resets the draft when the applied value changes from outside", () => {
        const { rerender } = render(<TextField label="Cliente" value="ana" onChange={() => {}} />);
        expect(screen.getByLabelText("Cliente")).toHaveValue("ana");
        rerender(<TextField label="Cliente" value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Cliente")).toHaveValue("");
    });
});

describe("MoneyRangeField", () => {
    it("parses each side and keeps the other one", () => {
        const onChange = vi.fn();
        render(<MoneyRangeField label="Valor da reserva" min="100" max="" onChange={onChange} />);
        expect(screen.getByRole("group", { name: "Valor da reserva" })).toBeInTheDocument();
        const max = screen.getByLabelText(/valor máximo em reais/i);
        fireEvent.change(max, { target: { value: "1.500,00" } });
        fireEvent.blur(max);
        expect(onChange).toHaveBeenCalledWith({ min: "100", max: "1500" });

        const min = screen.getByLabelText(/valor mínimo em reais/i);
        fireEvent.change(min, { target: { value: "200" } });
        fireEvent.keyDown(min, { key: "Enter" });
        expect(onChange).toHaveBeenLastCalledWith({ min: "200", max: "" });
    });
});

describe("ActiveFilterChips", () => {
    it("renders removable chips and a clear-all action", async () => {
        const onRemove = vi.fn();
        const onClearAll = vi.fn();
        const user = userEvent.setup();
        render(
            <ActiveFilterChips
                chips={[{ key: "status", label: "Status: Pago" }, { key: "planCode", label: "Plano: Completa" }]}
                onRemove={onRemove}
                onClearAll={onClearAll}
            />,
        );
        expect(screen.getByRole("list", { name: "Filtros ativos" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Remover filtro Status: Pago" }));
        expect(onRemove).toHaveBeenCalledWith("status");
        await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
        expect(onClearAll).toHaveBeenCalled();
    });

    it("renders nothing without chips", () => {
        const { container } = render(<ActiveFilterChips chips={[]} onRemove={() => {}} onClearAll={() => {}} />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe("NoResults", () => {
    it("offers a way out", async () => {
        const onClear = vi.fn();
        const user = userEvent.setup();
        render(<NoResults title="Nenhuma reserva com esses filtros" onClear={onClear} />);
        expect(screen.getByRole("heading", { name: "Nenhuma reserva com esses filtros" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
        expect(onClear).toHaveBeenCalled();
    });
});
