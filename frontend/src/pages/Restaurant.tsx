import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellerTab>("menu");

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload(); //Force reload to update token in headers for subsequent requests and fetch restaurant data again with new token
      }
    } catch (error) {
      console.log("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b border-gray-300">
          {[
            { key: "menu", label: "Menu Items" },
            { key: "add-item", label: "Add Item" },
            { key: "sales", label: "Sales" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SellerTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === tab.key ? "border-b-2 border-[#e23744] text-[#e23744]" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "menu" && <MenuItems />}
          {activeTab === "add-item" && (
            <AddMenuItem onItemAdded={() => {}} />
          )}
          {activeTab === "sales" && <p>Sales Page</p>}
        </div>
      </div>
    </div>
  );
};
 
export default Restaurant;
