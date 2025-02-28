import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Contacts from "./pages/contacs/Contacts.jsx";
import BaseLayout from "./layout/BaseLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/homepage/Index.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./index.css";

//Admin routes

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="contacts" element={<Contacts />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
