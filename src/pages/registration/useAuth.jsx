import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (userData) => {
    try {
      // Store user and token from the API response
      setUser(userData.user);
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("token", userData.accessToken);

      // Log for debugging
      console.log("Login successful:", userData);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
