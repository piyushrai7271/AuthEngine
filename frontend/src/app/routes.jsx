import { createBrowserRouter } from "react-router-dom";

// pages
import Home from "../pages/Home.jsx";
import Dashboard from "../pages/user/Dashboard.jsx";
import NotFound from "../pages/NotFound.jsx";
import OtpPage from "../pages/OtpPage.jsx";

// admin pages
import AdminLayout from "../components/layout/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Users from "../pages/admin/Users.jsx";
import Sessions from "../pages/admin/Sessions.jsx";
import SecurityLogs from "../pages/admin/SecurityLogs.jsx";
import Profile from "../pages/admin/Profile.jsx";

// protected
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },

  {
    path: "/otp",
    element: <OtpPage />,
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
        <AdminLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },

      {
        path: "users",
        element: <Users />,
      },

      {
        path: "sessions",
        element: <Sessions />,
      },

      {
        path: "security-logs",
        element: <SecurityLogs />,
      },

      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;