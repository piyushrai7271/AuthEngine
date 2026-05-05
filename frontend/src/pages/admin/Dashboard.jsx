// pages/admin/Dashboard.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardOverview } from "../../services/admin.service";

const Dashboard = () => {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 📊 fetch dashboard overview
  useEffect(() => {
    const fetchDashboardOverview = async () => {
      try {
        setLoading(true);

        const data = await getDashboardOverview();

        setOverview(data);
      } catch (error) {
        setError(
          error.message || "Failed to fetch dashboard overview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOverview();
  }, []);

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

      {/* ERROR */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="text-gray-400">
          Loading dashboard overview...
        </div>
      ) : (
        <>
          {/* OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-2">
                Total Users
              </p>

              <h2 className="text-4xl font-bold text-white">
                {overview?.users?.totalUsers || 0}
              </h2>
            </div>

            {/* Active Sessions */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-2">
                Active Sessions
              </p>

              <h2 className="text-4xl font-bold text-white">
                {overview?.sessions?.activeSessions || 0}
              </h2>
            </div>

            {/* Blocked Users */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-2">
                Blocked Users
              </p>

              <h2 className="text-4xl font-bold text-white">
                {overview?.users?.blockedUsers || 0}
              </h2>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="mt-8 bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-6">
              Recent Activity
            </h3>

            {overview?.recentActivities?.length > 0 ? (
              <div className="space-y-4">
                {overview.recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="border border-gray-800 rounded-xl p-4 bg-[#0f172a]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {activity.action}
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          {activity.message}
                        </p>
                      </div>

                      <div className="text-xs text-gray-500">
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                No recent activity available.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;