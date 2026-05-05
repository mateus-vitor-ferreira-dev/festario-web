import React from "react";

export const registerLocale = () => {};

export default function DatePicker({
    selected,
    onChange,
    customInput,
    placeholderText,
    minDate,
    maxDate,
}) {
    const value = selected ? selected.toLocaleDateString("en-CA") : "";
    const name = customInput?.props?.name;

    function handleChange(e) {
        const v = e.target.value;
        onChange(v ? new Date(v + "T12:00:00") : null);
    }

    return (
        <input
            type="date"
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholderText}
            min={minDate ? minDate.toLocaleDateString("en-CA") : undefined}
            max={maxDate ? maxDate.toLocaleDateString("en-CA") : undefined}
        />
    );
}
