import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  // Check token expiration on mount and after login
  useEffect(() => {
    checkTokenExpiration();

    // Set up interval to check token every 24 hours
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(tokenCheckInterval);
  }, [user]);

  // Simplified function to check if token is expired
  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Get the login timestamp
      const loginTimestamp = localStorage.getItem("loginTimestamp");

      // If no timestamp exists, set one now
      if (!loginTimestamp) {
        localStorage.setItem("loginTimestamp", Date.now().toString());
        return true;
      }

      // Check if 24 hours have passed since login
      const tokenAge = Date.now() - parseInt(loginTimestamp);
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (tokenAge >= oneDayInMs) {
        logout("Your session has expired. Please sign in again.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // In case of error, don't log the user out
    }
  };

  const login = async (userData) => {
    try {
      // Store user and token from the API response
      setUser(userData.user);
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("token", userData.accessToken);
      localStorage.setItem("loginTimestamp", Date.now().toString());

      // Log for debugging
      console.log("Login successful:", userData);

      // Check if user is admin and redirect accordingly
      if (
        userData.user.role_id === 1 ||
        (userData.user.role && userData.user.role.role_name === "admin")
      ) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = (message) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("loginTimestamp");

    // Show message if provided
    if (message) {
      toast.error(message);
    }

    navigate("/");
  };

  // For consistent method naming across the app
  const logout = handleLogout;

  const isAuthenticated = () => {
    return !!user && checkTokenExpiration();
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.role_id === 1 || (user.role && user.role.role_name === "admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        checkTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
