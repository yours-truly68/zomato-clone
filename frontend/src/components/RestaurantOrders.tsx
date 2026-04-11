import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import faahAudio from "../assets/faah_notification.mp3";
import axios from "axios";
import { restaurantService } from "../main";

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

  return <div>Restaurant Orders</div>;
};

export default RestaurantOrders;
