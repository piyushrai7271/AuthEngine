// pages/admin/Sessions.jsx

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";

import {
  getActiveSessions,
  revokeSession,
} from "../../services/admin.service";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // 💻 fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);

        const data =
          await getActiveSessions({
            page,
            limit: 10,
          });

        setSessions(data.sessions);

        setPagination(data.pagination);
      } catch (error) {
        setError(
          error.message ||
            "Failed to fetch sessions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [page]);

  // ❌ revoke session
  const handleRevokeSession = async (
    sessionId
  ) => {
    const confirmRevoke = window.confirm(
      "Are you sure you want to revoke this session?"
    );

    if (!confirmRevoke) return;

    try {
      setActionLoading(sessionId);

      await revokeSession(sessionId);

      // remove revoked session instantly
      setSessions((prev) =>
        prev.filter(
          (session) =>
            session._id !== sessionId
        )
      );

      toast.success(
        "Session revoked successfully"
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Failed to revoke session"
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Active Sessions
        </h1>

        <p className="text-gray-400 mt-2">
          Monitor and manage active user
          sessions
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <Loader text="Loading sessions..." />
      ) : (
        <>
          {/* EMPTY */}
          {sessions.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-10 text-center text-gray-400">
              No active sessions found
            </div>
          ) : (
            <>
              {/* TABLE */}
              <Table
                columns={[
                  "User",
                  "Email",
                  "Role",
                  "Created",
                  "Expires",
                  "Status",
                  "Actions",
                ]}
              >
                {sessions.map((session) => (
                  <tr
                    key={session._id}
                    className="border-b border-gray-800 hover:bg-[#111827]"
                  >
                    {/* USER */}
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {session.user?.fullName ||
                          "Unknown"}
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-gray-300">
                      {session.user?.email ||
                        "N/A"}
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-4 capitalize">
                      {session.user?.role ||
                        "user"}
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(
                        session.createdAt
                      ).toLocaleString()}
                    </td>

                    {/* EXPIRES */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(
                        session.expiresAt
                      ).toLocaleString()}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Active
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4">
                      <button
                        disabled={
                          actionLoading ===
                          session._id
                        }
                        onClick={() =>
                          handleRevokeSession(
                            session._id
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
                      >
                        {actionLoading ===
                        session._id
                          ? "Processing..."
                          : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>

              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Page{" "}
                  {pagination?.currentPage || 1} of{" "}
                  {pagination?.totalPages || 1}
                </p>

                <div className="flex gap-3">
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((prev) => prev - 1)
                    }
                    className="px-4 py-2 rounded-lg bg-[#111827] border border-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      page ===
                      pagination?.totalPages
                    }
                    onClick={() =>
                      setPage((prev) => prev + 1)
                    }
                    className="px-4 py-2 rounded-lg bg-[#111827] border border-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Sessions;