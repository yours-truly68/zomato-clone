import { useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow.utils";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";

interface OrderCardProps {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300 shawdow-sm";
    case "accepted":
      return "bg-orange-100 text-orange-800 border border-orange-300";
    case "preparing":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "ready_for_pickup":
      return "bg-green-100 text-green-800 border border-green-300";
    case "rider_assigned": //picked up by rider but not yet delivered
      return "bg-purple-100 text-purple-800 border border-purple-300";
    case "out_for_delivery": //completed by rider but not yet delivered
      return "bg-teal-100 text-teal-800 border border-teal-300";
    case "delivered":
      return "bg-gray-100 text-gray-800 border border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};

const OrderCard = ({ order, onStatusUpdate }: OrderCardProps) => {
  const [loading, setLoading] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(`Order status updated to ${newStatus}`);
      onStatusUpdate?.();
    } catch (error: any) {
      console.error("Error updating order status: ", error);
      toast.error(
        error.response.data.message ||
          "Failed to update order status. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        {order.items.map((item, i) => (
          <p
            key={i}
            className="flex justify-between font-medium text-gray-400 text-sm"
          >
            {item.name} X {item.quantity}
          </p>
        ))}
      </div>
      <div className="flex justify-between gap-2 text-sm font-medium">
        <span>Total</span>
        <span>₹{order.grandTotal.toFixed(2)}</span>
      </div>

      <p className="text-sm text-gray-400">Payment: {order.paymentStatus}</p>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {actions.map((status) => (
            <button
              key={status}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium disabled:opacity-50"
              onClick={() => updateStatus(status)}
              disabled={loading}
            >
              Mark as {status.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
