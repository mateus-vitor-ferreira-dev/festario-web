import { ChangeEvent, useEffect, useRef, useState } from "react";
import { formatPhone } from "../../utils/formatPhone";
import { COUNTRIES, DEFAULT_COUNTRY } from "../../constants/countries";
import type { Country } from "../../constants/countries";
import * as S from "./styles";

interface PhoneInputProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onDialCodeChange?: (dialCode: string) => void;
    error?: string;
}

export default function PhoneInput({ label, name, value, onChange, onDialCodeChange, error }: PhoneInputProps) {
    const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        onDialCodeChange?.(DEFAULT_COUNTRY.dialCode);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        searchRef.current?.focus();

        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    function handleSelectCountry(selected: Country) {
        setCountry(selected);
        setIsOpen(false);
        setSearch("");
        onDialCodeChange?.(selected.dialCode);
    }

    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        const formatted = country.code === "BR"
            ? formatPhone(e.target.value)
            : e.target.value.replace(/[^\d\s\-().+]/g, "").slice(0, 20);

        onChange({ target: { name, value: formatted } } as ChangeEvent<HTMLInputElement>);
    }

    const filtered = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dialCode.includes(search)
    );

    const placeholder = country.code === "BR" ? "(11) 99999-9999" : "Número de telefone";

    return (
        <S.Container ref={containerRef}>
            {label && <S.Label>{label}</S.Label>}

            <S.InputWrapper $error={!!error}>
                <S.CountryButton
                    type="button"
                    onClick={() => setIsOpen((o) => !o)}
                    aria-label="Selecionar país"
                    aria-expanded={isOpen}
                >
                    <S.Flag>{country.flag}</S.Flag>
                    <S.DialCode>{country.dialCode}</S.DialCode>
                    <S.Chevron $open={isOpen}>▼</S.Chevron>
                </S.CountryButton>

                <S.Divider />

                <S.PhoneNumberInput
                    inputMode="tel"
                    name={name}
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                />
            </S.InputWrapper>

            {error && <S.Error>{error}</S.Error>}

            {isOpen && (
                <S.Dropdown>
                    <S.SearchInput
                        ref={searchRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar país..."
                    />
                    <S.List>
                        {filtered.map((c) => (
                            <S.ListItem
                                key={c.code}
                                $selected={c.code === country.code}
                                onClick={() => handleSelectCountry(c)}
                            >
                                <S.Flag>{c.flag}</S.Flag>
                                <S.CountryName>{c.name}</S.CountryName>
                                <S.DialCode>{c.dialCode}</S.DialCode>
                            </S.ListItem>
                        ))}
                    </S.List>
                </S.Dropdown>
            )}
        </S.Container>
    );
}
