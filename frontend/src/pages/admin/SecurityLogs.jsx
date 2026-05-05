// pages/admin/SecurityLogs.jsx

import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";

import { getSecurityLogs } from "../../services/admin.service";

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [actionFilter, setActionFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  // 🔐 fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const data = await getSecurityLogs({
          page,
          limit: 20,
          action: actionFilter,
          status: statusFilter,
        });

        setLogs(data.logs);

        setPagination(data.pagination);
      } catch (error) {
        setError(
          error.message ||
            "Failed to fetch security logs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, actionFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Security Logs
        </h1>

        <p className="text-gray-400 mt-2">
          Monitor authentication and admin
          activities
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* ACTION FILTER */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setPage(1);
            setActionFilter(e.target.value);
          }}
          className="bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none w-full md:w-72"
        >
          <option value="">
            All Actions
          </option>

          <option value="USER_BLOCKED">
            USER_BLOCKED
          </option>

          <option value="USER_UNBLOCKED">
            USER_UNBLOCKED
          </option>

          <option value="USER_DELETED">
            USER_DELETED
          </option>

          <option value="SESSION_REVOKED">
            SESSION_REVOKED
          </option>
        </select>

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none w-full md:w-52"
        >
          <option value="">
            All Status
          </option>

          <option value="SUCCESS">
            SUCCESS
          </option>

          <option value="FAILED">
            FAILED
          </option>
        </select>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <Loader text="Loading security logs..." />
      ) : (
        <>
          {/* EMPTY */}
          {logs.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-10 text-center text-gray-400">
              No security logs found
            </div>
          ) : (
            <>
              {/* TABLE */}
              <Table
                columns={[
                  "Action",
                  "Status",
                  "Performed By",
                  "Target User",
                  "IP Address",
                  "Message",
                  "Created",
                ]}
              >
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-gray-800 hover:bg-[#111827]"
                  >
                    {/* ACTION */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium">
                        {log.action}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === "SUCCESS"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>

                    {/* PERFORMED BY */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">
                          {log.performedBy
                            ?.fullName || "N/A"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {log.performedBy?.email}
                        </p>
                      </div>
                    </td>

                    {/* TARGET USER */}
                    <td className="px-5 py-4">
                      {log.targetUser ? (
                        <div>
                          <p className="font-medium">
                            {
                              log.targetUser
                                ?.fullName
                            }
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              log.targetUser
                                ?.email
                            }
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          N/A
                        </span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {log.ipAddress || "N/A"}
                    </td>

                    {/* MESSAGE */}
                    <td className="px-5 py-4 text-sm text-gray-300 max-w-xs">
                      {log.message}
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(
                        log.createdAt
                      ).toLocaleString()}
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

export default SecurityLogs;