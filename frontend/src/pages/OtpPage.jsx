import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import OtpFlow from "../components/auth/OtpFlow";

const OtpPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { otpToken, setOtpToken } = useAuth();

  useEffect(() => {
    const queryToken = params.get("otpToken");
    const type = params.get("type");

    // ✅ OAuth flow → token comes from URL
    if (queryToken) {
      setOtpToken(queryToken);
    }

    // ❌ no token anywhere
    if (!queryToken && !otpToken) {
      navigate("/");
      return;
    }

    console.log("OTP Flow Type:", type);
  }, [params, otpToken, setOtpToken, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
      <div className="bg-[#111827] p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Verify OTP
        </h2>

        <OtpFlow />
      </div>
    </div>
  );
};

export default OtpPage;