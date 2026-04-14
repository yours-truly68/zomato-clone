import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

export const authService = "http://localhost:8000";
export const restaurantService = "http://localhost:8001";
export const utilServices = "http://localhost:8002";
export const realtimeService = "http://localhost:8004";
export const riderService = "http://localhost:8005";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1037277292337-nbmi3ubrt032rf1h023d6todvp5os08n.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
