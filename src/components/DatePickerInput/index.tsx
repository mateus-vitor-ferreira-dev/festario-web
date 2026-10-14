import React, { forwardRef, InputHTMLAttributes, useId } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  $error?: boolean;
}

interface DatePickerInputProps {
  id?: string;
  label?: string;
  name?: string;
  value?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  [key: string]: unknown;
}
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";
import * as InputS from "../Input/styles";

registerLocale("pt-BR", ptBR);

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ value, onClick, onChange, onKeyDown, onFocus, onBlur, placeholder, $error, name, id, ...rest }, ref) => (
    <InputS.Input
        ref={ref}
        id={id}
        aria-describedby={rest["aria-describedby"]}
        aria-invalid={rest["aria-invalid"]}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        $error={$error}
        name={name}
        readOnly
    />
));

export default function DatePickerInput({
    id: idProp,
    label,
    name,
    value,
    onChange,
    error,
    placeholder = "dd/mm/aaaa",
    minDate,
    maxDate,
    ...props
}: DatePickerInputProps) {
    // sem id o <label> ficava solto e leitores de tela não anunciavam o campo
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const selected = value ? new Date(value + "T12:00:00") : null;
    const parsedMin = minDate ? new Date(minDate + "T12:00:00") : undefined;
    const parsedMax = maxDate ? new Date(maxDate + "T12:00:00") : undefined;

    function handleChange(date: Date | null): void {
        const strValue = date ? date.toLocaleDateString("en-CA") : "";
        onChange({ target: { name, value: strValue } } as React.ChangeEvent<HTMLInputElement>);
    }

    return (
        <InputS.Container>
            {label && <InputS.Label htmlFor={id}>{label}</InputS.Label>}
            <ReactDatePicker
                id={id}
                selected={selected}
                onChange={handleChange}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                placeholderText={placeholder}
                customInput={<CustomInput $error={!!error} name={name} />}
                minDate={parsedMin}
                maxDate={parsedMax}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                popperPlacement="bottom-start"
                {...props}
            />
            {error && <InputS.Error>{error}</InputS.Error>}
        </InputS.Container>
    );
}
