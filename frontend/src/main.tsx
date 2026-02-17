import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";

// Theme initialization before mounting
const ThemeInitializer = () => {
  useTheme();
  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ThemeInitializer />
  </AuthProvider>
);

