import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import faahAudio from "../assets/faah_notification.mp3";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";

const ALLOWED_ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "rider_assigned",
  "out_for_delivery", //picked up by rider but not yet delivered
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(faahAudio);
    audioRef.current.load();
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
          console.log("Audio unlocked for notifications");
        })
        .catch((err) => {
          console.error("Error unlocking audio: ", err);
        });
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const { data } = await axios.get(
        `${restaurantService}/api/order/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log("Error fetching orders: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = () => {
      console.log("🔥 New order received");

      if (audioRef.current) {
        console.log("🔊 Trying to play audio...");

        audioRef.current.currentTime = 0;

        audioRef.current
          .play()
          .then(() => {
            console.log("✅ Audio played successfully");
          })
          .catch((err) => {
            console.error("❌ Audio failed:", err);
          });
      }

      fetchOrders();
    };
    socket.on("order:new", onNewOrder);
    socket.on("order:new", () => {
      console.log("🔥 EVENT RECEIVED");
    });

    return () => {
      socket.off("order:new", onNewOrder);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="text-gray-500 flex justify-center items-center text-2xl">
        Loading orders...
      </div>
    );
  }

  const activeOrders = orders.filter((order) =>
    ALLOWED_ACTIVE_STATUSES.includes(order.status),
  );

  const completedOrders = orders.filter((order) => {
    return !ALLOWED_ACTIVE_STATUSES.includes(order.status);
  });

  return (
    <div className="space-y-6">
      {!audioUnlocked && (
        <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-4 rounded-lg ">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔊</span>
            <div>
              <p
                className="text-blue-600 font-medium  cursor-pointer"
                onClick={unlockAudio}
              >
                Enable Sound Notification{" "}
              </p>
              <p className="text-sm text-gray-400">
                Get notified whenever a new order is placed!
              </p>
            </div>
          </div>
          <button
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 transition text-sm"
            onClick={unlockAudio}
          >
            Enable Audio
          </button>
        </div>
      )}

      {/* {Active Orders} */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Active Orders</h3>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-center border border-gray-300 p-4 rounded-lg">
            No Active Orders
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
        {/* {Completed Orders} */}
        {completedOrders.length === 0 ? (
          <p className="text-gray-500 text-center border border-gray-300 p-4 rounded-lg">
            No Completed Orders
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
