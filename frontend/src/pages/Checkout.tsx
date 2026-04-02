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
  const [creatingOrder, setCreatingOrder] = useState(false);
  const navigate = useNavigate();

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

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryCharges = subTotal < 250 ? 49 : 0;

  const platformCharges = subTotal < 500 ? 7 : Math.ceil(0 + 0.015 * subTotal);

  const grandTotal = subTotal + deliveryCharges + platformCharges;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(`{}`);
    } catch (error) {}
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] text-5xl font-semibold text-gray-500">
      Checkout Page
    </div>
  );
};

export default Checkout;
