import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // wait for auth check
  if (loading) return <p>Loading...</p>;

  // not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;