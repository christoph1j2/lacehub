import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Contacts from "./pages/contacts/Contacts.jsx";
import AboutUs from "./pages/about-us/AboutUs.jsx";
import HowItWork from "./pages/how-it-works/HowItWorks.jsx";
import BaseLayout from "./layout/BaseLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/homepage/Index.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import Dashboard from "./pages/user/Dashboard.jsx";
import UserSettings from "./pages/user-settings/UserSettings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import App from "./App.jsx";
import "./index.css";

import NotFound from "./pages/errors/NotFound.jsx";

//Admin routes
import AdminLayout from "./layout/AdminLayout.jsx";
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
              <Route path="how-it-works" element={<HowItWork />} />
              <Route path="about-us" element={<AboutUs />} />
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
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </App>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
