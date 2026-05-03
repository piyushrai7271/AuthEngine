// pages/admin/Profile.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

import ChangePasswordModal from "../../components/auth/ChangePasswordModal";

const Profile = () => {
  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  const [showModal, setShowModal] = useState(false);

  // 🚪 LOGOUT CURRENT DEVICE
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);

      toast.success("Logged out successfully");

      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // 🚪 LOGOUT ALL DEVICES
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
    <div className="min-h-screen bg-[#0b0f19] text-white p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Admin Profile
        </h1>

        <p className="text-gray-400 mt-2">
          Manage your account settings and security
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 max-w-3xl">
        <div className="flex items-center gap-5 mb-8">
          {/* AVATAR */}
          <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center text-3xl font-bold">
            {user?.fullName?.charAt(0) || "A"}
          </div>

          {/* USER INFO */}
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.fullName}
            </h2>

            <p className="text-gray-400 mt-1">
              {user?.email}
            </p>

            <p className="text-sm text-pink-400 capitalize mt-2">
              {user?.role}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 transition-all"
          >
            Logout
          </button>

          <button
            onClick={handleLogoutAll}
            className="px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-800 transition-all sm:col-span-2"
          >
            Logout All Devices
          </button>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showModal && (
        <ChangePasswordModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Profile;