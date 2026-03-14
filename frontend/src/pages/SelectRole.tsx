import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

type Role = "customer" | "rider" | "seller" | null;

export const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      localStorage.setItem("token", data.token); // new token generated with role info updated into the existing login info
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (error) {
      alert("Something went wrong while selecting role");
      console.log(error);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">Select Role</h1>
        <div className="space-y-4">
          {roles.map((r) => (
            <button
              key={r}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${role === r ? "border-[#e23744] bg-[#e23744] text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!role}
          className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${!role ? "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500" : "border-[#e23744] bg-[#e23744] text-white hover:bg-[#c92b3e]"}`}
          onClick={addRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
