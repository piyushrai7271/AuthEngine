import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  logoutUser,
} from "../services/auth.service";

import api from "../services/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [otpToken, setOtpToken] =
    useState(null);

  // 🔍 FETCH CURRENT USER
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me");

      const currentUser = res.data.data;

      setUser(currentUser);

      return currentUser;
    } catch (err) {
      // ❌ only clear user if truly unauthorized
      if (err.response?.status === 401) {
        setUser(null);
      }

      return null;
    }
  };

  // 🚀 INITIAL AUTH HYDRATION
  useEffect(() => {
    const initAuth = async () => {
      await fetchCurrentUser();

      setLoading(false);
    };

    initAuth();
  }, []);

  // 🔐 LOGIN
  const login = async (data) => {
    const res = await loginUser(data);

    const responseData = res?.data?.data;

    // 🔐 OTP FLOW
    if (responseData?.otpToken) {
      setOtpToken(responseData.otpToken);

      return {
        otpRequired: true,
      };
    }

    // ✅ NORMAL LOGIN
    const currentUser =
      await fetchCurrentUser();

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
      setOtpToken(null);
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

        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };