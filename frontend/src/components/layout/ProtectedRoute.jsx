import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // ✅ wait until auth hydration completes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        Loading...
      </div>
    );
  }

  // ✅ no user after loading finished
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;