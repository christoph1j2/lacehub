import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Contacts from "./pages/contacs/Contacts.jsx";
import BaseLayout from "./layout/BaseLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Homepage from "./pages/homepage/Index.jsx";
import { AuthProvider } from "./pages/registration/useAuth.jsx";
// import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="contacts" element={<Contacts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
