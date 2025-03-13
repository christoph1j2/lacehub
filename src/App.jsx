import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";

// Create a component to listen for auth events
const AuthListener = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = (event) => {
      logout(event.detail.message);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  return null;
};

function App({ children }) {
  return (
    <>
      <AuthListener />
      <Toaster position="top-right" />
      {children}
    </>
  );
}

export default App;
