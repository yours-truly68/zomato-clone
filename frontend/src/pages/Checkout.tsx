import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilServices } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address {
  _id: string;
  formattedAddress: string;
  phone: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const [address, setAddress] = useState<Address[]>([]);
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
        console.log(data);
        const addresses = data.addresses as Address[];
        setAddress(addresses);
        if (addresses.length > 0) {
          setSelectAddressId(addresses[0]._id);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, []);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-5xl font-semibold text-gray-500">
        Your cart is empty
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryCharges = subTotal < 250 ? 49 : 0;

  const platformCharges = subTotal < 500 ? 7 : Math.ceil(0.015 * subTotal);

  const grandTotal = subTotal + deliveryCharges + platformCharges;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectAddressId) {
      toast.error("Please select an address");
      return;
    }
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const orderData = await createOrder("razorpay");

      if (!orderData) return;

      const { orderId, amount } = orderData;
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        return;
      }
      const { data } = await axios.post(
        `${utilServices}/api/payment/create`,
        {
          orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "Zomatoes",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        theme: {
          color: "#E23744",
        },
        handler: async (response: any) => {
          try {
            await axios.post(`${utilServices}/api/payment/verify`, {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful!");
            navigate(`/paymentsuccess/${response.razorpay_payment_id}`);
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
      };
      console.log(data);

      if (!(window as any).Razorpay) {
        toast.error("Payment SDK not loaded");
        return;
      }
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error processing Razorpay payment:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setLoadingRazorpay(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="rounded-xl bg-white space-y-3 shadow-sm p-4">
        <h3 className="font-semibold">Delivery Address</h3>
        {loadingAddress ? (
          <p className="text-500-gray text-sm">Loading address...</p>
        ) : address.length === 0 ? (
          <p className="text-500-gray text-sm">No address found</p>
        ) : (
          address.map((addr) => (
            <label
              key={addr._id}
              className={`flex gap-3 rounded-lg border-2 p-4 cursor-pointer transition ${
                selectAddressId === addr._id
                  ? "border-[#e23744] bg-red-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="address"
                value={addr._id}
                checked={selectAddressId === addr._id}
                onChange={() => setSelectAddressId(addr._id)}
                className="peer sr-only"
              />
              <div>
                <p className="text-sm font-semibold">{addr.formattedAddress}</p>
                <p className="text-sm font-medium">{addr.phone}</p>
              </div>
            </label>
          ))
        )}
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          return (
            <div className="flex justify-between text-sm" key={cartItem._id}>
              <span>
                {item.name} x {cartItem.quantity}
              </span>
              <span>₹{(item.price * cartItem.quantity).toFixed(2)}</span>
            </div>
          );
        })}

        <hr className="border-gray-200" />
        <div className="flex justify-between text-sm">
          <span>Items ({quantity})</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Charges</span>
          <span>
            {subTotal > 249 ? (
              <span className="font-bold text-green-500 px-3 py-1 rounded-md bg-green-100 ">
                Free
              </span>
            ) : (
              <span>₹{deliveryCharges.toFixed(2)}</span>
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Platform Charges</span>
          <span>₹{platformCharges.toFixed(2)}</span>
        </div>
        {subTotal < 250 && (
          <p className="text-xs text-red-500 text-center p-2 bg-red-100 rounded-lg">
            Add items worth ₹{250 - subTotal} more to get Free delivery
          </p>
        )}
        <hr className="border-gray-200" />
        <div className="flex justify-between font-bold text-lg">
          <span>Grand Total</span>
          <span className="text-xl">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <button
          disabled={loadingRazorpay || creatingOrder || !selectAddressId}
          onClick={payWithRazorpay}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          {" Pay with Razorpay"}
        </button>
        {/*  <button
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={payWithStripe}
          disabled={loadingStripe || creatingOrder}
        >
          {loadingStripe || creatingOrder ? (
            <VscLoading size={20} className="animate-spin mx-auto" />
          ) : (
            "Pay with Stripe"
          )}
        </button> */}
      </div>
    </div>
  );
};

export default Checkout;
