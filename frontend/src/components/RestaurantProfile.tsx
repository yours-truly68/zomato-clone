import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiImage, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface IRestaurantProfileProps {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (updatedRestaurant: IRestaurant) => void;
}

const RestaurantProfile = ({
  restaurant,
  isSeller,
  onUpdate,
}: IRestaurantProfileProps) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const toggleOpenStatus = async () => {
    if (!isSeller || !restaurant._id) return; // Only sellers can toggle status
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authenticatino token not found");
      }
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response.data.message || "Failed to toggle restaurant status",
      );
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const formData = new FormData();
      formData.append("name", name || "");
      formData.append("description", description || "");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      onUpdate(data.restaurant);

      setEditMode(false);
      setImageFile(null); // ✅ reset
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to update restaurant details",
      );
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/restaurant/status`,
        {
          status: false,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      localStorage.setItem("token", "");
      setIsAuth(false);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
      console.log(error);
    }
  };

  return (
    <div className="relative mx-auto max-w-xl bg-white shadow-sm rounded-xl overflow-hidden">
      {restaurant.image && (
        <img
          src={imageFile ? URL.createObjectURL(imageFile) : restaurant.image}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />
      )}
      {isSeller && editMode && (
        <label className="cursor-pointer text-sm text-white p-2 bg-gray-500 rounded-lg absolute top-4 right-4 flex items-center gap-1 hover:bg-gray-700 transition-colors">
          <BiImage size={16} className="inline-block mr-1" />
          Change Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
          />
        </label>
      )}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            {editMode ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border font-medium px-2 py-2 text-lg"
              />
            ) : (
              <h2 className="text-2xl font-medium">{restaurant.name}</h2>
            )}

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <BiMapPin className="h-4 w-4 text-red-500" />
              {restaurant.autoLocation.formattedAddress ||
                "Location not available"}
            </div>
          </div>
          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-gray-500 hover:text-black"
            >
              <BiEdit size={24} />
            </button>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border text-sm px-4 py-3"
          />
        ) : (
          <p className="text-gray-600 text-sm">
            {restaurant.description || "No description available"}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-300">
          <span
            className={`text-sm font-semibold ${
              isOpen ? "text-green-500" : "text-red-500"
            }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>

          <div className="flex gap-3">
            {isSeller && editMode && (
              <button
                onClick={saveChanges}
                className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 hover:bg-blue-700 rounded-lg"
              >
                <BiSave size={16} />
                {loading ? "Saving..." : "Save"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`text-sm py-1.5 px-4 rounded-lg text-white ${isOpen ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"}`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            )}
            {isSeller && (
              <button
                onClick={logoutHandler}
                className={`text-sm py-1.5 px-4 rounded-lg text-white bg-red-500 hover:bg-red-700`}
              >
                Logout
              </button>
            )}
          </div>
        </div>
        {isSeller && (
          <p className="text-sm text-gray-400">
            {" "}
            created at {new Date(restaurant.createdAt).toLocaleString()}
          </p>
        )}
        <p className="text-sm text-gray-400">
          {isSeller && (
            <span>
              {isOpen
                ? "Your restaurant is currently Open."
                : "Your restaurant is currently Closed."}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
