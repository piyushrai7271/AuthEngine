import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import OtpFlow from "../components/auth/OtpFlow";

const OtpPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setOtpToken } = useAuth();

  useEffect(() => {
    const token = params.get("otpToken");
    const type = params.get("type");

    // ❌ no token → invalid access
    if (!token) {
      navigate("/");
      return;
    }

    // ✅ store token in context
    setOtpToken(token);

    // optional: validate type
    if (type !== "oauth") {
      console.warn("Non-oauth OTP flow");
    }
  }, [params, setOtpToken, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
      <div className="bg-[#111827] p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Verify OTP
        </h2>

        {/* 🔥 reuse existing OTP flow */}
        <OtpFlow />
      </div>
    </div>
  );
};

export default OtpPage;