// services/admin.service.js

import api from "./api";

// 📊 Dashboard Overview
export const getDashboardOverview = async () => {
  const response = await api.get(
    "/api/admin/dashboard-overview"
  );

  return response.data.data;
};

// 👥 Get All Users
export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  blocked = "",
}) => {
  const response = await api.get("/api/admin/users", {
    params: {
      page,
      limit,
      search,
      blocked,
    },
  });

  return response.data.data;
};

// 🚫 Block User
export const blockUser = async (userId) => {
  const response = await api.patch(
    `/api/admin/users/${userId}/block`
  );

  return response.data;
};

// ✅ Unblock User
export const unblockUser = async (userId) => {
  const response = await api.patch(
    `/api/admin/users/${userId}/unblock`
  );

  return response.data;
};

// 🗑️ Delete User
export const deleteUser = async (userId) => {
  const response = await api.delete(
    `/api/admin/users/${userId}`
  );

  return response.data;
};

// 💻 Get Active Sessions
export const getActiveSessions = async ({
  page = 1,
  limit = 10,
}) => {
  const response = await api.get(
    "/api/admin/sessions",
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data.data;
};

// ❌ Revoke Session
export const revokeSession = async (
  sessionId
) => {
  const response = await api.patch(
    `/api/admin/sessions/${sessionId}/revoke`
  );

  return response.data;
};

// 🔐 Get Security Logs
export const getSecurityLogs = async ({
  page = 1,
  limit = 20,
  action = "",
  status = "",
}) => {
  const response = await api.get(
    "/api/admin/security-logs",
    {
      params: {
        page,
        limit,
        action,
        status,
      },
    }
  );

  return response.data.data;
};