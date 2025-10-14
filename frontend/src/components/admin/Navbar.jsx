
import { Bell, Search, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none px-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-600 hover:text-primary cursor-pointer" />
        <UserCircle className="text-gray-600 hover:text-primary cursor-pointer" size={28} />
      </div>
    </header>
  );
};

export default Navbar;

