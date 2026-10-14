import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Pagination from "../../components/Pagination";
import { formatRange, getPageItems } from "../../components/Pagination/getPageItems";

describe("getPageItems", () => {
    it("lists every page when there are few", () => {
        expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it("collapses both sides with ellipsis in the middle", () => {
        expect(getPageItems(5, 12)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 12]);
    });

    it("keeps a stable window near the start and the end", () => {
        expect(getPageItems(1, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 12]);
        expect(getPageItems(12, 12)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12]);
    });

    it("returns nothing for zero pages", () => {
        expect(getPageItems(1, 0)).toEqual([]);
    });
});

describe("formatRange", () => {
    it("formats the visible range in pt-BR", () => {
        expect(formatRange(3, 10, 10, 48)).toBe("Mostrando 21–30 de 48");
        expect(formatRange(1, 20, 5, 1234)).toBe("Mostrando 1–5 de 1.234");
        expect(formatRange(1, 20, 0, 0)).toBe("Nenhum resultado");
    });
});

describe("Pagination", () => {
    it("renders nothing when everything fits on one page", () => {
        const { container } = render(<Pagination page={1} totalPages={1} total={3} limit={10} count={3} onChange={() => {}} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("marks the current page, shows the range and the ellipsis", () => {
        render(<Pagination page={5} totalPages={12} total={120} limit={10} count={10} onChange={() => {}} />);
        expect(screen.getByRole("navigation", { name: "Paginação" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Página 5" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "Página 4" })).not.toHaveAttribute("aria-current");
        expect(screen.getAllByText("…")).toHaveLength(2);
        expect(screen.getByText("Mostrando 41–50 de 120")).toBeInTheDocument();
        expect(screen.getByText("Página 5 de 12")).toBeInTheDocument();
    });

    it("disables Anterior on the first page and Próxima on the last", () => {
        const { rerender } = render(<Pagination page={1} totalPages={3} limit={10} count={10} onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Próxima" })).toBeEnabled();
        rerender(<Pagination page={3} totalPages={3} limit={10} count={10} onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    });

    it("calls onChange and moves focus to the top of the list", async () => {
        const onChange = vi.fn();
        const target = document.createElement("div");
        target.tabIndex = -1;
        target.scrollIntoView = vi.fn();
        document.body.appendChild(target);
        const ref = { current: target };
        const user = userEvent.setup();
        render(<Pagination page={2} totalPages={4} limit={10} count={10} onChange={onChange} scrollTargetRef={ref} />);

        await user.click(screen.getByRole("button", { name: "Próxima" }));
        expect(onChange).toHaveBeenLastCalledWith(3);
        expect(target.scrollIntoView).toHaveBeenCalled();
        expect(target).toHaveFocus();

        await user.click(screen.getByRole("button", { name: "Anterior" }));
        expect(onChange).toHaveBeenLastCalledWith(1);

        await user.click(screen.getByRole("button", { name: "Página 4" }));
        expect(onChange).toHaveBeenLastCalledWith(4);

        onChange.mockClear();
        await user.click(screen.getByRole("button", { name: "Página 2" }));
        expect(onChange).not.toHaveBeenCalled();
        target.remove();
    });

    it("falls back to 'Página X' + hasNext when the total is unknown", async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Pagination page={2} limit={15} count={15} hasNext onChange={onChange} />);
        expect(screen.getByText("Página 2")).toBeInTheDocument();
        expect(screen.queryByText(/mostrando/i)).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Próxima" }));
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("ignores clicks while disabled", async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Pagination page={2} totalPages={3} limit={10} count={10} onChange={onChange} disabled />);
        await user.click(screen.getByRole("button", { name: "Página 3" }));
        expect(onChange).not.toHaveBeenCalled();
    });
});
