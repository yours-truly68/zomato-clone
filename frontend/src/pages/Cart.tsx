import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";

const Cart = () => {
  const { cart, quantity, subTotal, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh - 64px)]">
        <p className="text-gray-500 text-lg font-semibold">
          Your cart is empty
        </p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryCharges = subTotal < 250 ? 49 : 0;

  const platformCharges = subTotal * 0.05;

  const grandTotal = subTotal + deliveryCharges + platformCharges;

  const increaseQuantity = async (itemId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return;
    }
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await fetchCart();
      toast.success(data.message || "Quantity increased successfully");
    } catch (error) {
      console.log("Error increasing quantity:", error);
      toast.error("Failed to increase quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQuantity = async (itemId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return;
    }
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await fetchCart();
      toast.success("Quantity decreased successfully");
    } catch (error) {
      toast.error("Failed to decrease quantity");
      console.log("Error decreasing quantity:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear the cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchCart();
    } catch (error) {
      console.log("Error clearing cart:", error);
    } finally {
      setClearingCart(false);
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="bg-white shadow-sm rounded-xl p-4">
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <p className="text-gray-500 text-sm mb-4">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>
      <div className="space-y-4">
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          const isLoading = loadingItemId === item._id;

          return (
            <div
              key={item._id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm"
            >
              {/* Render cart item details */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-500 text-sm font-medium">
                  ₹{item.price}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="rounded-full hover:border-gray-200 border-gray-600 p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  onClick={() => decreaseQuantity(item._id)}
                >
                  {isLoading ? (
                    <VscLoading size={18} className="animate-spin" />
                  ) : (
                    <BiMinus size={18} />
                  )}
                </button>
                <span className="text-xl font-bold">{cartItem.quantity}</span>
                <button
                  className="rounded-full hover:border-gray-200 border-gray-600 p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  onClick={() => increaseQuantity(item._id)}
                >
                  {isLoading ? (
                    <VscLoading size={18} className="animate-spin" />
                  ) : (
                    <BiPlus size={18} />
                  )}
                </button>
              </div>
              <p className="text-2xl font-semibold w-20 text-right mr-2.5">
                ₹{cartItem.quantity * item.price}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cart;
