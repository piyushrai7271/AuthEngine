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

  const [showModal, setShowModal] =
    useState(false);

  // 🚪 LOGOUT CURRENT DEVICE
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);

      toast.success(
        "Logged out successfully"
      );

      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // 🚪 LOGOUT ALL DEVICES
  const handleLogoutAll = async () => {
    try {
      await api.post(
        "/api/auth/logout-all"
      );

      setUser(null);

      toast.success(
        "Logged out from all devices"
      );

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
          Manage your account settings
          and security
        </p>
      </div>

      {/* PROFILE SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT CARD */}
        <div className="xl:col-span-1 bg-[#111827] border border-gray-800 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center">
            {/* AVATAR */}
            <div className="w-24 h-24 rounded-full bg-pink-600 flex items-center justify-center text-4xl font-bold mb-5">
              {user?.fullName?.charAt(0) ||
                "A"}
            </div>

            {/* NAME */}
            <h2 className="text-2xl font-semibold">
              {user?.fullName}
            </h2>

            {/* EMAIL */}
            <p className="text-gray-400 mt-2 break-all">
              {user?.email}
            </p>

            {/* ROLE */}
            <span className="mt-4 px-4 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm capitalize">
              {user?.role}
            </span>
          </div>

          {/* FUTURE FEATURES */}
          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-400 mb-3">
              Upcoming Features
            </p>

            <div className="space-y-3">
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500">
                Upload Profile Picture
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500">
                Update Profile Information
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="xl:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-8">
          {/* ACCOUNT INFO */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-6">
              Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* FULL NAME */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-2">
                  Full Name
                </p>

                <p className="font-medium">
                  {user?.fullName}
                </p>
              </div>

              {/* EMAIL */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-2">
                  Email Address
                </p>

                <p className="font-medium break-all">
                  {user?.email}
                </p>
              </div>

              {/* ROLE */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-2">
                  Role
                </p>

                <p className="font-medium capitalize">
                  {user?.role}
                </p>
              </div>

              {/* VERIFIED */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-2">
                  Verification Status
                </p>

                <p
                  className={`font-medium ${
                    user?.isVerified
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {user?.isVerified
                    ? "Verified"
                    : "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY ACTIONS */}
          <div>
            <h3 className="text-xl font-semibold mb-6">
              Security Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CHANGE PASSWORD */}
              <button
                onClick={() =>
                  setShowModal(true)
                }
                className="px-5 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-medium"
              >
                Change Password
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="px-5 py-4 rounded-xl bg-pink-600 hover:bg-pink-700 transition-all font-medium"
              >
                Logout Current Device
              </button>

              {/* LOGOUT ALL */}
              <button
                onClick={handleLogoutAll}
                className="md:col-span-2 px-5 py-4 rounded-xl bg-gray-700 hover:bg-gray-800 transition-all font-medium"
              >
                Logout All Devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showModal && (
        <ChangePasswordModal
          onClose={() =>
            setShowModal(false)
          }
        />
      )}
    </div>
  );
};

export default Profile;