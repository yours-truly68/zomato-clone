import { useNavigate } from "react-router-dom";

interface RestaurantCardProps {
  id: string;
  name: string;
  image?: string;
  distance: string;
  isOpen: boolean;
}
const RestaurantCard = ({
  id,
  name,
  image,
  distance,
  isOpen,
}: RestaurantCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`cursor-pointer overflow-hidden shadow-sm hover:shadow-md rounded-xl bg-white transition ${!isOpen ? "opacity-70" : ""}`}
      onClick={() => navigate(`/restaurant/${id}`)}
    ></div>
  );
};

export default RestaurantCard;
