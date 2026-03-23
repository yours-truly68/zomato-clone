import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";

export const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    //haversine formula to calculate distance between two lat/lon points in km
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2); // Distance in km rounded to 2 decimal places
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      // alert(
      //   "Location not available. Please allow location access and try again.",
      // );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to view restaurants.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search: searchQuery,
          },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, searchQuery]);

  if (loading || !location) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Fetching restaurants near you...</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 ">
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-2 gap-4">
          {restaurants.map((restaurant) => {
            const [resLong, resLat] = restaurant.autoLocation.coordinates;
            const distance = getDistance(
              location.latitude,
              location.longitude,
              resLat,
              resLong,
            );

            return (
              <RestaurantCard
                key={restaurant._id}
                distance={`${distance} km`}
                id={restaurant._id}
                name={restaurant.name}
                image={
                  restaurant.image ??
                  "https://via.placeholder.com/400x300?text=No+Image"
                }
                isOpen={restaurant.isOpen}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No restaurants found.</p>
      )}
    </div>
  );
};
