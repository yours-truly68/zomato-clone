import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  //debouncing search input;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <div className="w-full shadow-sm bg-white">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-[#e23744] cursor-pointer"
        >
          Zomato-Clone
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative ">
            <CgShoppingCart className="h-6 w-6 text-[#e23744]" />
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center text-xs justify-center rounded-full bg-[#e23744] text-white ">
              0
            </span>
          </Link>
          {isAuth ? (
            <Link to={"/account"} className="font-medium text-[#e23744]">
              Profile
            </Link>
          ) : (
            <Link to="/login" className="font-medium text-[#e23744]">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* search input only on home page */}
      {isHomePage && (
        <div className=" border-t border-t-gray-200 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm">
            <div className="flex items-center px-3 gap-2 border-r text-gray-700 ">
              <BiMapPin className="h-4 w-4 text-[#e23744]" />
              <span className="text-sm truncate max-w-35">{city}</span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <BiSearch className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for restaurant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 text-sm outline-none "
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
