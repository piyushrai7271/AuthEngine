import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import OtpInput from "./OtpInput";

const ForgotFlow = ({ setMode }) => {
  const { setOtpToken, otpToken } = useAuth();

  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState(null);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  // 👁 visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ⏱️ TIMER
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getOtpValue = () => otp.join("");

  // 📩 SEND OTP
  const sendOtp = async () => {
    if (!form.identifier) {
      return toast.error("Enter email or mobile");
    }

    setLoading(true);

    try {
      const payload = form.identifier.includes("@")
        ? { email: form.identifier }
        : { mobileNumber: form.identifier };

      const res = await api.post("/api/auth/password/forgot", payload);

      const token = res?.data?.data?.otpToken;
      if (token) setOtpToken(token);

      toast.success("OTP sent if account exists");
      setStep(2);
      setTimer(30);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND
  const handleResend = () => {
    if (timer > 0) return;
    sendOtp();
  };

  // ✅ VERIFY OTP
  const verifyOtp = async () => {
    const finalOtp = getOtpValue();
    if (finalOtp.length !== 6) {
      return toast.error("Enter valid OTP");
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/api/auth/password/verify-otp",
        { otp: finalOtp },
        { headers: { Authorization: `Bearer ${otpToken}` } }
      );

      const token = res?.data?.data?.resetToken;

      if (token) {
        setResetToken(token);
        setStep(3);
        toast.success("OTP verified");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 RESET PASSWORD
  const resetPassword = async () => {
    if (!form.password || !form.confirmPassword) {
      return toast.error("Enter all fields");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      await api.post(
        "/api/auth/password/reset",
        {
          newPassword: form.password,
          confirmPassword: form.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${resetToken}` } }
      );

      toast.success("Password reset successful");
      setMode("login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) return sendOtp();
    if (step === 2) return verifyOtp();
    return resetPassword();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* STEP 1 */}
      {step === 1 && (
        <input
          type="text"
          name="identifier"
          placeholder="Email or Mobile"
          value={form.identifier}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        />
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <OtpInput otp={otp} setOtp={setOtp} />

          <div className="text-center text-sm text-gray-400">
            {timer > 0 ? (
              <span>Resend OTP in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-pink-400 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-slate-700 text-white pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-slate-700 text-white pr-10"
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 cursor-pointer"
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>
        </>
      )}

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-full bg-pink-600"
      >
        {loading
          ? "Processing..."
          : step === 1
          ? "Send OTP"
          : step === 2
          ? "Verify OTP"
          : "Reset Password"}
      </button>

      {/* BACK */}
      <p
        onClick={() => setMode("login")}
        className="text-sm text-gray-400 text-center cursor-pointer"
      >
        Back to login
      </p>
    </form>
  );
};

export default ForgotFlow;