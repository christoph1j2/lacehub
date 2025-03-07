import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  fetchAllUsers,
  fetchActiveUsers,
  fetchInactiveUsers,
  fetchBannedUsers,
  banUser,
  unbanUser,
} from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // Fetch users based on active tab
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        let fetchedUsers = [];

        switch (activeTab) {
          case "active":
            fetchedUsers = await fetchActiveUsers();
            break;
          case "inactive":
            fetchedUsers = await fetchInactiveUsers();
            break;
          case "banned":
            fetchedUsers = await fetchBannedUsers();
            break;
          case "all":
          default:
            fetchedUsers = await fetchAllUsers();
            break;
        }

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        setTotalPages(Math.ceil(fetchedUsers.length / usersPerPage));
        setCurrentPage(1); // Reset to first page when changing tabs
      } catch (error) {
        console.error("Error fetching users:", error);
        toast("Failed to load users", {
          description: "Please try again later",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  // Filter users by search term
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
      setTotalPages(Math.ceil(users.length / usersPerPage));
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / usersPerPage));
    setCurrentPage(1); // Reset to first page when searching
  }, [search, users]);

  // Handle banning a user
  const handleBanUser = async (userId) => {
    try {
      await banUser(userId);

      // Update user list to reflect the ban
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_banned: true } : user
        )
      );

      toast("User banned successfully", {
        type: "success",
      });

      // If on the banned tab, refresh the data to show updated banned users
      if (activeTab === "banned") {
        const bannedUsers = await fetchBannedUsers();
        setUsers(bannedUsers);
        setFilteredUsers(bannedUsers);
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast("Failed to ban user", {
        description: "Please try again later",
        type: "error",
      });
    }
  };

  // Handle unbanning a user
  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId);

      // Update user list to reflect the unban
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_banned: false } : user
        )
      );

      toast("User unbanned successfully", {
        type: "success",
      });

      // If on the banned tab, refresh the data to show updated banned users
      if (activeTab === "banned") {
        const bannedUsers = await fetchBannedUsers();
        setUsers(bannedUsers);
        setFilteredUsers(bannedUsers);
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast("Failed to unban user", {
        description: "Please try again later",
        type: "error",
      });
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate the current displayed users based on pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Calculate user stats
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => user.verified && !user.is_banned
  ).length;
  const inactiveUsers = users.filter(
    (user) => !user.verified && !user.is_banned
  ).length;
  const bannedUsers = users.filter((user) => user.is_banned).length;

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-primary-500">Manage your platform users.</p>
      </div>

      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <h3 className="text-sm font-medium text-primary-500">Total Users</h3>
          <p className="text-2xl font-bold text-primary-900 mt-2">
            {totalUsers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <h3 className="text-sm font-medium text-primary-500">Active Users</h3>
          <p className="text-2xl font-bold text-primary-900 mt-2">
            {activeUsers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <h3 className="text-sm font-medium text-primary-500">
            Inactive Users
          </h3>
          <p className="text-2xl font-bold text-primary-900 mt-2">
            {inactiveUsers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
          <h3 className="text-sm font-medium text-primary-500">Banned Users</h3>
          <p className="text-2xl font-bold text-primary-900 mt-2">
            {bannedUsers}
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow-sm border border-primary-200">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Users</h3>
          <p className="text-sm text-primary-500 mb-6">
            Manage your platform users here.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex space-x-2 flex-wrap">
                {["all", "active", "inactive", "banned"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === tab
                        ? "bg-secondary-500 text-white"
                        : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      Registration Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-primary-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.is_banned
                                ? "bg-accent-100 text-accent-800"
                                : user.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.is_banned
                              ? "Banned"
                              : user.verified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.is_banned ? (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                            >
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-primary-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-primary-500">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
