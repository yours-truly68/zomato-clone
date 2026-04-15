import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import { toast } from "react-hot-toast";
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

    setToggle((prev) => !prev); // Disable the button immediately while we fetch location and submit data
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
    if (!navigator.geolocation) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = !riderProfile?.isAvailable;

    // ✅ IMMEDIATE UI UPDATE
    setRiderProfile((prev) =>
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
        setRiderProfile((prev) =>
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
            {submitting ? "Adding..." : "Add Rider"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen py-6">
      <div className="mx-auto max-w-md px-4 py-4 ">
        <div className="bg-white p-4 space-y-3 rounded-lg shadow">
          <img
            src={riderProfile.picture}
            alt="Rider Profile Picture"
            className="rounded-full h-24 w-24 object-cover mx-auto"
          />
          <p className="text-center font-medium text-gray-700">
            {user?.name || "Rider Name: Not Available"}
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            {riderProfile.phone || "Phone: Not Available"}
          </p>

          <div className="flex justify-center gap-2">
            <span
              className={`px-4 py-1 text-xs rounded-full ${riderProfile.isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600 shadow shadow-gray-300/50"}`}
            >
              {riderProfile.isVerified ? "Verified" : "Pending Verification"}
            </span>
            <span
              className={`px-4 py-1 text-xs rounded-full ${riderProfile.isAvailable ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600 shadow shadow-gray-300/50"}`}
            >
              {riderProfile.isAvailable ? "Online" : "Offline"}
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <p className="text-blue-400 text-sm text-center">
              Please be within 500m of any restaurant (which we call the
              hotspot) before going online as rider to receive orders
            </p>
          </div>
          {riderProfile.isVerified && (
            <button
              className={`w-full rounded-lg py-2 text-sm ${toggle ? "bg-gray-500 hover:bg-gray-500" : !riderProfile.isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-[#e23744] hover:bg-[#d12f3a]"} text-white`}
              onClick={toggleAvailability}
              disabled={toggle}
            >
              {toggle
                ? "Updating..."
                : riderProfile.isAvailable
                  ? "Go Offline"
                  : "Go Online"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
