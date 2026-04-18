import { useState } from "react";
import { FiEyeOff } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import type { IMenuItem } from "../types";
import { FaCircle } from "react-icons/fa6";
interface MenuItemsProps {
  isSeller: boolean;
  menuItems: IMenuItem[];
  onDeleteItems: () => void;
}

const MenuItems = ({ isSeller, menuItems, onDeleteItems }: MenuItemsProps) => {
  // const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?",
    );
    if (!confirm) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to perform this action.");
        return;
      }

      await axios.delete(`${restaurantService}/api/item/delete/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Item deleted successfully");
      onDeleteItems();
    } catch (error) {
      console.log("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };
  const toggleAvailibility = async (itemId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to perform this action.");
        return;
      }

      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      onDeleteItems();
    } catch (error) {
      console.log("Error updating item availability:", error);
      toast.error("Failed to update item availability");
    }
  };

  const { fetchCart } = useAppData();

  const addToCart = async (itemId: string, restaurantId: string) => {
    try {
      setLoadingItemId(itemId);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to perform this action.");
        return;
      }

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add-to-cart`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      console.log("Error adding item to cart:", error);
      toast.error(error.response.data.message || "Failed to add item to cart");
    } finally {
      setLoadingItemId(null);
    }
  };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 poppins">
      {menuItems &&
        menuItems.map((item) => {
          const isLoading = loadingItemId === item._id;

          return (
            <div
              key={item._id}
              className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md max-w-sm ${!item.isAvailable ? "opacity-50" : ""}`}
            >
              {/* <div className="absolute top-3 right-3">
                <BsBookmarkFill
                  size={24}
                  className={`text-lg ${
                    item.isVeg ? "text-green-500" : "text-red-500"
                  }`}
                />
              </div> */}
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-20 w-20 rounded object-cover ${!item.isAvailable ? "grayscale brightness-75" : ""}`}
                />
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white text-center rounded-lg">
                    Not Available
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between ">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-lg font-medium">₹{item.price}</p>
                  <div
                    className={`flex items-center gap-1 py-1 px-2 rounded-full ${item.isVeg ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <FaCircle
                      className={`${item.isVeg ? "text-green-600" : "text-red-600"} text-xs`}
                    />
                    <span className="text-xs text-gray-500">
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                  {isSeller && (
                    <div>
                      <button
                        onClick={() => toggleAvailibility(item._id)}
                        className="rounded-lg p-2  text-gray-600 hover:underline hover:text-gray-700 text-sm hover:bg-gray-100"
                      >
                        {item.isAvailable ? (
                          <BsEye size={18} />
                        ) : (
                          <FiEyeOff size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(item._id);
                        }}
                        className="rounded-lg p-2  text-red-600 hover:text-red-700 text-sm hover:bg-red-100 ml-2"
                      >
                        <BiTrash size={18} />
                      </button>
                    </div>
                  )}
                  {!isSeller && (
                    <button
                      onClick={() => addToCart(item._id, item.restaurantId)}
                      disabled={!item.isAvailable || isLoading}
                      className={`flex items-center justify-center rounded-xl p-2 text-sm font-medium transition ${
                        !item.isAvailable || isLoading
                          ? "cursor-not-allowed text-gray-400"
                          : "text-red-600 hover:text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {isLoading ? (
                        <VscLoading size={18} className="animate-spin" />
                      ) : (
                        <BsCartPlus size={18} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MenuItems;
