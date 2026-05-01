import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";

const Home = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const error = params.get("error");
    const message = params.get("message");

    if (error) {
      // 🔥 map backend errors to readable messages
      let errorMessage = "Authentication failed";

      switch (error) {
        case "GOOGLE_AUTH_FAILED":
          errorMessage = "Google login failed";
          break;
        case "AUTH_FAILED":
          errorMessage = message || "OAuth failed";
          break;
        default:
          errorMessage = message || "Something went wrong";
      }

      toast.error(errorMessage);

      // ✅ clean URL after showing error
      navigate("/", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-[85vh] text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 hover:text-pink-400 transition duration-300">
          Welcome To AuthEngine
        </h1>

        <p className="text-slate-400 text-sm max-w-xl hover:text-pink-300 transition duration-300">
          Secure authentication system with OTP, OAuth, and role-based access
        </p>
      </div>
    </div>
  );
};

export default Home;