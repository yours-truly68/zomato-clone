import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

export interface AddMenuItemProps {
  onItemAdded: () => void;
}

const AddMenuItem = ({ onItemAdded }: AddMenuItemProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Please fill in all required fields (Name, Price, Image)");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);

    try {
      setLoading(true);
      const response = await axios.post(
        `${restaurantService}/api/item/new`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(response.data.message || "Menu item added successfully!");
      resetForm();
      onItemAdded(); //Notify parent if needed to refresh menu items list
      setLoading(false);
    } catch (error: any) {
      console.log(error.response?.data.message || "Error adding menu item");
      toast.error("Failed to add menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md space-y-4 mx-auto">
      <h2 className="text-lg font-semibold">Add Menu Item</h2>
      {/* Name Input */}
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-200 rounded-lg text-sm outline-none px-4 py-3 focus:ring-1 focus:ring-gray-300"
      />

      {/* Description Input */}
      <textarea
        placeholder="Item Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-200 rounded-lg text-sm outline-none px-4 py-3 focus:ring-1 focus:ring-gray-300"
      />

      {/* Price Input */}
      <input
        type="number"
        min={0}
        placeholder="Price (INR)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border border-gray-200 rounded-lg text-sm outline-none px-4 py-3 focus:ring-1 focus:ring-gray-300"
      />
      {/* Image Upload */}
      <label className="cursor-pointer flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100">
        <BiUpload className="h-5 w-5 text-red-500" />
        {image ? image.name : "Upload Restaurant Image"}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          hidden
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full transition bg-[#e23744] text-white py-3 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
};

export default AddMenuItem;
