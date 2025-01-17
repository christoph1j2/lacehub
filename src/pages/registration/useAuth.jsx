import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user data exists in localStorage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      // Replace this with your actual API call
      const response = await fetch("https://api.lacehub.cz/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      // Handle login error (e.g., show error message to user)
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/"); // Redirect to homepage after logout
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
