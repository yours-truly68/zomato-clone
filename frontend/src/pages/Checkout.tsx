import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../main";
import { useNavigate } from "react-router-dom";
import type { IRestaurant } from "../types";

interface Address {
  _id: string;
  formattedAddress: string;
  phone: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const [address, setAddress] = useState<Address | null>(null);
  const [selectAddressId, setSelectAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [createOrder, setCreateOrder] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setAddress(data || []);
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-5xl font-semibold text-gray-500">
        Your cart is empty
      </div>
    );
  }

  const navigate = useNavigate();

  const restaurant = cart[0].restaurantId as IRestaurant;

  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] text-5xl font-semibold text-gray-500">
      Checkout Page
    </div>
  );
};

export default Checkout;
