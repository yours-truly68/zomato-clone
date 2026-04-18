import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

export const authService = "https://zomatoes-auth.onrender.com";
export const restaurantService = "https://restaurant-service-gcgo.onrender.com";
export const utilServices = "https://utils-service-e6ww.onrender.com";
export const realtimeService = "https://realtime-service-832s.onrender.com";
export const riderService = "https://rider-service-7ci8.onrender.com";
export const adminService = "https://zomatoes-admin-1.onrender.com";

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
