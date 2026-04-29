import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const RegisterForm = ({ switchToLogin }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, mobileNumber, password } = form;

    // 🔴 frontend validation (match backend)
    if (!fullName || !password || (!email && !mobileNumber)) {
      return toast.error(
        "Provide fullName, password and email or mobile number"
      );
    }

    setLoading(true);

    try {
      // ✅ only send filled fields
      const payload = {
        fullName,
        password,
        ...(email && { email }),
        ...(mobileNumber && { mobileNumber }),
      };

      await register(payload);

      toast.success("Account created successfully");

      switchToLogin();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-4">
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        />

        {/* OR divider */}
        <p className="text-center text-xs text-gray-400">OR</p>

        {/* Mobile */}
        <input
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number (optional)"
          value={form.mobileNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-full bg-pink-600"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        Already have an account?{" "}
        <span
          onClick={switchToLogin}
          className="text-pink-400 cursor-pointer"
        >
          Log in
        </span>
      </p>
    </div>
  );
};

export default RegisterForm;