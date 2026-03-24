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
      className={`cursor-pointer overflow-hidden shadow-sm hover:shadow-md rounded-xl bg-white transition ${!isOpen ? "opacity-80" : ""}`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition duration-300 hover:scale-1.05 ${!isOpen ? "grayscale" : ""}`}
        />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center m-1.5">
            <span className="text-sm font-semibold rounded-lg py-2 px-4 text-white shadow-lg mt-2 bg-black/70 backdrop-blur-sm">
              CLOSED
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-medium truncate text-gray-800">{name}</h3>
        <p className="text-gray-500 text-sm">{distance} away</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
