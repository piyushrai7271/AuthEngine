import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import OAuthButtons from "./OAuthButtons";

const LoginForm = ({ switchToRegister }) => {
  const { login, setUser, setOtpToken, otpToken } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("password"); // password | otp
  const [step, setStep] = useState(1); // otp: 1 = send, 2 = verify
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    identifier: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔐 PASSWORD LOGIN
  const handlePasswordLogin = async () => {
    const res = await login({
      email: form.email,
      password: form.password,
    });

    if (res?.otpRequired) {
      toast.success("OTP sent");
      setTab("otp");
      setStep(2);
      return;
    }

    toast.success("Login successful");

    if (res.user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  // 📩 SEND OTP
  const handleSendOtp = async () => {
    if (!form.identifier) {
      return toast.error("Enter email or mobile");
    }

    const payload = form.identifier.includes("@")
      ? { email: form.identifier }
      : { mobileNumber: form.identifier };

    const res = await api.post("/api/auth/login/otp/send", payload);

    const token = res?.data?.data?.otpToken;

    if (token) {
      setOtpToken(token);
      toast.success("OTP sent");
      setStep(2);
    } else {
      toast.success("OTP sent if account exists");
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!form.otp) return toast.error("Enter OTP");

    await api.post(
      "/api/auth/login/otp/verify",
      { otp: form.otp },
      {
        headers: {
          Authorization: `Bearer ${otpToken}`,
        },
      }
    );

    const res = await api.get("/api/auth/me");
    const user = res.data.data;

    setUser(user);

    toast.success("Login successful");

    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === "password") {
        await handlePasswordLogin();
      } else {
        if (step === 1) {
          await handleSendOtp();
        } else {
          await handleVerifyOtp();
        }
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 🔷 TABS */}
      <div className="flex mb-6 border-b border-gray-600">
        <button
          onClick={() => {
            setTab("password");
            setStep(1);
          }}
          className={`flex-1 py-2 ${
            tab === "password"
              ? "border-b-2 border-pink-500 text-pink-400"
              : "text-gray-400"
          }`}
        >
          Password
        </button>

        <button
          onClick={() => {
            setTab("otp");
            setStep(1);
          }}
          className={`flex-1 py-2 ${
            tab === "otp"
              ? "border-b-2 border-pink-500 text-pink-400"
              : "text-gray-400"
          }`}
        >
          OTP
        </button>
      </div>

      {/* 🔷 FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* PASSWORD TAB */}
        {tab === "password" && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
              required
            />

            {/* PASSWORD WITH TOGGLE */}
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
                className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {/* EXTRA OPTIONS */}
            <div className="flex justify-between text-sm text-gray-400">
              <span
                className="cursor-pointer hover:text-pink-400"
                onClick={() => toast("Forgot password flow later")}
              >
                Forgot password?
              </span>
            </div>
          </>
        )}

        {/* OTP TAB */}
        {tab === "otp" && step === 1 && (
          <input
            type="text"
            name="identifier"
            placeholder="Email or Mobile"
            value={form.identifier}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
            required
          />
        )}

        {tab === "otp" && step === 2 && (
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full bg-slate-700 text-white text-center tracking-widest"
            required
          />
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-full bg-pink-600"
        >
          {loading
            ? "Processing..."
            : tab === "password"
            ? "Log In"
            : step === 1
            ? "Send OTP"
            : "Verify & Login"}
        </button>
      </form>

      {/* 🔷 DIVIDER */}
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-600"></div>
        <span className="px-2 text-sm text-gray-400">
          or continue with
        </span>
        <div className="flex-1 h-px bg-gray-600"></div>
      </div>

      {/* 🔷 OAUTH */}
      <OAuthButtons />

      {/* 🔷 REGISTER LINK */}
      <p className="mt-4 text-center text-gray-400 text-sm">
        New here?{" "}
        <span
          onClick={switchToRegister}
          className="text-pink-400 cursor-pointer"
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default LoginForm;