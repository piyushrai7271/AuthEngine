import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../services/auth.service";
import api from "../services/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 important
  const [otpToken, setOtpToken] = useState(null);

  // 🔍 FETCH CURRENT USER (used everywhere)
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      const currentUser = res.data.data;

      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  // 🚀 INITIAL AUTH HYDRATION
  useEffect(() => {
    const initAuth = async () => {
      await fetchCurrentUser(); // interceptor handles refresh
      setLoading(false); // ✅ only after attempt
    };

    initAuth();
  }, []);

  // 🔐 LOGIN
  const login = async (data) => {
    const res = await loginUser(data);
    const responseData = res?.data?.data;

    // 🔐 OTP required
    if (responseData?.otpToken) {
      setOtpToken(responseData.otpToken);
      return { otpRequired: true };
    }

    // ✅ normal login
    const currentUser = await fetchCurrentUser();

    return {
      otpRequired: false,
      user: currentUser,
    };
  };

  // 📝 REGISTER
  const register = async (data) => {
    return await registerUser(data);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
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
        fetchCurrentUser, // 🔥 useful for future
      }}
    >
      {/* 🔥 prevent UI flicker */}
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };