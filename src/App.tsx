import { useState } from "react";
import { IntroAnimation } from "./components/IntroAnimation";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppRoutes } from "./routes";
import { GlobalStyle } from "./styles/global";

function App() {
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem("intro_shown")
  );

  function handleIntroComplete() {
    sessionStorage.setItem("intro_shown", "true");
    setShowIntro(false);
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyle />
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        <AppRoutes introFinished={!showIntro} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
