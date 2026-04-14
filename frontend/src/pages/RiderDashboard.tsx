import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import { toast } from "react-hot-toast/headless";
import { BiUpload } from "react-icons/bi";

interface IRider {
  _id: string;
  phone: string;
  adharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isAvailable: boolean;
  isVerified: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();
  const [riderProfile, setRiderProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [adharNumber, setAdharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      alert("Enable location services to toggle availability");
      return;
    }

    setToggle((prev) => !prev);
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

  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      alert("Enable location services to toggle availability");
      return;
    }

    setToggle((prev) => !prev);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found. Please log in.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle-availability`,
          {
            isAvailable: !riderProfile?.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success(
          `You are now ${!riderProfile?.isAvailable ? "available" : "unavailable"}`,
        );
        // After toggling availability, fetch the updated profile to reflect changes
        fetchProfile();
      } catch (error) {
        console.log("Error getting location:", error);
        toast.error("Failed to toggle availability. Please try again.");
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[65vh] justify-center items-center text-gray-600 text-2xl">
        Access Denied - You are not a registered rider.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] justify-center items-center text-gray-600 text-2xl">
        Loading Rider Details...
      </div>
    );
  }

  if (!riderProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
          <h1 className="text-xl font-semibold text-center">
            Add your Profile
          </h1>

          <input
            type="number"
            placeholder="Aadhar Number..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
            value={adharNumber}
            onChange={(e) => setAdharNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="Driving License Number..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
            value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Contact Number..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {/* <textarea
            placeholder="Description..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          /> */}

          <label className="cursor-pointer flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100">
            <BiUpload className="h-5 w-5 text-red-500" />
            {image ? image.name : "Upload Rider Image"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              hidden
            />
          </label>

          {/* <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
            <BiMapPin className="mt-0.5 h-5 w-5 text-red-500" />
            <div className="text-sm">
              {loadingLocation ? (
                <p className="text-gray-500">Fetching location...</p>
              ) : location ? (
                <p className="text-gray-700">
                  {location.formattedAddress || "Address not available"}
                </p>
              ) : (
                <p className="text-gray-500">Location not found</p>
              )}
            </div>
          </div> */}

          <button
            className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744] disabled:opacity-50"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Restaurant"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[65vh] justify-center items-center text-gray-600 text-2xl">
      Rider Dashboard goes here...
    </div>
  );
};

export default RiderDashboard;
