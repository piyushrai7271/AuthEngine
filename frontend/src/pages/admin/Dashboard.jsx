// pages/admin/Dashboard.jsx

import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Dashboard Overview
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome back {user?.fullName || "Admin"}
        </p>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">
            Total Users
          </p>

          <h2 className="text-4xl font-bold text-white">
            0
          </h2>
        </div>

        {/* Active Sessions */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">
            Active Sessions
          </p>

          <h2 className="text-4xl font-bold text-white">
            0
          </h2>
        </div>

        {/* Security Alerts */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">
            Security Alerts
          </p>

          <h2 className="text-4xl font-bold text-white">
            0
          </h2>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-8 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Recent Activity
        </h3>

        <div className="text-gray-400 text-sm">
          No recent activity available.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;