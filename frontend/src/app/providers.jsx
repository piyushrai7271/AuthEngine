import { AuthProvider } from "../context/AuthContext.jsx";

const Providers = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Providers;