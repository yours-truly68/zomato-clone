import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface RiderCurrentOrderProps {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({
  order,
  onStatusUpdate,
}: RiderCurrentOrderProps) => {
  const updateStatus = async () => {
    try {
      await axios.patch(
        `${riderService}/api/rider/update/${order._id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      onStatusUpdate();
      toast.success("Order status updated successfully");
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(
        error.response?.data.message || "Failed to update order status",
      );
    }
  };
  return (
    <div className="rounded-xl p-4 shadow-sm bg-white space-y-4 max-w-3xl mx-auto">
      <h2 className="font-semibold text-gray-700">Current Order</h2>
      <div className="text-sm space-y-2 text-gray-600">
        <p>
          <strong>Pickup: </strong>
          {order.restaurantName}
        </p>
        <p>
          <strong>Drop: </strong>
          {order.deliveryAddress.formattedAddress}
        </p>
        <p>
          <strong>Total: </strong>₹ {order.grandTotal.toFixed(2)}
        </p>
        <p>
          <strong>Earnings: </strong>₹ {order.riderAmount.toFixed(2)}
        </p>
        <p>
          <strong>Status: </strong>
          <span
            className="capitalize text-blue-600 
          font-semibold rounded-lg italic"
          >
            {order.status.replaceAll("_", " ")}
          </span>
        </p>
      </div>

      {order.deliveryAddress.phone && (
        <div className="flex justify-between items-center rounded-lg bg-gray-100 p-4">
          <div className="text-sm text-gray-700">
            <p>
              <strong>Customer Phone: </strong>
              <p>{order.deliveryAddress.phone}</p>
            </p>
          </div>
          <a
            href={`tel:${order.deliveryAddress.phone}`}
            className="text-white px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mt-2 inline-block transition-colors duration-200"
          >
            <strong>Call</strong>
          </a>
        </div>
      )}

      {
        <div className="space-y-2">
          {order.status === "rider_assigned" && (
            <button
              onClick={() => updateStatus()}
              className="w-full rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white py-2 transition-colors duration-200"
            >
              Reached Restaurant
            </button>
          )}
          {order.status === "out_for_delivery" && (
            <button
              onClick={() => updateStatus()}
              className="w-full rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white py-2 transition-colors duration-200"
            >
              Mark as Delivered
            </button>
          )}
        </div>
      }
    </div>
  );
};

export default RiderCurrentOrder;
