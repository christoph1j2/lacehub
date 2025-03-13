import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { User, LogOut, Users, Home, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = () => {
      setIsChecking(true);

      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/");
        return;
      }

      if (!isAdmin()) {
        toast.error("You don't have permission to access this page");
        navigate("/");
        return;
      }

      setIsChecking(false);
    };

    checkAdminStatus();
  }, [user, navigate, isAdmin]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !isSidebarOpen ||
        (sidebarRef.current && sidebarRef.current.contains(event.target))
      ) {
        return;
      }
      // Only close on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/");
  };

  const getNavLinkClass = (isActive) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
      isActive
        ? "bg-primary-800 text-white"
        : "text-primary-700 hover:bg-primary-200"
    }`;
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-primary-100">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 border-r border-primary-200 bg-white shadow-lg md:shadow-none transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close button - Only visible on mobile */}
          <button
            className="absolute top-4 right-4 p-1 rounded-full bg-primary-100 text-primary-700 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="py-4 mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary-800 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">LaceHub</h2>
                <p className="text-sm text-primary-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-3">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <Home size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <Users size={18} />
              Users
            </NavLink>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm text-primary-700 hover:bg-primary-200 transition-all mt-auto mx-3"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="p-4 border-b border-primary-200 bg-white md:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-primary-800 ml-4">
              Admin Panel
            </h1>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
