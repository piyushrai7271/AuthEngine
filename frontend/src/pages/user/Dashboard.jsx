import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import ChangePasswordModal from "../../components/auth/ChangePasswordModal"; // ✅ import

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">

      {/* 🔹 HEADER */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-600">
        <h1 className="text-xl font-semibold hover:text-pink-400">Dashboard</h1>

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
          <h2 className="text-3xl font-bold mb-2 hover:text-pink-400">
            Welcome {user?.fullName || "User"}
          </h2>
          <p className="text-gray-400 hover:text-pink-400">
            This is your dashboard
          </p>
        </div>
      </main>

      {/* ✅ REUSABLE MODAL */}
      {showModal && (
        <ChangePasswordModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;