import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ChangePasswordModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // 👁️ visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post("/api/auth/change-password", form);

      toast.success("Password changed. Please login again.");
      setUser(null);
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111827] p-6 rounded-3xl w-96 space-y-4 text-white relative overflow-visible">

        {/* ❌ CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 text-xl hover:text-white z-20"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center hover:text-pink-400">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CURRENT PASSWORD */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              placeholder="Current Password"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 rounded-2xl bg-slate-700 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xl z-30 cursor-pointer"
            >
              {showCurrent ? "🙈" : "👁️"}
            </button>
          </div>

          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 rounded-2xl bg-slate-700 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xl z-30 cursor-pointer"
            >
              {showNew ? "🙈" : "👁️"}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 rounded-2xl bg-slate-700 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xl z-30 cursor-pointer"
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 py-2 rounded-2xl"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 mt-2 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;