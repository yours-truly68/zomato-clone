import axios from "axios";
import { useEffect, useState } from "react";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface RiderOrderRequestProps {
  orderId: string;
  onAccepted: () => void;
  //   onDeclined: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: RiderOrderRequestProps) => {
  const [accepting, setAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds to accept

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // onDeclined(); // Auto-decline if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [onAccepted]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setAccepting(false);
        return;
      }
      // Call API to accept order
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Order accepted!");
      // Notify parent component to refresh order list or update UI

      onAccepted();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to accept order";

      toast.error(msg);
      setAccepting(false);

      if (msg.includes("already")) {
        onAccepted(); // remove from UI
      }
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm p-4 border border-green-50 space-y-3 text-center">
      <h3 className="font-medium text-gray-700">New Order Request</h3>
      <p className="text-sm text-gray-400">
        You have{" "}
        <span className="font-bold italic text-red-600">{timeLeft}</span>{" "}
        seconds to accept this order.
      </p>
      <p className="text-sm text-gray-600">
        Order ID:{" "}
        <span className="font-mono font-semibold">{orderId.slice(-6)}</span>
      </p>

      <button
        className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm py-2 px-4 rounded"
        onClick={handleAccept}
        disabled={accepting}
      >
        {accepting ? "Accepting..." : "Accept Order"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
