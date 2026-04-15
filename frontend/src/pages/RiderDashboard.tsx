import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import { toast } from "react-hot-toast";
import RiderProfile from "../components/RiderProfile";
import AddRider from "../components/AddRider";
import type { IRider } from "../types";

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

  // Listen for real-time updates to rider profile (e.g., order status changes)
  useEffect(() => {
    if (!socket) return;

    const handleProfileUpdate = (updatedRider: IRider) => {
      setRiderProfile(updatedRider);
    };

    socket.on("orderStatusUpdated", handleProfileUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleProfileUpdate);
    };
  }, [socket]);
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
    <RiderProfile
      riderProfile={riderProfile}
      userName={user?.name || "Rider Name: Not Available"}
      toggle={toggle}
      onToggle={toggleAvailability}
    />
  );
};

export default RiderDashboard;
