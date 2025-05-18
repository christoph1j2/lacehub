import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  HelpCircle,
  // Settings, // Removed as per request
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import SearchBar from "../pages/user/SearchBar.jsx";

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Handle clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  if (!user) {
    navigate("/");
    return null;
  }

  const navItems = [
    { name: "Homepage", icon: Home, path: "/" },
    { name: "How it works", icon: HelpCircle, path: "/how-it-works" }, // Added path
    // { name: "Settings", icon: Settings }, // Removed as per request
    { name: "Support", icon: LifeBuoy, path: "/contacts" }, // Assuming 'contacts' is the support page
  ];

  return (
    <div className="flex min-h-screen bg-primary-100">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Component */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-primary-800 text-white shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6">
          <button
            className="absolute top-4 right-4 p-1 rounded-full bg-primary-700 text-white md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-secondary-500">LaceHub</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center w-full p-3 rounded-lg text-white hover:bg-primary-700 hover:pl-4 transition-all duration-200"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="mt-auto flex items-center w-full p-3 rounded-lg text-white hover:bg-primary-700 hover:pl-4 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-primary-100">
        {/* Header Component */}
        <header className="bg-primary-800 shadow-md p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3 md:hidden">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-white hover:bg-primary-700 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={() => navigate("/settings")} // This button still navigates to /settings. You might want to change or remove it.
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg hover:bg-primary-100 transition-all duration-200"
              >
                <span className="text-sm text-primary-800">
                  Welcome {user?.username}
                </span>
                <User className="h-5 w-5 text-primary-800" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <SearchBar onAddItem={() => {}} />
              </div>

              <button
                onClick={() => navigate("/settings")} // This button also still navigates to /settings.
                className="hidden md:flex items-center gap-2 bg-white px-4 py-3 rounded-lg hover:bg-primary-100 transition-all duration-200 ml-auto"
              >
                <span className="whitespace-nowrap text-primary-800">
                  Welcome {user?.username}
                </span>
                <User className="h-5 w-5 text-primary-800" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-primary-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
