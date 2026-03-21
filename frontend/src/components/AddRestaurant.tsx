import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

const AddRestaurant = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    // 🚫 Prevent double click
    if (submitting) return;

    // ✅ Basic validation
    if (!name.trim() || !description.trim() || !phone.trim()) {
      toast.error("All fields are required");
      return;
    }

    // ✅ Image required (optional: remove if not needed)
    if (!image) {
      toast.error("Please upload a restaurant image");
      return;
    }

    // ✅ Location validation
    if (!location?.latitude || !location?.longitude) {
      toast.error("Valid location is required");
      return;
    }

    // ✅ Token validation
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to add a restaurant");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("phone", phone.trim());
    formData.append("image", image);
    formData.append("longitude", String(location.longitude));
    formData.append("latitude", String(location.latitude));
    formData.append("formattedAddress", location.formattedAddress || "");

    try {
      setSubmitting(true);

      console.log("API URL:", `${restaurantService}/api/restaurant/new`);

      const response = await axios.post(
        `${restaurantService}/api/restaurant/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // ✅ FORCE THIS
          },
        },
      );

      toast.success(response.data.message || "Restaurant added successfully");

      // ✅ Reset form after success
      setName("");
      setDescription("");
      setPhone("");
      setImage(null);
    } catch (error: any) {
      console.log("Error:", error);

      if (error.response) {
        // Server responded with error
        toast.error(error.response.data.message || "Server error");
      } else if (error.request) {
        // Request made but no response
        toast.error("No response from server");
      } else {
        // Something else
        toast.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
        <h1 className="text-xl font-semibold text-center">
          Add your Restaurant
        </h1>

        <input
          type="text"
          placeholder="Restaurant Name..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Contact Number..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          placeholder="Description..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="cursor-pointer flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100">
          <BiUpload className="h-5 w-5 text-red-500" />
          {image ? image.name : "Upload Restaurant Image"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            hidden
          />
        </label>

        <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
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
        </div>

        <button
          className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting || loadingLocation || !location}
        >
          {submitting ? "Adding..." : "Add Restaurant"}
        </button>
      </div>
    </div>
  );
};

export default AddRestaurant;
