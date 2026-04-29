import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import OtpInput from "./OtpInput";

const OtpFlow = () => {
  const { setUser, setOtpToken, otpToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const getOtpValue = () => otp.join("");

  // 📩 SEND OTP
  const handleSendOtp = async () => {
    if (!identifier) return toast.error("Enter email or mobile");

    setLoading(true);

    try {
      const payload = identifier.includes("@")
        ? { email: identifier }
        : { mobileNumber: identifier };

      const res = await api.post("/api/auth/login/otp/send", payload);
      const token = res?.data?.data?.otpToken;

      if (token) {
        setOtpToken(token);
        toast.success("OTP sent");
        setStep(2);
        setTimer(30);
      } else {
        toast.error("Account not found");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND
  const handleResend = () => {
    if (timer > 0) return;
    handleSendOtp();
  };

  // ✅ VERIFY
  const handleVerify = async () => {
    const finalOtp = getOtpValue();
    if (finalOtp.length !== 6) return toast.error("Enter valid OTP");

    setLoading(true);

    try {
      await api.post(
        "/api/auth/login/otp/verify",
        { otp: finalOtp },
        { headers: { Authorization: `Bearer ${otpToken}` } }
      );

      const res = await api.get("/api/auth/me");
      const user = res.data.data;

      setUser(user);
      toast.success("Login successful");

      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <input
          type="text"
          placeholder="Email or Mobile"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        />
      )}

      {step === 2 && (
        <>
          <OtpInput otp={otp} setOtp={setOtp} />

          <div className="text-center text-sm text-gray-400">
            {timer > 0 ? (
              <span>Resend OTP in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-pink-400 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      <button
        onClick={step === 1 ? handleSendOtp : handleVerify}
        disabled={loading}
        className="w-full py-2 rounded-full bg-pink-600"
      >
        {loading
          ? "Processing..."
          : step === 1
          ? "Send OTP"
          : "Verify & Login"}
      </button>
    </div>
  );
};

export default OtpFlow;