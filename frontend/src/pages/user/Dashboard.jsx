import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔄 handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚪 logout current device
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // 🚪 logout all devices
  const handleLogoutAll = async () => {
    try {
      await api.post("/api/auth/logout-all");
      setUser(null);
      toast.success("Logged out from all devices");
      navigate("/");
    } catch (err) {
      toast.error("Logout all failed");
    }
  };

  // 🔐 change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/auth/change-password", form);

      toast.success("Password changed. Please login again");

      setShowModal(false);
      setUser(null);
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">

      {/* 🔹 HEADER */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-pink-600 rounded hover:bg-pink-700 text-sm"
          >
            Logout
          </button>

          <button
            onClick={handleLogoutAll}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-800 text-sm"
          >
            Logout All
          </button>
        </div>
      </header>

      {/* 🔹 MAIN CONTENT */}
      <main className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            Welcome {user?.fullName || "User"}
          </h2>
          <p className="text-gray-400">
            This is your dashboard
          </p>
        </div>
      </main>

      {/* 🔐 CHANGE PASSWORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#111827] p-6 rounded-xl w-96 space-y-4">

            <h2 className="text-lg font-semibold text-center">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">

              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#1f2937] outline-none"
                required
              />

              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#1f2937] outline-none"
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#1f2937] outline-none"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 p-2 rounded"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>

            <button
              onClick={() => setShowModal(false)}
              className="w-full text-sm text-gray-400"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;