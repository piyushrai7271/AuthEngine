import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);

      // 🔐 OTP required (admin flow)
      if (res?.otpRequired) {
        toast.success("OTP sent to your email");
        navigate("/otp");
        return;
      }

      // ✅ Normal login
      toast.success("Login successful");

      if (res.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded w-80 space-y-4 bg-white"
      >
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* OTP login entry */}
        <button
          type="button"
          onClick={() => navigate("/otp-login")}
          className="w-full border p-2 rounded"
        >
          Login with OTP
        </button>
      </form>
    </div>
  );
};

export default Login;