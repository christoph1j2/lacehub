import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  HelpCircle,
  Settings,
  LifeBuoy,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../registration/useAuth";
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wtb"); // default tab
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // API endpoints
  const apiEndpoints = {
    wtb: "https://api.lacehub.cz/wtb/user",
    wts: "https://api.lacehub.cz/wts/user",
    inventory: "https://api.lacehub.cz/user-inventory/user",
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await fetch(apiEndpoints[activeTab], {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
        setData([]);
        if (err.message === "No authentication token found") {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, navigate]);
  const handleMatchWTB = async () => {
    setMatchingStatus("matching");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api.lacehub.cz/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Matching process failed");
      }
      const result = await response.json();
      setMatchingStatus("success");
      console.log(result);
    } catch (err) {
      setMatchingStatus("error");
      console.error("Matching error:", err);
    }
  };
  if (!user) {
    navigate("/");
    return null;
  }
  const navItems = [
    { name: "Homepage", icon: Home, path: "/" },
    { name: "How it works", icon: HelpCircle },
    { name: "Settings", icon: Settings },
    { name: "Support", icon: LifeBuoy },
  ];
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">LaceHub</h1>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
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
            className="mt-auto flex items-center space-x-3 text-gray-600 hover:text-gray-900 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search for your sneaker"
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <User className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Tabs and Action Button */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {["WTB list", "WTS list", "Inventory"].map((tab) => {
                    const tabKey = tab.toLowerCase().split(" ")[0];
                    return (
                      <button
                        key={tab}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          activeTab === tabKey
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveTab(tabKey)}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleMatchWTB}
                  disabled={matchingStatus === "matching"}
                  className="min-w-[200px] px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {matchingStatus === "matching"
                    ? "Matching..."
                    : "Match your WTB list"}
                </button>
              </div>
            </div>
            {/* Status Messages */}
            {matchingStatus === "error" && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">
                  {" "}
                  The matching process failed. Please try again later.
                </span>
              </div>
            )}
            {matchingStatus === "success" && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">
                  {" "}
                  Matching process completed successfully.
                </span>
              </div>
            )}
            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-lg text-blue-500 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              ) : data.length > 0 ? (
                <ul className="space-y-4">
                  {data.map((item, index) => (
                    <li
                      key={index}
                      className="bg-gray-50 border rounded-lg p-4"
                    >
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="font-medium text-gray-800">No data available</p>
                  <p className="text-gray-600">
                    Your {activeTab} data will be displayed here once you add
                    some items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
