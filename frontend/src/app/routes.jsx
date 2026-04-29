import { createBrowserRouter } from "react-router-dom";

// pages
import Home from "../pages/Home.jsx";
import Dashboard from "../pages/user/Dashboard.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import NotFound from "../pages/NotFound.jsx";


// protected
import ProtectedRoute from "../components/layout/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />, // landing + modal auth
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