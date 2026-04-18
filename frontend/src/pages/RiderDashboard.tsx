import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import { toast } from "react-hot-toast";
import RiderProfile from "../components/RiderProfile";
import AddRider from "../components/AddRider";
import type { IOrder, IRider } from "../types";
import audio from "../assets/faah_notification.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

// interface RiderProfileProps {
//   riderProfile: IRider;
//   userName: string;
//   toggle: boolean;
//   onToggle: () => void;
// }

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();
  const [riderProfile, setRiderProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [adharNumber, setAdharNumber] = useState<string>("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]); // For real-time incoming order notifications
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null); // To track the order currently being delivered
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // For real-time incoming order notifications
  // const navigate = useNavigate();

  // const logoutHandler = () => {
  //   localStorage.removeItem("token");
  //   navigate("/login");
  // };

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Audio unlocked! You'll now receive order notifications.");
    } catch (error) {
      toast.error("Unable to unlock audio.");
      console.error("Error unlocking audio:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId],
      );
      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Error playing notification sound:", err);
        });
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000); // Clear notification after 10 seconds
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      alert("Enable location services to toggle availability");
      return;
    }

    // setToggle((prev) => !prev); // Disable the button immediately while we fetch location and submit data
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found. Please log in.");
      return;
    }
    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();
      formData.append("phone", phoneNumber);
      formData.append("adharNumber", adharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      if (image) {
        formData.append("image", image);
      }
      formData.append("longitude", String(pos.coords.longitude));
      formData.append("latitude", String(pos.coords.latitude));

      try {
        await axios.post(`${riderService}/api/rider/new`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(
          `Rider profile created successfully! You can now toggle your availability.`,
        );
        // After toggling availability, fetch the updated profile to reflect changes
        fetchProfile();
      } catch (error) {
        console.log("Error getting location:", error);
        toast.error("Failed to create rider profile. Please try again.");
        // setSubmitting(false);
      } finally {
        setSubmitting(false);
      }
    });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      const { data } = await axios.get(`${riderService}/api/rider/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRiderProfile(data.rider);
    } catch (error) {
      console.error("Error fetching rider profile:", error);
      setRiderProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
    }
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found. Please log in.");
        return;
      }

      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.error("Error fetching current order:", error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = !riderProfile?.isAvailable;

    // ✅ IMMEDIATE UI UPDATE
    setRiderProfile((prev: IRider | null) =>
      prev ? { ...prev, isAvailable: newStatus } : prev,
    );

    setToggle(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle-availability`,
          {
            isAvailable: newStatus,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success(`You are now ${newStatus ? "available" : "unavailable"}`);
        fetchProfile(); // Refresh profile to get latest status from server
      } catch (error) {
        // ❌ rollback if failed
        setRiderProfile((prev: IRider | null) =>
          prev ? { ...prev, isAvailable: !newStatus } : prev,
        );
        console.error("Error toggling availability:", error);

        toast.error("Failed to toggle availability");
      } finally {
        setToggle(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[65vh] justify-center items-center text-gray-500">
        Access Denied - You are not a registered rider.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] justify-center items-center text-gray-500">
        Loading Rider Details...
      </div>
    );
  }

  if (!riderProfile) {
    return (
      <AddRider
        adharNumber={adharNumber}
        drivingLicenseNumber={drivingLicenseNumber}
        phoneNumber={phoneNumber}
        image={image}
        setAdharNumber={setAdharNumber}
        setDrivingLicenseNumber={setDrivingLicenseNumber}
        setPhoneNumber={setPhoneNumber}
        setImage={setImage}
        handleSubmit={handleSubmit}
        submitting={submitting}
      />
    );
  }

  return (
    <div className=" min-h-screen space-y-4 max-w-3xl mx-auto px-4 py-6">
      <RiderProfile
        riderProfile={riderProfile}
        userName={user?.name || "Rider Name: Not Available"}
        toggle={toggle}
        onToggle={toggleAvailability}
        currentOrder={currentOrder}
        // logoutHandler={logoutHandler}
      />
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

      {riderProfile.isAvailable && incomingOrders.length > 0 && (
        <div className="mx-auto max-w-md px-4 rounded-lg">
          <h1 className="text-xl font-bold text-gray-800 py-4">
            Incoming Orders
          </h1>
          {incomingOrders.map((orderId) => (
            <RiderOrderRequest
              key={orderId}
              orderId={orderId}
              onAccepted={() => {
                fetchProfile();
                fetchCurrentOrder();
              }}
            />
          ))}
        </div>
      )}
      {currentOrder && (
        <div className="space-y-4 p-4">
          <RiderCurrentOrder
            order={currentOrder}
            onStatusUpdate={fetchCurrentOrder}
          />
          <RiderOrderMap order={currentOrder} />
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
