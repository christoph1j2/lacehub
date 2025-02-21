import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  const [activeTab, setActiveTab] = useState("wtb");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-secondary-600 text-white p-2 rounded-lg shadow-lg hover:bg-secondary-700 transition-all duration-300 transform hover:scale-105"
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
        } md:translate-x-0 w-64 bg-gradient-to-b from-secondary-700 to-secondary-800 text-white shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white bg-secondary-600 p-3 rounded-lg shadow-md">
              LaceHub
            </h1>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 text-white w-full p-3 rounded-lg 
                    transition-all duration-300 transform hover:scale-105
                    bg-gradient-to-r from-secondary-600 to-secondary-700
                    hover:from-secondary-500 hover:to-secondary-600 shadow-md"
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
            className="mt-auto flex items-center space-x-3 text-white w-full p-3 rounded-lg
              transition-all duration-300 transform hover:scale-105
              bg-gradient-to-r from-extraColor1-600 to-extraColor1-700
              hover:from-extraColor1-700 hover:to-extraColor1-800 shadow-md"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-lg p-4 border-b border-primary-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search for your sneaker"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-300 
                  focus:ring-2 focus:ring-secondary-500 focus:border-transparent
                  transition-all duration-300 shadow-sm hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary-200 to-primary-300 px-6 py-3 rounded-lg shadow-md">
              <span className="text-primary-900 font-medium">
                Welcome, {user?.username}
              </span>
              <div className="p-2 bg-white rounded-full shadow-md">
                <User className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Tabs and Action Button */}
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border border-primary-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {["WTB list", "WTS list", "Inventory"].map((tab) => {
                    const tabKey = tab.toLowerCase().split(" ")[0];
                    return (
                      <button
                        key={tab}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${
                          activeTab === tabKey
                            ? "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white"
                            : "bg-gradient-to-r from-primary-200 to-primary-300 text-primary-900 hover:from-primary-300 hover:to-primary-400"
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
                  className="min-w-[200px] px-6 py-3 rounded-lg font-medium 
                    transition-all duration-300 transform hover:scale-105
                    bg-gradient-to-r from-accent-500 to-accent-600
                    hover:from-accent-600 hover:to-accent-700
                    text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:scale-100 whitespace-nowrap"
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
                className="bg-gradient-to-r from-extraColor1-100 to-extraColor1-200 
                  border-l-4 border-extraColor1-600 text-extraColor1-700 
                  px-4 py-3 rounded-lg shadow-md mb-6"
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
                className="bg-gradient-to-r from-primary-100 to-primary-200 
                  border-l-4 border-primary-600 text-primary-700 
                  px-4 py-3 rounded-lg shadow-md mb-6"
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
            <div className="bg-white rounded-xl shadow-xl p-6 border border-primary-200">
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-primary-700 mb-6">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto"></div>
                  <p className="text-lg text-secondary-600 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div
                  className="bg-gradient-to-r from-extraColor1-100 to-extraColor1-200 
                    border-l-4 border-extraColor1-600 text-extraColor1-700 
                    px-4 py-3 rounded-lg shadow-md"
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
                      className="bg-gradient-to-r from-primary-100 to-primary-200 
                        rounded-lg p-4 shadow-md hover:shadow-xl transition-all 
                        duration-300 transform hover:scale-102 border border-primary-300"
                    >
                      <h3 className="font-bold text-secondary-800">
                        {item.title}
                      </h3>
                      <p className="text-primary-700">{item.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg p-6 shadow-md">
                  <p className="font-medium text-secondary-800">
                    No data available
                  </p>
                  <p className="text-primary-700">
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
