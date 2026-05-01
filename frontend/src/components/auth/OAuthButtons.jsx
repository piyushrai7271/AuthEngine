import { useState } from "react";

const OAuthButtons = () => {
  const [loading, setLoading] = useState(null); // "google" | "github" | null

  // 🔥 SAFE API URL (fallback added)
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:4000";


  const handleGoogleLogin = () => {
    const url = `${API_URL}/api/oauth/google`;

    console.log("Redirecting to Google:", url);

    setLoading("google");
    window.location.href = url;
  };

  const handleGithubLogin = () => {
    const url = `${API_URL}/api/oauth/github`;

    console.log("Redirecting to GitHub:", url);

    setLoading("github");
    window.location.href = url;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* GOOGLE */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading !== null}
        className="w-full py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-50"
      >
        {loading === "google" ? "Redirecting..." : "Continue with Google"}
      </button>

      {/* GITHUB */}
      <button
        onClick={handleGithubLogin}
        disabled={loading !== null}
        className="w-full py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {loading === "github" ? "Redirecting..." : "Continue with GitHub"}
      </button>
    </div>
  );
};

export default OAuthButtons;