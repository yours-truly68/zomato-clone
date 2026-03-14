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
      const { data } = await axios.post(
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
              className="block w-full py-3 px-4 bg-[#e23744] text-white rounded-3xl hover:bg-[#cb2d3a] focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
