import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, Monitor, User } from "lucide-react";

const navItems = [
  {
    name: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Sessions",
    path: "/admin/sessions",
    icon: Monitor,
  },
  {
    name: "Security Logs",
    path: "/admin/security-logs",
    icon: ShieldCheck,
  },
  {
    name: "Profile",
    path: "/admin/profile",
    icon: User,
  },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-yellow-400">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-pink-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;