import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PasswordForm = ({ setMode, switchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);

      if (res?.otpRequired) {
        toast.success("OTP sent");
        return;
      }

      toast.success("Login successful");

      navigate(res.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        required
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white pr-10"
          required
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 cursor-pointer"
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span
          onClick={() => setMode("forgot")}
          className="cursor-pointer hover:text-pink-400"
        >
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-full bg-pink-600"
      >
        {loading ? "Processing..." : "Log In"}
      </button>

      {/* REGISTER */}
      <p className="mt-4 text-center text-gray-400 text-sm">
        New here?{" "}
        <span
          onClick={switchToRegister}
          className="text-pink-400 cursor-pointer"
        >
          Sign up
        </span>
      </p>
    </form>
  );
};

export default PasswordForm;