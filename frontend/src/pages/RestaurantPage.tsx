import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IRestaurant } from "../types";
import type { IMenuItem } from "./Restaurant";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurantDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view restaurant details");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/single/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRestaurant(data.restaurant || null);
    } catch (error) {
      console.log("Error fetching restaurant details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMenuItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view menu items");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("MENU API RESPONSE:", data);
      setMenuItems(data || []);
    } catch (error) {
      console.log("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
      fetchMenuItems();
    }
  }, [id, fetchMenuItems, fetchRestaurantDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Fetching restaurant details...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Restaurant not found.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={false}
      />

      <div className="rounded-xl bg-white shadow-sm px-3 py-4">
        <h3 className="text-xl font-medium text-gray-600 mb-4 text-left ">
          Menu Items
        </h3>
        <MenuItems
          isSeller={false}
          menuItems={menuItems}
          onDeleteItems={() => {}}
        />
      </div>
    </div>
  );
};

export default RestaurantPage;
