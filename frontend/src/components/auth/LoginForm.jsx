import { useState } from "react";
import PasswordForm from "./PasswordForm";
import OtpFlow from "./OtpFlow";
import ForgotFlow from "./ForgotFlow";
import OAuthButtons from "./OAuthButtons";

const LoginForm = ({ switchToRegister }) => {
  const [mode, setMode] = useState("login"); // login | forgot
  const [tab, setTab] = useState("password");

  return (
    <div>
      {/* TABS */}
      {mode === "login" && (
        <div className="flex mb-6 border-b border-gray-600">
          <button
            onClick={() => setTab("password")}
            className={`flex-1 py-2 ${
              tab === "password"
                ? "border-b-2 border-pink-500 text-pink-400"
                : "text-gray-400"
            }`}
          >
            Password
          </button>

          <button
            onClick={() => setTab("otp")}
            className={`flex-1 py-2 ${
              tab === "otp"
                ? "border-b-2 border-pink-500 text-pink-400"
                : "text-gray-400"
            }`}
          >
            OTP
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      {mode === "login" && tab === "password" && (
        <PasswordForm setMode={setMode} switchToRegister={switchToRegister} />
      )}

      {mode === "login" && tab === "otp" && <OtpFlow />}

      {mode === "forgot" && <ForgotFlow setMode={setMode} />}

      {/* ✅ OAUTH (ONLY PASSWORD TAB) */}
      {mode === "login" && tab === "password" && (
        <>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="px-2 text-sm text-gray-400">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          <OAuthButtons />
        </>
      )}
    </div>
  );
};

export default LoginForm;