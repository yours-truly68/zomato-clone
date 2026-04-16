import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { BiLoader } from "react-icons/bi";

const ACITVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "rider_assigned",
  "out_for_delivery",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const { data } = await axios.get(`${restaurantService}/api/order/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched orders:", data.orders);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!socket) return;

    socket.onAny((event, ...args) => {
      console.log("SOCKET EVENT RECEIVED:", event, args);
    });
  }, [socket]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const onUpdateOrder = () => {
      console.log("🔥 New order received");

      // if (audioRef.current) {
      //   console.log("🔊 Trying to play audio...");

      //   audioRef.current.currentTime = 0;

      //   audioRef.current
      //     .play()
      //     .then(() => {
      //       console.log("✅ Audio played successfully");
      //     })
      //     .catch((err) => {
      //       console.error("❌ Audio failed:", err);
      //     });
      // }

      fetchOrders();
    };
    
    socket.on("order:rider_assigned", onUpdateOrder);

    return () => {
      socket.off("order:rider_assigned", onUpdateOrder);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-70vh justify-center items-center text-xl text-gray-500">
        <BiLoader className="animate-spin" size={30} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-70vh justify-center items-center text-xl text-gray-500">
        {" "}
        No orders found
      </div>
    );
  }

  const activeOrders = orders.filter((order) => {
    return ACITVE_STATUSES.includes(order.status);
  });

  const completedOrders = orders.filter((order) => {
    return !ACITVE_STATUSES.includes(order.status);
  });

  return (
    <div className="mx-auto max-w-4xl py-6 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500">No active orders</p>
        ) : (
          activeOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onClick={() => navigate(`/orders/${order._id}`)}
            />
            //   <p className="font-medium">Order ID: {order._id}</p>
            //   <p>Status: {order.status}</p>
            //   <p>Total: ${order.grandTotal.toFixed(2)}</p>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Completed Orders</h2>
        {completedOrders.length === 0 ? (
          <p className="text-gray-500">No completed orders</p>
        ) : (
          completedOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onClick={() => navigate(`/orders/${order._id}`)}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default Orders;

const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => {
  return (
    <div
      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-center text-sm font-medium">
        Order ID: #{order._id.slice(-6)}
        <span className="text-xs capitalize text-gray-500 ">
          {order.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="text-sm mt-2 text-gray-600">
        {order.items.map((item, i) => (
          <span key={i}>
            {item.name} x {item.quantity}
            {i < order.items.length - 1 && ", "}
          </span>
        ))}
      </div>
      <div className="flex justify-between item-center text-sm font-medium mt-3">
        <span>Total</span>
        <span>₹{order.grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};
