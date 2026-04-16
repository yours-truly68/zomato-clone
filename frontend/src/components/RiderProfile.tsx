import type { IOrder, IRider } from "../types";

interface RiderProfileProps {
  riderProfile: IRider;
  userName: string;
  toggle: boolean;
  currentOrder: IOrder | null;
  onToggle: () => void;
}

const RiderProfile = ({
  riderProfile,
  userName,
  toggle,
  onToggle,
  currentOrder,
}: RiderProfileProps) => {
  return (
    <div className="space-y-4 bg-gray-50 py-6">
      <div className="mx-auto max-w-md px-4 py-4 ">
        <div className="bg-white p-4 space-y-3 rounded-lg shadow">
          <img
            src={riderProfile.picture}
            alt="Rider Profile Picture"
            className="rounded-full h-24 w-24 object-cover mx-auto"
          />
          <p className="text-center font-medium text-gray-700">
            {userName || "Rider Name: Not Available"}
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            {riderProfile.phone || "Phone: Not Available"}
          </p>

          <div className="flex justify-center gap-2">
            <span
              className={`px-4 py-1 text-xs rounded-full ${riderProfile.isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600 shadow shadow-gray-300/50"}`}
            >
              {riderProfile.isVerified ? "Verified" : "Pending Verification"}
            </span>
            <span
              className={`px-4 py-1 text-xs rounded-full ${riderProfile.isAvailable ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600 shadow shadow-gray-300/50"}`}
            >
              {riderProfile.isAvailable ? "Online" : "Offline"}
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <p className="text-blue-400 text-sm text-center">
              Please be within 500m of any restaurant (which we call the
              hotspot) before going online as rider to receive orders
            </p>
          </div>
          {riderProfile.isVerified && !currentOrder && (
            <button
              className={`w-full rounded-lg py-2 text-sm ${toggle ? "bg-gray-500 hover:bg-gray-500" : !riderProfile.isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-[#e23744] hover:bg-[#d12f3a]"} text-white`}
              onClick={onToggle}
              disabled={toggle}
            >
              {toggle
                ? "Updating..."
                : riderProfile.isAvailable
                  ? "Go Offline"
                  : "Go Online"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
