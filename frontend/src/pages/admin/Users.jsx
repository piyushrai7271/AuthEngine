// pages/admin/Users.jsx

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";

import {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../../services/admin.service";

const Users = () => {
  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [blockedFilter, setBlockedFilter] =
    useState("");

  const [page, setPage] = useState(1);

  // 👥 fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const data = await getAllUsers({
          page,
          limit: 10,
          search,
          blocked: blockedFilter,
        });

        setUsers(data.users);

        setPagination(data.pagination);
      } catch (error) {
        setError(
          error.message || "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, blockedFilter]);

  // 🚫 block user
  const handleBlockUser = async (userId) => {
    const confirmBlock = window.confirm(
      "Are you sure you want to block this user?"
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(userId);

      await blockUser(userId);

      // optimistic update
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: true }
            : user
        )
      );

      toast.success("User blocked successfully");
    } catch (error) {
      toast.error(
        error.message || "Failed to block user"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ✅ unblock user
  const handleUnblockUser = async (userId) => {
    const confirmUnblock = window.confirm(
      "Are you sure you want to unblock this user?"
    );

    if (!confirmUnblock) return;

    try {
      setActionLoading(userId);

      await unblockUser(userId);

      // optimistic update
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: false }
            : user
        )
      );

      toast.success(
        "User unblocked successfully"
      );
    } catch (error) {
      toast.error(
        error.message || "Failed to unblock user"
      );
    } finally {
      setActionLoading("");
    }
  };

  // 🗑️ delete user
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(userId);

      await deleteUser(userId);

      // remove deleted user instantly
      setUsers((prev) =>
        prev.filter((user) => user._id !== userId)
      );

      // update pagination count
      setPagination((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
      }));

      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(
        error.message || "Failed to delete user"
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
          Users Management
        </h1>

        <p className="text-gray-400 mt-2">
          Manage all registered users
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none w-full md:w-80"
        />

        {/* BLOCK FILTER */}
        <select
          value={blockedFilter}
          onChange={(e) => {
            setPage(1);
            setBlockedFilter(e.target.value);
          }}
          className="bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none w-full md:w-52"
        >
          <option value="">All Users</option>

          <option value="false">
            Active Users
          </option>

          <option value="true">
            Blocked Users
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
        <Loader text="Loading users..." />
      ) : (
        <>
          {/* EMPTY */}
          {users.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-10 text-center text-gray-400">
              No users found
            </div>
          ) : (
            <>
              {/* TABLE */}
              <Table
                columns={[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Providers",
                  "Created",
                  "Actions",
                ]}
              >
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-800 hover:bg-[#111827]"
                  >
                    {/* NAME */}
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {user.fullName}
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-gray-300">
                      {user.email || "N/A"}
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-4 capitalize">
                      {user.role}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBlocked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {user.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    {/* PROVIDERS */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.providers?.map((provider) => (
                          <span
                            key={provider.provider}
                            className="px-2 py-1 rounded-lg bg-[#1f2937] text-xs text-gray-300"
                          >
                            {provider.provider}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        {user.isBlocked ? (
                          <button
                            disabled={
                              actionLoading === user._id
                            }
                            onClick={() =>
                              handleUnblockUser(
                                user._id
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            {actionLoading ===
                            user._id
                              ? "Processing..."
                              : "Unblock"}
                          </button>
                        ) : (
                          <button
                            disabled={
                              actionLoading === user._id
                            }
                            onClick={() =>
                              handleBlockUser(
                                user._id
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
                          >
                            {actionLoading ===
                            user._id
                              ? "Processing..."
                              : "Block"}
                          </button>
                        )}

                        <button
                          disabled={
                            actionLoading === user._id
                          }
                          onClick={() =>
                            handleDeleteUser(user._id)
                          }
                          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-sm disabled:opacity-50"
                        >
                          {actionLoading === user._id
                            ? "Processing..."
                            : "Delete"}
                        </button>
                      </div>
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

export default Users;