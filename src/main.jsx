import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Contacts from "./pages/contacs/Contacts.jsx";
import BaseLayout from "./layout/BaseLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/homepage/Index.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import App from "./App.jsx";
import "./index.css";

//Admin routes
import AdminLayout from "./pages/admin/Layout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
// import AdminStatistics from "./pages/admin/Statistics.jsx";
// import AdminSettings from "./pages/admin/Settings.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App>
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

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              {/* <Route path="statistics" element={<AdminStatistics />} /> */}
              {/* <Route path="settings" element={<AdminSettings />} /> */}
            </Route>
          </Routes>
        </App>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
