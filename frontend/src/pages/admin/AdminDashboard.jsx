import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import ChangePasswordModal from "../../components/auth/ChangePasswordModal"; // ✅ reuse

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [showModal, setShowModal] = useState(false);

  // 🚪 logout (current)
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // 🚪 logout all
  const handleLogoutAll = async () => {
    try {
      await api.post("/api/auth/logout-all");
      setUser(null);
      toast.success("Logged out from all devices");
      navigate("/");
    } catch {
      toast.error("Logout all failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">

      {/* 🔹 HEADER */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold text-yellow-400">
          Admin Panel
        </h1>

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

      {/* 🔹 MAIN */}
      <main className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            Welcome Admin {user?.fullName || ""}
          </h2>
          <p className="text-gray-400">
            This is your admin dashboard
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

export default AdminDashboard;