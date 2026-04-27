import { createBrowserRouter } from "react-router-dom";

// pages
import Home from "../pages/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Dashboard from "../pages/user/Dashboard.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import NotFound from "../pages/NotFound.jsx";

// protected
import ProtectedRoute from "../components/layout/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />, // ✅ landing page
  },

  // fallback routes (optional but useful)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // 🔐 USER
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute role="user">
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // 🔐 ADMIN
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;