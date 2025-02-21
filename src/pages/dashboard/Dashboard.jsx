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
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-secondary-500 text-white p-2 rounded-lg shadow-lg hover:bg-secondary-600"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 bg-primary-600 text-white shadow-xl transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">LaceHub</h1>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 text-white w-full p-3 rounded-lg bg-primary-700 hover:bg-primary-800 transition-colors"
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
            className="mt-auto flex items-center space-x-3 text-white w-full p-3 rounded-lg bg-primary-800 hover:bg-primary-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col w-full md:w-[calc(100%-16rem)] ml-0 md:ml-64 bg-primary-50">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search for your sneaker"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
            </div>
            <div className="flex items-center gap-3 bg-primary-500 text-white px-4 py-2 rounded-lg">
              <span>Welcome, {user?.username}</span>
              <User className="h-6 w-6" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Tabs and Action Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {["WTB list", "WTS list", "Inventory"].map((tab) => {
                    const tabKey = tab.toLowerCase().split(" ")[0];
                    return (
                      <button
                        key={tab}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === tabKey
                            ? "bg-secondary-500 text-white"
                            : "bg-primary-100 text-primary-900 hover:bg-primary-200"
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
                  className="min-w-[200px] px-6 py-3 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                className="bg-extraColor1-100 border-l-4 border-extraColor1-500 text-extraColor1-700 px-4 py-3 rounded shadow-md"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">
                  {" "}
                  The matching process failed. Please try again later.
                </span>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Dashboard
              </h2>
              <p className="text-primary-700 mb-6">
                Welcome to your {activeTab} dashboard. Here you can manage your
                sneaker collection and trades.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-lg text-primary-600 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div className="bg-extraColor1-100 border-l-4 border-extraColor1-500 text-extraColor1-700 px-4 py-3 rounded shadow-md">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              ) : data.length > 0 ? (
                <ul className="space-y-4">
                  {data.map((item, index) => (
                    <li
                      key={index}
                      className="bg-primary-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-primary-200"
                    >
                      <h3 className="font-bold text-primary-900">
                        {item.title}
                      </h3>
                      <p className="text-primary-700">{item.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-primary-50 rounded-lg p-4 shadow-md">
                  <p className="font-medium text-primary-900">
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
