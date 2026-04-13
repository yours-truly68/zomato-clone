import { useState } from "react";
import type { IOrder } from "../types";

interface OrderCardProps {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const status = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-orange-100 text-orange-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "ready_for_pickup":
      return "bg-green-100 text-green-800";
    case "rider_assigned": //picked up by rider but not yet delivered
      return "bg-purple-100 text-purple-800";
    case "out_for_delivery": //completed by rider but not yet delivered
      return "bg-teal-100 text-teal-800";
    case "delivered":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderCard = ({ order, onStatusUpdate }: OrderCardProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={`p-4 rounded-lg ${status(order.status)}`}>Order Card</div>
  );
};

export default OrderCard;
