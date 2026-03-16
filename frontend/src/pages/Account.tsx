import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setIsAuth } = useAppData();
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "";

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    navigate("/login", { replace: true });
    setIsAuth(false);
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-b-gray-200 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-semibold text-white">
            {firstLetter}
          </div>
          <div>
            <h2 className="text-lg font-medium">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="divide-y">
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50 border-none"
            onClick={() => navigate("/orders")}
          >
            <BiPackage className="h-5 w-5 text-red-500" />
            <span className="font-regular">Your Orders</span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50 border-none"
            onClick={() => navigate("/address")}
          >
            <BiMapPin className="h-5 w-5 text-red-500" />
            <span className="font-regular">Addresses</span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50"
            onClick={logoutHandler}
          >
            <BiLogOut className="h-5 w-5 text-red-500" />
            <span className="font-regular">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
