// components/layout/AdminHeader.jsx

import { Bell, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const AdminHeader = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b border-gray-800 bg-[#111827] px-6 flex items-center justify-between">
      {/* LEFT */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Welcome back
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Manage your authentication system
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* SEARCH */}
        <div className="hidden md:flex items-center bg-[#1f2937] px-4 py-2 rounded-lg border border-gray-700">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm ml-2 text-white placeholder:text-gray-500"
          />
        </div>

        {/* NOTIFICATION */}
        <button className="relative p-2 rounded-lg bg-[#1f2937] border border-gray-700 hover:bg-gray-700 transition-all">
          <Bell size={20} />

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500"></span>
        </button>

        {/* USER INFO */}
        <div className="flex items-center gap-3 bg-[#1f2937] px-4 py-2 rounded-lg border border-gray-700">
          <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-semibold text-white">
            {user?.fullName?.charAt(0) || "A"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              {user?.fullName || "Admin"}
            </p>

            <p className="text-xs text-gray-400 capitalize">
              {user?.role || "admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;