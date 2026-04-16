import { useCallback, useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { adminService } from "../main";

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [restaurantLoading, setRestaurantLoading] = useState<boolean>(false);
  const [riderLoading, setRiderLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"restaurants" | "riders">(
    "restaurants",
  );

  const fetchData = useCallback(async () => {
    setRestaurantLoading(true);
    setRiderLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const [restaurantData, riderData] = await Promise.allSettled([
        axios.get(`${adminService}/api/v1/admin/restaurant/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${adminService}/api/v1/admin/rider/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setRestaurants(
        restaurantData.status === "fulfilled"
          ? restaurantData.value.data.restaurants
          : [],
      );
      setRiders(
        riderData.status === "fulfilled" ? riderData.value.data.riders : [],
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRestaurantLoading(false);
      setRiderLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (restaurantLoading || riderLoading) {
    return (
      <div className="flex h-[60vh] justify-center items-center text-gray-500 text-lg">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-700">Admin Dashboard</h1>

      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-md ${
            activeTab === "restaurants"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("restaurants")}
        >
          Restaurants
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            activeTab === "riders"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("riders")}
        >
          Riders
        </button>
      </div>
    </div>
  );
};

export default Admin;
