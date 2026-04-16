import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const handleVerify = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await axios.patch(
        `${adminService}/api/v1/admin/verify/restaurant/${restaurant._id}`,
        { isVerified: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Restaurant verified successfully");
      onVerify();
    } catch (error) {
      console.error("Error verifying restaurant:", error);
      toast.error("Failed to verify restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl space-y-2 shadow-sm bg-white p-4">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-40 w-full object-cover"
      />
      <h3 className="text-lg font-bold">{restaurant.name}</h3>
      <p className="text-gray-600">{restaurant.description}</p>
      <p className="text-gray-600">{restaurant.phone}</p>
      <p className="text-gray-600">
        {restaurant.autoLocation?.formattedAddress}
      </p>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify Restaurant"}
      </button>
    </div>
  );
};

export default AdminRestaurantCard;
