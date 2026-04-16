import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useCallback, useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import { BiLoader } from "react-icons/bi";
import UserOrderMap from "../components/UserOrderMap";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null,
  );

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const { data } = await axios.get(
        `${restaurantService}/api/order/my/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [id, fetchOrder]);

  // Listen for real-time updates to the order
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (updatedOrder: IOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    };

    socket.on("order:update", handleOrderUpdate);

    return () => {
      socket.off("order:update", handleOrderUpdate);
    };
  }, [socket, id]);

  // Listen specifically for general order updates (status changes, etc.)
  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
    };
  }, [socket, fetchOrder]);

  // Listen specifically for rider assignment updates
  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket, fetchOrder]);

  // Join the user-specific room to receive rider location updates
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      if (socket) {
        socket.emit("leave", `user:${id}`);
      }
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;
    const onRiderLocationUpdate = ({ latitude, longitude }: any) => {
      console.log("Received rider location update:", latitude, longitude);
      setRiderLocation([latitude, longitude]);
    };
    socket.on("rider:location", onRiderLocationUpdate);

    return () => {
      if (socket) {
        socket.off("rider:location", onRiderLocationUpdate);
      }
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-65vh items-center justify-center">
        <BiLoader className="animate-spin" size={30} /> ?? Loading order
        details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-65vh items-center justify-center text-gray-500">
        Order not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">Order #{order._id.slice(-6)}</h2>
        <div className="rounded-lg bg-blue-100 text-sm p-4 font-medium">
          Status:{" "}
          <span className="font-bold capitalize italic text-blue-700">
            {order.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>
      <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
        <h3 className="font-semibold">Order Items</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span className="font-medium">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
        <h3 className="font-semibold">Delivery Address</h3>
        <p className="text-sm">{order.deliveryAddress.formattedAddress}</p>
        <p className="text-sm font-medium text-gray-600">
          Mobile: +91 {order.deliveryAddress.phone}
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
        <h3 className="font-semibold">Payment Details</h3>
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>₹{order.subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Charges:</span>
          <span>
            {order.subTotal > 249 ? (
              <span className="font-bold text-green-500 px-3 py-1 rounded-md bg-green-100 ">
                Free
              </span>
            ) : (
              <span>₹{order.deliveryCharges.toFixed(2)}</span>
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Platform Charges:</span>
          <span>₹{order.platformCharges.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Payment Method:</span>
          <span className="capitalize">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Payment Status: </span>
          <span className="capitalize ">{order.paymentStatus}</span>
        </div>
        <hr className="border border-gray-200" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>₹{order.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {(order.status === "rider_assigned" ||
        order.status === "out_for_delivery") &&
      riderLocation ? (
        <UserOrderMap
          riderLocation={riderLocation}
          deliveryLocation={[
            order.deliveryAddress.latitude!,
            order.deliveryAddress.longitude!,
          ]}
        />
      ) : (
        <p className="text-gray-500 text-lg">
          Rider location not available. Waiting for rider location...
        </p>
      )}
    </div>
  );
};

export default OrderPage;
