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
    if (!name || !description || !phone || !image) {
      alert("All fields are required");
      return;
    }

    if (!location) {
      alert("Location is required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("phone", phone);
    formData.append("file", image);
    formData.append("longitude", String(location.longitude));
    formData.append("latitude", String(location.latitude));
    formData.append("formattedAddress", location.formattedAddress || "");

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${restaurantService}/api/restaurant/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(response.data.message || "Restaurant added successfully");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to add restaurant");
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
          type="number"
          placeholder="Contact Number..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          placeholder="Description..."
          className="w-full max-w-lg rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
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
              <p className="text-gray-700">{location.formattedAddress}</p>
            ) : (
              <p className="text-gray-500">Location not found</p>
            )}
          </div>
        </div>
        <button
          className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744]"
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
