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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post("/api/auth/change-password", form);

      toast.success("Password changed. Please login again.");

      // backend already cleared cookies
      setUser(null);

      navigate("/login"); // or "/"
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
      <div className="bg-[#111827] p-6 rounded-xl w-96 space-y-4 text-white">
        <h2 className="text-xl font-semibold text-center">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-slate-700"
            required
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-slate-700"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-slate-700"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 py-2 rounded"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;