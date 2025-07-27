import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { Home, User, LogOut, Settings } from "lucide-react";

const UserSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Handle username update
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.lacehub.cz/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const updatedUser = { ...user, username };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error(error.message || "Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://api.lacehub.cz/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.lacehub.cz/users/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Your account has been deleted");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 mb-8 md:mb-0">
          <div className="bg-primary-800 rounded-lg p-6">
            <div className="flex flex-col space-y-2">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-primary-700 rounded-full overflow-hidden border-2 border-secondary-500">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-center mt-3">
                  {user?.username || "User"}
                </h2>
                <p className="text-sm text-gray-400 text-center">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Home size={18} />
                <span>Homepage</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Settings size={18} />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={() => logout()}
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-accent-700 hover:text-white transition-colors text-left"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-8">
          <div className="bg-primary-800 rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6">User Settings</h1>

            {/* Username Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-secondary-400">
                Username
              </h2>
              <form onSubmit={handleUsernameUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    placeholder="Enter username"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This is your public username
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Update Username"}
                  </button>
                </div>
              </form>
            </section>

            {/* Password Change Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-secondary-400">
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </section>

            {/* Delete Account Section */}
            <section className="border-t border-primary-600 pt-8">
              <h2 className="text-xl font-semibold mb-4 text-accent-500">
                Delete Account
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-accent-900/30 p-4 rounded-md border border-accent-800">
                  <p className="text-sm mb-4">
                    Please type <strong>DELETE</strong> to confirm account
                    deletion
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="flex-1 min-w-[200px] px-4 py-2 bg-primary-700 border border-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                      placeholder="Type DELETE"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={
                          isSubmitting || deleteConfirmText !== "DELETE"
                        }
                        className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSettings;
