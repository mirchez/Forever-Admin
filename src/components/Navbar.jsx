import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img src={assets.logo} alt="logo" className="w-[max(10%, 80px)]" />
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:text-black hover:bg-white hover:shadow hover:scale-95 transition-all duration-300 ease-in"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
