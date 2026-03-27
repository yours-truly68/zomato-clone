import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching location...");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "customer") return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, user might not be authenticated");
      return;
    }
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(data.cart || []);
      setSubTotal(data.subTotal || 0);
      setQuantity(data.cartLength || 0);
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please allow location access to use the service");
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );

        setLocation({
          latitude,
          longitude,
          formattedAddress: response.data.display_name || "current city",
        });
        setCity(
          response.data.address.city ||
            response.data.address.town ||
            response.data.address.village ||
            "Your Location",
        );
        setLoadingLocation(false);
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "current location",
        });
        setCity("Failed to load");
        console.log(error);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        setLoading,
        setUser,
        setIsAuth,
        location,
        loadingLocation,
        city,
        cart,
        subTotal,
        quantity,
        fetchCart,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }

  return context;
};
