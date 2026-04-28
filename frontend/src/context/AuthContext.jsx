import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../services/auth.service";
import api from "../services/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpToken, setOtpToken] = useState(null);

  // 🔍 get current user (cookie-based session)
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setUser(null);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🔐 LOGIN (fixed)
  const login = async (data) => {
    const res = await loginUser(data);

    const responseData = res?.data?.data;

    // 🔐 OTP required (admin / otp login)
    if (responseData?.otpToken) {
      setOtpToken(responseData.otpToken);
      return { otpRequired: true };
    }

    // ✅ Normal login → fetch user
    const currentUser = await fetchCurrentUser();

    return {
      otpRequired: false,
      user: currentUser,
    };
  };

  // 📝 REGISTER
  const register = async (data) => {
    const res = await registerUser(data);
    return res;
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        otpToken,
        login,
        register,
        logout,
        setUser,
        setOtpToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };