import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useDatabaseAuth";
import { initDatabase } from "./services/dbService";

// Initialize database
initDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});