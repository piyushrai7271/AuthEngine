import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import OtpInput from "./OtpInput";

const OtpFlow = () => {
  const {
    setUser,
    setOtpToken,
    otpToken,
    fetchCurrentUser,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["","","","","","",]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  

  // ✅ detect dedicated OTP page
  const isOtpPage =
    window.location.pathname === "/otp";

  // ✅ HANDLE OAUTH / ADMIN 2FA FLOW
  useEffect(() => {
    if (otpToken && isOtpPage) {
      setStep(2);
      setTimer(30);
    }
  }, [otpToken, isOtpPage]);

  // ✅ CLEANUP OLD TOKENS
  // prevents stale admin/user flow mixing
  useEffect(() => {
    return () => {
      if (!isOtpPage) {
        setOtpToken(null);
      }
    };
  }, [isOtpPage, setOtpToken]);

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
    if (!identifier) {
      return toast.error("Enter email or mobile");
    }

    // ✅ clear previous flow token
    setOtpToken(null);

    setLoading(true);

    try {
      const payload = identifier.includes("@")
        ? { email: identifier }
        : { mobileNumber: identifier };

      const res = await api.post(
        "/api/auth/login/otp/send",
        payload
      );

      const token = res?.data?.data?.otpToken;

      if (!token) {
        return toast.error("Account not found");
      }

      // ✅ store fresh token
      setOtpToken(token);

      toast.success("OTP sent");

      setStep(2);

      setTimer(30);

    } catch (err) {
      toast.error(
        err.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    if (timer > 0) return;

    if (!otpToken) {
      return toast.error("OTP session expired");
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/api/auth/login/otp/resend",
        {},
        {
          headers: {
            Authorization: `Bearer ${otpToken}`,
          },
        }
      );

      // ✅ update fresh otpToken
      const newOtpToken =
        res?.data?.data?.otpToken;

      if (newOtpToken) {
        setOtpToken(newOtpToken);
      }

      // ✅ clear old OTP boxes
      setOtp(["", "", "", "", "", ""]);

      toast.success("OTP resent");

      setTimer(30);

    } catch (err) {
      toast.error(
        err.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY OTP
  const handleVerify = async () => {
    const finalOtp = getOtpValue();

    if (finalOtp.length !== 6) {
      return toast.error("Enter valid OTP");
    }

    if (!otpToken) {
      return toast.error("OTP session expired");
    }

    setLoading(true);

    try {
      // ✅ verify OTP
      await api.post(
        "/api/auth/login/otp/verify",
        { otp: finalOtp },
        {
          headers: {
            Authorization: `Bearer ${otpToken}`,
          },
        }
      );

      // ✅ fetch logged-in user
      const currentUser =
        await fetchCurrentUser();

      if (!currentUser) {
        throw new Error("Failed to load user");
      }

      // ✅ update auth context
      setUser(currentUser);

      // ✅ clear temporary otp token
      setOtpToken(null);

      toast.success("Login successful");

      // ✅ prevent ProtectedRoute race condition
      setTimeout(() => {
        navigate(
          currentUser.role === "admin"
            ? "/admin"
            : "/dashboard"
        );
      }, 100);

    } catch (err) {
      toast.error(
        err.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* STEP 1 */}
      {step === 1 && (
        <input
          type="text"
          placeholder="Email or Mobile"
          value={identifier}
          onChange={(e) =>
            setIdentifier(e.target.value)
          }
          className="w-full px-4 py-2 rounded-full bg-slate-700 text-white"
        />
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <OtpInput
            otp={otp}
            setOtp={setOtp}
          />

          <div className="text-center text-sm text-gray-400">
            {timer > 0 ? (
              <span>
                Resend OTP in {timer}s
              </span>
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
        onClick={
          step === 1
            ? handleSendOtp
            : handleVerify
        }
        disabled={loading}
        className="w-full py-2 rounded-full bg-pink-600 disabled:opacity-50"
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