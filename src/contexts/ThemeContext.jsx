/**
 * @module contexts/ThemeContext
 * @description Contexto de tema (claro/escuro) para toda a aplicação.
 *
 * O tema ativo é persistido em `localStorage` (`recanto:theme`) e aplicado como
 * atributo `data-theme` no `<html>`, permitindo que o CSS (CSS variables ou
 * styled-components) reactive automaticamente.
 */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

/**
 * Provedor de tema. Envolva o app com este componente para disponibilizar `useTheme`.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
function getInitialTheme() {
  const stored = localStorage.getItem("recanto:theme");
  if (stored === "light" || stored === "dark") return stored;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("recanto:theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o tema atual e a função de toggle.
 *
 * @returns {{ theme: "light" | "dark", toggleTheme: () => void }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
