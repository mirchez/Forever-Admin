import { assets } from "../assets/assets";
import ModeToggle from "./ModeToggle";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img src={assets.logo} alt="logo" className="w-44" />
      <div className="flex items-center gap-3">
        <ModeToggle />
        <button
          onClick={() => setToken("")}
          className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:text-black hover:bg-white hover:shadow hover:scale-95 transition-all duration-300 ease-in"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Navbar;
